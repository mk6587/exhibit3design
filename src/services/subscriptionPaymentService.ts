// YekPay Subscription Payment Service
// Handles subscription purchases through YekPay gateway

import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionCustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  address: string;
  postalCode: string;
  country: string;
  city: string;
}

interface SubscriptionPaymentRequest {
  planId: string;
  planName: string;
  amount: number;
  billingPeriod: string;
  customerInfo: SubscriptionCustomerInfo;
}

// Generate unique subscription order number with collision check
const generateSubscriptionOrderNumber = async (): Promise<string> => {
  let orderNumber: string;
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 999999) + 100000; // 6-digit random number
    const uniqueSuffix = Math.random().toString(36).substring(2, 8).toUpperCase(); // Additional random string
    orderNumber = `SUB-${timestamp}-${random}-${uniqueSuffix}`;
    
    // Check if this order number already exists
    const { data, error } = await supabase
      .from('subscription_orders')
      .select('order_number')
      .eq('order_number', orderNumber)
      .maybeSingle();
    
    if (error) {
      console.error("Error checking order number uniqueness:", error);
      attempts++;
      continue;
    }
    
    // If no existing order found, we have a unique number
    if (!data) {
      return orderNumber;
    }
    
    attempts++;
  }
  
  throw new Error("Failed to generate unique order number after multiple attempts");
};

// Create subscription order in database before payment
const createPendingSubscriptionOrder = async (
  paymentData: SubscriptionPaymentRequest,
  orderNumber: string
) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error("You must be logged in to purchase a subscription.");
    }

    // Create subscription order record
    const orderData = {
      user_id: user.id,
      plan_id: paymentData.planId,
      amount: paymentData.amount,
      status: 'pending',
      payment_method: 'yekpay',
      order_number: orderNumber,
      customer_first_name: paymentData.customerInfo.firstName,
      customer_last_name: paymentData.customerInfo.lastName,
      customer_email: paymentData.customerInfo.email,
      customer_mobile: paymentData.customerInfo.mobile,
      customer_address: paymentData.customerInfo.address,
      customer_postal_code: paymentData.customerInfo.postalCode,
      customer_country: paymentData.customerInfo.country,
      customer_city: paymentData.customerInfo.city,
      payment_description: `Subscription: ${paymentData.planName} (${paymentData.billingPeriod})`
    };

    const { data, error } = await supabase
      .from('subscription_orders')
      .insert(orderData)
      .select()
      .single();

    if (error) {
      console.error("Failed to create subscription order:", error);
      throw new Error("Unable to create subscription order. Please try again.");
    }

    return data;
  } catch (error) {
    console.error("Error in createPendingSubscriptionOrder:", error);
    throw error;
  }
};

// Activate subscription after successful payment
// SECURITY: Uses secure edge function with service role credentials
export const activateSubscription = async (
  orderNumber: string,
  planId: string
) => {
  try {
    console.log("🔐 Activating subscription via secure edge function...");
    
    // Call secure edge function that uses service role credentials
    const { data, error } = await supabase.functions.invoke('activate-subscription', {
      body: { 
        orderNumber,
        planId 
      }
    });

    if (error) {
      console.error("❌ Subscription activation failed:", error);
      throw new Error(error.message || "Failed to activate subscription");
    }

    if (!data?.success) {
      console.error("❌ Subscription activation returned failure:", data);
      throw new Error(data?.error || "Failed to activate subscription");
    }

    console.log("✅ Subscription activated successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Error activating subscription:", error);
    throw error;
  }
};

// Initiate subscription payment via YekPay
export const initiateSubscriptionPayment = async (
  paymentData: SubscriptionPaymentRequest
): Promise<void> => {
  try {
    console.log("🎯 Initiating subscription payment...");
    console.log("📦 Payment data:", paymentData);
    
    const orderNumber = await generateSubscriptionOrderNumber();
    console.log("📝 Generated unique order number:", orderNumber);

    // Create pending order
    console.log("💾 Creating pending subscription order...");
    const order = await createPendingSubscriptionOrder(paymentData, orderNumber);
    console.log("✅ Pending subscription order created:", order);

    // Prepare YekPay form data matching PHP script expectations
    const fields = {
      initiate_payment: '1', // Required by PHP script to trigger payment flow
      amount: paymentData.amount.toString(),
      order_number: orderNumber,
      first_name: paymentData.customerInfo.firstName,
      last_name: paymentData.customerInfo.lastName,
      email: paymentData.customerInfo.email,
      mobile: paymentData.customerInfo.mobile,
      address: paymentData.customerInfo.address,
      postal_code: paymentData.customerInfo.postalCode,
      country: paymentData.customerInfo.country,
      city: paymentData.customerInfo.city,
      description: `Subscription: ${paymentData.planName}`,
      success_url: `${window.location.origin}/payment-success`,
      cancel_url: `${window.location.origin}/payment-cancelled`,
      failed_url: `${window.location.origin}/payment-failed`,
      error_url: `${window.location.origin}/payment-error`
    };

    console.log("🚀 Submitting to YekPay gateway via form...");
    console.log("📋 Form fields:", fields);

    // Create a form to submit to YekPay (handles 302 redirects properly)
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://pay.exhibit3design.com/yekpay.php';
    form.style.display = 'none';

    // Add all form fields
    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
      console.log(`📝 Added field: ${key} = ${value}`);
    });

    // Append form to body and submit
    document.body.appendChild(form);
    console.log("✅ Form appended to body, about to submit...");
    console.log("🌐 Form action:", form.action);
    console.log("📨 Form method:", form.method);
    
    form.submit();
    console.log("✅ Form submitted!");

  } catch (error: any) {
    console.error("❌ Subscription payment error:", error);
    console.error("❌ Error stack:", error.stack);
    toast.error(error.message || "Failed to process subscription payment");
    throw error;
  }
};

// Update subscription order status
export const updateSubscriptionOrderStatus = async (
  orderNumber: string,
  status: 'completed' | 'failed' | 'cancelled' | 'error',
  authority?: string,
  reference?: string
): Promise<void> => {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (authority) updateData.authority = authority;
    if (reference) updateData.yekpay_reference = reference;

    const { error } = await supabase
      .from('subscription_orders')
      .update(updateData)
      .eq('order_number', orderNumber);

    if (error) {
      console.error("Failed to update subscription order:", error);
      throw error;
    }

    console.log(`✅ Subscription order ${orderNumber} updated to ${status}`);
  } catch (error) {
    console.error("Error updating subscription order:", error);
    throw error;
  }
};
