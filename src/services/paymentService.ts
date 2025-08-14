
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
    console.log("Creating order - step 1");
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log("Creating order - step 2");
    if (authError) {
      console.error("Auth error in createOrder:", authError);
      throw new Error("Please sign in to create an order");
    }
    
    if (!user) {
      console.error("No user in createOrder");
      throw new Error("You must be signed in to complete your purchase");
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
      throw new Error("Unable to create your order. Please try again or contact support.");
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

// Submit payment to YekPay backend
export const initiatePayment = async (paymentData: PaymentRequest) => {
  try {
    console.log("🚀 Starting payment initiation process");
    console.log("💰 Payment data:", JSON.stringify(paymentData, null, 2));
    
    // Check authentication first
    console.log("🔐 Checking authentication...");
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("❌ Auth failed:", authError);
      throw new Error("Please sign in to complete your purchase");
    }
    console.log("✅ Authentication successful for user:", user.email);

    // Generate unique order number
    const orderNumber = generateOrderNumber();
    console.log("📝 Generated order number:", orderNumber);
    
    // Create pending order in database
    console.log("📊 Creating pending order in database...");
    await createPendingOrder(paymentData, orderNumber);
    console.log("✅ Order created successfully");
    
    // Prepare form data for YekPay
    console.log("📦 Preparing form data for YekPay...");
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
    
    // Add success and cancel URLs
    const successUrl = `${window.location.origin}/payment-success`;
    const cancelUrl = `${window.location.origin}/payment-cancelled`;
    
    formData.append('success_url', successUrl);
    formData.append('cancel_url', cancelUrl);
    formData.append('callback_url', successUrl);
    formData.append('return_url', successUrl);
    formData.append('cancel_return_url', cancelUrl);
    
    console.log("🔗 Success URL:", successUrl);
    console.log("❌ Cancel URL:", cancelUrl);

    // Log all form data being sent
    console.log("📤 Form data being sent to YekPay:");
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    console.log("🌐 Making request to YekPay endpoint...");
    console.log("🎯 Endpoint URL: https://pay.exhibit3design.com/yekpay.php");
    
    let response;
    try {
      // First, let's test if the endpoint is reachable
      console.log("🧪 Testing endpoint accessibility...");
      
      response = await fetch('https://pay.exhibit3design.com/yekpay.php', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; Exhibit3Design/1.0)',
        },
        // Add timeout and other fetch options for better debugging
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });
      console.log("✅ Fetch request completed");
      console.log("📊 Response status:", response.status);
      console.log("📋 Response headers:", Object.fromEntries(response.headers.entries()));
    } catch (fetchError) {
      console.error("❌ Fetch request failed:");
      console.error("   Error type:", fetchError?.constructor?.name);
      console.error("   Error message:", fetchError instanceof Error ? fetchError.message : String(fetchError));
      console.error("   Full error:", fetchError);
      
      // More specific error handling
      if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
        // Network connectivity issue
        console.error("🌐 Network connectivity issue detected");
        throw new Error("Unable to connect to the payment system. Please check your internet connection and try again.");
      } else if (fetchError.name === 'AbortError') {
        throw new Error("The payment request timed out. Please try again.");
      } else {
        throw new Error("Connection failed. Please check your internet connection and try again.");
      }
    }

    // Check if the response is OK (HTTP status 200-299)
    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
      } catch (textError) {
        errorText = "Unable to read error response";
      }
      console.error("❌ HTTP error! Status:", response.status);
      console.error("❌ Response body:", errorText);
      throw new Error("The payment system is temporarily unavailable. Please try again later.");
    }

    // Check content type before parsing
    const contentType = response.headers.get('content-type');
    console.log("📄 Response content-type:", contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      let responseText;
      try {
        responseText = await response.text();
      } catch (textError) {
        responseText = "Unable to read response";
      }
      console.error("❌ Unexpected response type:", contentType);
      console.error("❌ Response body:", responseText);
      throw new Error("The payment system returned an unexpected response. Please try again.");
    }

    // Parse JSON response
    let result;
    try {
      result = await response.json();
      console.log("✅ Successfully parsed JSON response:", result);
    } catch (jsonError) {
      console.error("❌ Failed to parse JSON response:", jsonError);
      const responseText = await response.text();
      console.error("❌ Raw response:", responseText);
      throw new Error("The payment system returned an invalid response. Please try again.");
    }
    
    // Check for redirect URL in response
    if (result.redirect_url) {
      console.log("🔗 Redirect URL received:", result.redirect_url);
      console.log("🚀 Initiating redirect to payment gateway...");
      
      // Programmatic redirect to payment gateway
      window.location.href = result.redirect_url;
      
      return { 
        success: true, 
        orderNumber,
        message: "Redirecting to payment gateway..." 
      };
    } else {
      // Handle error responses from YekPay
      const errorMessage = result.message || result.error || result.status || 'Unable to process payment at this time';
      console.error("❌ Payment gateway error response:", result);
      throw new Error(`Payment failed: ${errorMessage}. Please try again or contact support.`);
    }
    
  } catch (error) {
    console.error("❌ Payment initiation failed:");
    console.error("   Error type:", error?.constructor?.name);
    console.error("   Error message:", error instanceof Error ? error.message : 'Unknown error');
    console.error("   Full error object:", error);
    
    // Re-throw the error for the UI to handle
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
    
    // Send order notification email when order is completed
    if (status === 'completed') {
      try {
        console.log('Sending order notification email for order:', orderNumber);
        
        // Get order details for email
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select(`
            *,
            products (
              title,
              price,
              specifications
            )
          `)
          .eq('order_number', orderNumber)
          .single();

        if (orderError) {
          console.error('Failed to fetch order for email:', orderError);
        } else {
          // Import and use the EmailService for order confirmation
          const { EmailService } = await import('@/services/emailService');
          const { success, error: emailError } = await EmailService.sendOrderConfirmation(orderData, orderNumber);
          
          if (!success) {
            console.error('Failed to send order notification:', emailError);
          } else {
            console.log('Order notification email sent successfully');
          }
        }
      } catch (emailError) {
        console.error('Error sending order notification email:', emailError);
        // Don't throw error - order update should still succeed even if email fails
      }
    }
    
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
      throw new Error("Your order is not ready for download. Please complete your purchase first.");
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
    toast.error("Unable to generate download link. Please contact our support team for assistance.");
    throw error;
  }
};
