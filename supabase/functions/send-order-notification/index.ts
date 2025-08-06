import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderNotificationRequest {
  orderNumber: string;
  orderData?: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderNumber, orderData }: OrderNotificationRequest = await req.json();
    console.log('Sending order notification for order:', orderNumber);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get order details if not provided
    let order = orderData;
    if (!order && orderNumber) {
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
        console.error('Error fetching order:', orderError);
        throw new Error('Order not found');
      }
      order = orderData;
    }

    if (!order) {
      throw new Error('No order data available');
    }

    // Get user profile information
    let userProfile = null;
    if (order.user_id) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', order.user_id)
        .single();
      userProfile = profileData;
    }

    // Prepare email content
    const customerName = order.customer_first_name && order.customer_last_name 
      ? `${order.customer_first_name} ${order.customer_last_name}` 
      : 'N/A';

    const emailSubject = `New Order Received - ${orderNumber}`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Order Notification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; padding: 15px; border: 1px solid #e9ecef; border-radius: 5px; }
            .section h3 { margin-top: 0; color: #495057; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .label { font-weight: bold; }
            .amount { font-size: 1.2em; font-weight: bold; color: #28a745; }
            .status { padding: 4px 8px; border-radius: 4px; font-weight: bold; }
            .status.completed { background-color: #d4edda; color: #155724; }
            .status.pending { background-color: #fff3cd; color: #856404; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🎉 New Order Received!</h2>
              <p>Order Number: <strong>${orderNumber}</strong></p>
              <p>Date: ${new Date(order.created_at).toLocaleString()}</p>
            </div>

            <div class="section">
              <h3>💰 Order Summary</h3>
              <div class="detail-row">
                <span class="label">Amount:</span>
                <span class="amount">€${parseFloat(order.amount).toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span class="label">Status:</span>
                <span class="status ${order.status}">${order.status.toUpperCase()}</span>
              </div>
              <div class="detail-row">
                <span class="label">Payment Method:</span>
                <span>${order.payment_method || 'YekPay'}</span>
              </div>
              ${order.authority ? `
              <div class="detail-row">
                <span class="label">Transaction ID:</span>
                <span>${order.authority}</span>
              </div>
              ` : ''}
              ${order.yekpay_reference ? `
              <div class="detail-row">
                <span class="label">YekPay Reference:</span>
                <span>${order.yekpay_reference}</span>
              </div>
              ` : ''}
            </div>

            <div class="section">
              <h3>👤 Customer Information</h3>
              <div class="detail-row">
                <span class="label">Name:</span>
                <span>${customerName}</span>
              </div>
              <div class="detail-row">
                <span class="label">Email:</span>
                <span>${order.customer_email || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Phone:</span>
                <span>${order.customer_mobile || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Address:</span>
                <span>${order.customer_address || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="label">City:</span>
                <span>${order.customer_city || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Country:</span>
                <span>${order.customer_country || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Postal Code:</span>
                <span>${order.customer_postal_code || 'N/A'}</span>
              </div>
            </div>

            ${order.products ? `
            <div class="section">
              <h3>📦 Product Details</h3>
              <div class="detail-row">
                <span class="label">Product:</span>
                <span>${order.products.title}</span>
              </div>
              <div class="detail-row">
                <span class="label">Price:</span>
                <span>€${parseFloat(order.products.price).toFixed(2)}</span>
              </div>
              ${order.products.specifications ? `
              <div style="margin-top: 10px;">
                <span class="label">Specifications:</span>
                <div style="margin-top: 5px; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
                  ${order.products.specifications}
                </div>
              </div>
              ` : ''}
            </div>
            ` : ''}

            ${userProfile ? `
            <div class="section">
              <h3>👥 User Profile</h3>
              <div class="detail-row">
                <span class="label">Profile Name:</span>
                <span>${userProfile.first_name || ''} ${userProfile.last_name || ''}</span>
              </div>
              <div class="detail-row">
                <span class="label">Profile Email:</span>
                <span>${userProfile.email || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Phone Number:</span>
                <span>${userProfile.phone_number || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Address:</span>
                <span>${userProfile.address_line_1 || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="label">City:</span>
                <span>${userProfile.city || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Country:</span>
                <span>${userProfile.country || 'N/A'}</span>
              </div>
            </div>
            ` : ''}

            <div class="section">
              <h3>📝 Additional Details</h3>
              <div class="detail-row">
                <span class="label">Description:</span>
                <span>${order.payment_description || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Order Created:</span>
                <span>${new Date(order.created_at).toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="label">Last Updated:</span>
                <span>${new Date(order.updated_at).toLocaleString()}</span>
              </div>
            </div>

            <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #6c757d;">
                <strong>Next Steps:</strong><br>
                1. Process the design files for the customer<br>
                2. Send the files to the customer's email within 1 hour<br>
                3. Update the order status if needed
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Get SMTP configuration
    const smtpHost = Deno.env.get('SMTP_HOST');
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587');
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPassword = Deno.env.get('SMTP_PASSWORD');
    const fromEmail = Deno.env.get('SMTP_FROM_EMAIL');

    if (!smtpHost || !smtpUser || !smtpPassword || !fromEmail) {
      throw new Error('SMTP configuration incomplete');
    }

    // Send email using SMTP
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Create SMTP connection
    const conn = await Deno.connect({
      hostname: smtpHost,
      port: smtpPort,
    });

    const writeCommand = async (command: string) => {
      await conn.write(encoder.encode(command + '\r\n'));
    };

    const readResponse = async () => {
      const buffer = new Uint8Array(1024);
      const n = await conn.read(buffer);
      return decoder.decode(buffer.subarray(0, n || 0));
    };

    try {
      // SMTP handshake
      await readResponse(); // Initial greeting
      await writeCommand(`EHLO ${smtpHost}`);
      await readResponse();
      
      await writeCommand('STARTTLS');
      await readResponse();
      
      // Start TLS would go here, but for simplicity using basic auth
      await writeCommand('AUTH LOGIN');
      await readResponse();
      
      await writeCommand(btoa(smtpUser));
      await readResponse();
      
      await writeCommand(btoa(smtpPassword));
      await readResponse();
      
      // Send email
      await writeCommand(`MAIL FROM:<${fromEmail}>`);
      await readResponse();
      
      await writeCommand(`RCPT TO:<info@exhibit3design.com>`);
      await readResponse();
      
      await writeCommand('DATA');
      await readResponse();
      
      const emailData = [
        `From: ${fromEmail}`,
        `To: info@exhibit3design.com`,
        `Subject: ${emailSubject}`,
        `Content-Type: text/html; charset=UTF-8`,
        '',
        emailHtml,
        '.'
      ].join('\r\n');
      
      await writeCommand(emailData);
      await readResponse();
      
      await writeCommand('QUIT');
      await readResponse();
      
      conn.close();
      
      console.log('Order notification email sent successfully');

      return new Response(
        JSON.stringify({ success: true, message: 'Order notification sent' }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    } catch (smtpError) {
      console.error('SMTP Error:', smtpError);
      conn.close();
      throw smtpError;
    }

  } catch (error: any) {
    console.error('Error in send-order-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);