// Direct Stripe Payment Integration Service
// Optimized for fast checkout without redirects

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User must be authenticated");
    }

    const totalAmount = paymentData.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        product_id: paymentData.orderItems[0]?.id || 0,
        amount: totalAmount,
        status: 'pending',
        payment_method: 'stripe',
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
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to create pending order:", error);
    throw error;
  }
};

// Create Stripe checkout session via Supabase Edge Function
export const createStripeCheckout = async (paymentData: PaymentRequest) => {
  try {
    // Generate unique order number
    const orderNumber = generateOrderNumber();
    
    // Create pending order in database first
    await createPendingOrder(paymentData, orderNumber);
    
    // Call Supabase Edge Function to create Stripe checkout session
    const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
      body: {
        amount: Math.round(paymentData.amount * 100), // Convert to cents
        currency: 'eur',
        orderNumber,
        customerInfo: paymentData.customerInfo,
        orderItems: paymentData.orderItems,
        description: paymentData.description
      }
    });

    if (error) throw error;
    
    return {
      success: true,
      checkoutUrl: data.url,
      orderNumber,
      sessionId: data.sessionId
    };
    
  } catch (error) {
    console.error("Stripe checkout creation failed:", error);
    toast.error("Payment setup failed. Please try again.");
    throw error;
  }
};

// Update order status based on payment result
export const updateOrderStatus = async (
  orderNumber: string, 
  status: 'completed' | 'failed' | 'cancelled' | 'error',
  stripeSessionId?: string,
  stripePaymentIntentId?: string
) => {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (stripeSessionId) updateData.stripe_session_id = stripeSessionId;
    if (stripePaymentIntentId) updateData.stripe_payment_intent_id = stripePaymentIntentId;

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

// Verify payment status via Stripe
export const verifyPaymentStatus = async (sessionId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-stripe-payment', {
      body: { sessionId }
    });

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Payment verification failed:", error);
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

    // Generate secure download link
    const downloadUrl = `/secure-download/${productId}?token=${orderNumber}&session=${order.id}`;
    
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