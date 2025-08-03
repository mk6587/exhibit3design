
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
    console.log("🔄 Creating pending order...");
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error("❌ Authentication error:", authError);
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    
    if (!user) {
      console.error("❌ No authenticated user found");
      throw new Error("User must be authenticated to create an order");
    }

    const totalAmount = paymentData.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    console.log("Creating order:", {
      user_id: user.id,
      order_number: orderNumber,
      amount: totalAmount
    });

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

    if (error) {
      console.error("Database error:", error);
      throw new Error(`Failed to create order: ${error.message}`);
    }
    
    console.log("Order created successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to create pending order:", error);
    throw error;
  }
};

// Submit payment to Stripe backend (fetch API with loading state)
export const initiatePayment = async (paymentData: PaymentRequest) => {
  try {
    // Check authentication first
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Please log in to complete your purchase");
    }

    // Generate unique order number
    const orderNumber = generateOrderNumber();
    
    // Create pending order in database
    await createPendingOrder(paymentData, orderNumber);
    
    // Prepare form data for fetch request
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

    // Send request to payment backend
    console.log("🌐 Sending request to payment gateway...");
    const response = await fetch('https://pay.exhibit3design.com/yekpay.php', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`❌ HTTP error! status: ${response.status}`);
      const responseText = await response.text();
      console.error(`Response: ${responseText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("✅ Response received, parsing JSON...");
    const result = await response.json();
    
    console.log("📊 Payment gateway response:", result);
    
    if (result.success && result.redirect_url) {
      console.log("✅ Payment gateway returned success with redirect URL");
      // Programmatically redirect to payment gateway
      window.location.href = result.redirect_url;
      
      return { 
        success: true, 
        orderNumber,
        message: "Redirecting to Stripe payment gateway...",
        redirectUrl: result.redirect_url
      };
    } else {
      console.error("❌ Payment gateway returned failure:", result);
      throw new Error(result.message || 'Payment initiation failed');
    }
    
  } catch (error) {
    console.error("Payment initiation failed:", error);
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
