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

// Generate unique subscription order number
const generateSubscriptionOrderNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 9999) + 1000;
  return `SUB-${timestamp}-${random}`;
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

    // Create order record
    const orderData = {
      user_id: user.id,
      product_id: 0, // Subscription orders don't have product_id
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
      .from('orders')
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
export const activateSubscription = async (
  orderNumber: string,
  planId: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      throw new Error("Invalid subscription plan");
    }

    // Calculate subscription period
    const now = new Date();
    const periodEnd = new Date(now);
    if (plan.billing_period === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    // Create or update subscription
    const { error: subError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: user.id,
        plan_id: planId,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false
      });

    if (subError) {
      console.error("Failed to create subscription:", subError);
      throw new Error("Failed to activate subscription");
    }

    // Grant AI tokens to profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        ai_tokens_balance: plan.initial_ai_tokens,
        ai_tokens_limit: plan.initial_ai_tokens,
        video_seconds_balance: plan.video_seconds
      })
      .eq('user_id', user.id);

    if (profileError) {
      console.error("Failed to grant tokens:", profileError);
    }

    return { success: true };
  } catch (error) {
    console.error("Error activating subscription:", error);
    throw error;
  }
};

// Initiate subscription payment via YekPay
export const initiateSubscriptionPayment = async (
  paymentData: SubscriptionPaymentRequest
): Promise<void> => {
  try {
    console.log("🎯 Initiating subscription payment...");
    
    const orderNumber = generateSubscriptionOrderNumber();
    console.log("📝 Generated order number:", orderNumber);

    // Create pending order
    const order = await createPendingSubscriptionOrder(paymentData, orderNumber);
    console.log("✅ Pending subscription order created:", order);

    // Prepare YekPay form data
    const formData = new URLSearchParams({
      fromCurrency: 'EUR',
      toCurrency: 'IRR',
      amount: paymentData.amount.toString(),
      orderNumber: orderNumber,
      callback: `${window.location.origin}/payment-success`,
      firstName: paymentData.customerInfo.firstName,
      lastName: paymentData.customerInfo.lastName,
      email: paymentData.customerInfo.email,
      mobile: paymentData.customerInfo.mobile,
      address: paymentData.customerInfo.address,
      postalCode: paymentData.customerInfo.postalCode,
      country: paymentData.customerInfo.country,
      city: paymentData.customerInfo.city,
      description: `Subscription: ${paymentData.planName}`,
      planId: paymentData.planId // Include planId for callback processing
    });

    console.log("🚀 Submitting to YekPay gateway...");

    // Submit to YekPay backend
    const response = await fetch('https://pay.exhibit3design.com/yekpay.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    if (!response.ok) {
      throw new Error(`Payment gateway error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("📥 YekPay response:", result);

    if (result.Code === 100 && result.Authority) {
      console.log("✅ Payment authority received, redirecting...");
      window.location.href = `https://gate.yekpay.com/${result.Authority}`;
    } else {
      throw new Error(result.Description || 'Payment initialization failed');
    }

  } catch (error: any) {
    console.error("❌ Subscription payment error:", error);
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
      .from('orders')
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
