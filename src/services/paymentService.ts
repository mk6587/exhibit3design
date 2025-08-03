
// YekPay Payment Gateway Integration Service
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User must be authenticated");
    }

    const totalAmount = paymentData.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        product_id: paymentData.orderItems[0]?.id || 0, // For compatibility, use first item
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

// Submit payment form to YekPay backend
export const initiatePayment = async (paymentData: PaymentRequest) => {
  try {
    // Generate unique order number
    const orderNumber = generateOrderNumber();
    
    // Create pending order in database
    await createPendingOrder(paymentData, orderNumber);
    
    // Create form and submit to YekPay backend
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://pay.exhibit3design.com/yekpay.php';
    form.style.display = 'none';

    // Add all required fields
    const fields = {
      initiate_payment: '1',
      amount: paymentData.amount.toFixed(2),
      order_number: orderNumber,
      first_name: paymentData.customerInfo.firstName,
      last_name: paymentData.customerInfo.lastName,
      email: paymentData.customerInfo.email,
      mobile: paymentData.customerInfo.mobile,
      address: paymentData.customerInfo.address,
      postal_code: paymentData.customerInfo.postalCode,
      country: paymentData.customerInfo.country,
      city: paymentData.customerInfo.city,
      description: paymentData.description
    };

    // Create hidden input fields
    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    // Append form to body and submit
    document.body.appendChild(form);
    form.submit();
    
    // Clean up
    document.body.removeChild(form);
    
    return { 
      success: true, 
      orderNumber,
      message: "Redirecting to YekPay payment gateway..." 
    };
    
  } catch (error) {
    console.error("Payment initiation failed:", error);
    toast.error("Payment initiation failed. Please try again.");
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
