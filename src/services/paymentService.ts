
// Stripe Payment Gateway Integration Service
// Integrates with pay.exhibit3design.com/yekpay.php backend endpoint

import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  address: string;
  postalCode: string;
  country: string;
  city: string;
}

interface PaymentRequest {
  amount: number;
  description: string;
  customerInfo: CustomerInfo;
  orderItems: {
    id: number;
    name: string;
    price: number;
    quantity: number;
  }[];
}

// Generate unique order number
const generateOrderNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 9999) + 1000;
  return `${timestamp}-${random}`;
};

// Create order in database before payment
const createPendingOrder = async (paymentData: PaymentRequest, orderNumber: string) => {
  try {
    console.log("Creating order - step 1");
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log("Creating order - step 2");
    if (authError) {
      console.error("Auth error in createOrder:", authError);
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    
    if (!user) {
      console.error("No user in createOrder");
      throw new Error("User must be authenticated to create an order");
    }
    console.log("Creating order - step 3");

    const totalAmount = paymentData.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    console.log("💰 Calculated total amount:", totalAmount);
    
    console.log("📝 Preparing order data...");
    const orderData = {
      user_id: user.id,
      product_id: paymentData.orderItems[0]?.id || 0,
      amount: totalAmount,
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
      payment_description: paymentData.description
    };
    
    console.log("📤 Order data prepared:", JSON.stringify(orderData, null, 2));
    console.log("🚀 Inserting into database...");

    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) {
      console.error("❌ Database error:", error);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error details:", JSON.stringify(error, null, 2));
      throw new Error(`Failed to create order: ${error.message}`);
    }
    
    console.log("✅ Order created successfully:", data);
    return data;
  } catch (error) {
    console.error("❌ Failed to create pending order:", error);
    console.error("❌ Error type:", typeof error);
    console.error("❌ Error constructor:", error?.constructor?.name);
    if (error instanceof Error) {
      console.error("❌ Error message:", error.message);
      console.error("❌ Error stack:", error.stack);
    }
    throw error;
  }
};

// Submit payment to Stripe backend (form submission - no CORS issues)
export const initiatePayment = async (paymentData: PaymentRequest) => {
  try {
    console.log("Starting payment initiation");
    
    // Check authentication first
    console.log("Checking auth");
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth failed:", authError);
      throw new Error("Please log in to complete your purchase");
    }
    console.log("Auth OK");

    // Generate unique order number
    const orderNumber = generateOrderNumber();
    console.log("Order number:", orderNumber);
    
    // Create pending order in database
    console.log("About to create order");
    await createPendingOrder(paymentData, orderNumber);
    console.log("Order created successfully");
    
    // Use fetch to get JSON response and handle redirect
    const formData = new FormData();
    formData.append('initiate_payment', '1');
    formData.append('amount', paymentData.amount.toFixed(2));
    formData.append('order_number', orderNumber);
    formData.append('first_name', paymentData.customerInfo.firstName);
    formData.append('last_name', paymentData.customerInfo.lastName);
    formData.append('email', paymentData.customerInfo.email);
    formData.append('mobile', paymentData.customerInfo.mobile);
    formData.append('address', paymentData.customerInfo.address);
    formData.append('postal_code', paymentData.customerInfo.postalCode);
    formData.append('country', paymentData.customerInfo.country);
    formData.append('city', paymentData.customerInfo.city);
    formData.append('description', paymentData.description);

    console.log("Sending request to payment gateway");
    const response = await fetch('https://pay.exhibit3design.com/yekpay.php', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Payment gateway error: ${response.status}`);
    }

    const result = await response.json();
    console.log("Payment gateway response:", result);
    
    if (result.redirect_url) {
      console.log("Redirecting to:", result.redirect_url);
      // Redirect to the payment page
      window.location.href = result.redirect_url;
      
      return { 
        success: true, 
        orderNumber,
        message: "Redirecting to payment gateway..." 
      };
    } else {
      throw new Error('No redirect URL received from payment gateway');
    }
    
  } catch (error) {
    console.error("❌ Payment initiation failed:", error);
    console.error("❌ Error message:", error instanceof Error ? error.message : 'Unknown error');
    console.error("❌ Error details:", JSON.stringify(error));
    console.error("❌ Error type:", typeof error);
    console.error("❌ Error constructor:", error?.constructor?.name);
    // Don't show toast here - let the calling component handle the error display
    throw error;
  }
};

// Update order status based on payment result
export const updateOrderStatus = async (
  orderNumber: string, 
  status: 'completed' | 'failed' | 'cancelled' | 'error',
  authority?: string,
  reference?: string
) => {
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

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update order status:", error);
    throw error;
  }
};

// Get order by order number
export const getOrderByNumber = async (orderNumber: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to get order:", error);
    throw error;
  }
};

// Generate download link for completed orders
export const generateDownloadLink = async (productId: number, orderNumber: string) => {
  try {
    // Verify order is completed
    const order = await getOrderByNumber(orderNumber);
    if (!order || order.status !== 'completed') {
      throw new Error("Order not found or not completed");
    }

    // Generate secure download link (implement based on your file storage system)
    const downloadUrl = `/secure-download/${productId}?token=${orderNumber}&ref=${order.yekpay_reference}`;
    
    return {
      success: true,
      downloadUrl,
      expiresIn: "24 hours"
    };
  } catch (error) {
    console.error("Failed to generate download link:", error);
    toast.error("Failed to generate download link. Please contact support.");
    throw error;
  }
};
