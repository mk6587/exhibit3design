import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderConfirmationRequest {
  orderNumber: string;
  orderData?: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderNumber, orderData }: OrderConfirmationRequest = await req.json();
    console.log('Sending payment confirmation email for order:', orderNumber);

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

    if (!order || !order.customer_email) {
      throw new Error('No order data or customer email available');
    }

    // Customer name for personalization
    const customerName = order.customer_first_name && order.customer_last_name 
      ? `${order.customer_first_name} ${order.customer_last_name}` 
      : order.customer_first_name || 'Valued Customer';

    // Prepare customer-facing email content
    const emailSubject = `Payment Successful - Your Design Files Are Being Prepared`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Payment Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
            .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
            .success-icon { font-size: 48px; margin-bottom: 10px; }
            .section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #28a745; }
            .section h3 { margin-top: 0; color: #495057; font-size: 18px; }
            .order-details { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e9ecef; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; align-items: center; }
            .label { font-weight: bold; color: #495057; }
            .value { color: #212529; }
            .amount { font-size: 1.3em; font-weight: bold; color: #28a745; }
            .next-steps { background: #e7f3ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0066cc; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6c757d; font-size: 14px; }
            .product-info { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; border: 1px solid #e9ecef; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="success-icon">✅</div>
              <h1>Payment Successful!</h1>
              <p>Thank you for your purchase, ${customerName}</p>
            </div>

            <div class="section">
              <h3>🎉 Your payment has been processed successfully</h3>
              <p>We're excited to prepare your design files! Your order has been confirmed and our team is already working on processing your files.</p>
            </div>

            <div class="order-details">
              <h3 style="margin-top: 0; color: #495057;">📋 Order Summary</h3>
              <div class="detail-row">
                <span class="label">Order Number:</span>
                <span class="value" style="font-family: monospace; font-weight: bold;">${orderNumber}</span>
              </div>
              <div class="detail-row">
                <span class="label">Amount Paid:</span>
                <span class="amount">€${parseFloat(order.amount).toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span class="label">Payment Date:</span>
                <span class="value">${new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              ${order.authority ? `
              <div class="detail-row">
                <span class="label">Transaction ID:</span>
                <span class="value" style="font-family: monospace;">${order.authority}</span>
              </div>
              ` : ''}
            </div>

            ${order.products ? `
            <div class="product-info">
              <h3 style="margin-top: 0; color: #495057;">📦 Your Purchase</h3>
              <div class="detail-row">
                <span class="label">Design Package:</span>
                <span class="value">${order.products.title}</span>
              </div>
              <div class="detail-row">
                <span class="label">Price:</span>
                <span class="value">€${parseFloat(order.products.price).toFixed(2)}</span>
              </div>
            </div>
            ` : ''}

            <div class="next-steps">
              <h3 style="margin-top: 0; color: #0066cc;">📁 What happens next?</h3>
              <p style="margin-bottom: 15px;"><strong>Your design files will be sent to your email address within 1 hour.</strong></p>
              <p style="margin-bottom: 10px;">✉️ <strong>Delivery Email:</strong> ${order.customer_email}</p>
              <p style="margin-bottom: 0;">Please check your inbox (and spam folder) for an email containing your design files. If you don't receive them within 1 hour, please contact our support team.</p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e9ecef;">
              <h3 style="margin-top: 0; color: #495057;">📞 Need Help?</h3>
              <p style="margin-bottom: 10px;">If you have any questions about your order or need assistance, feel free to contact us:</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> info@exhibit3design.com</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> +44 7508 879096</p>
            </div>

            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center; border: 1px solid #dee2e6;">
              <h3 style="margin-top: 0; color: #495057;">💝 Thank You for Your Purchase!</h3>
              <p style="margin-bottom: 15px; font-size: 16px; line-height: 1.6;">
                <strong>Exhibit3Design</strong> provides ready-to-use design files at affordable prices. 
                We're passionate about helping professionals create stunning exhibition stands without breaking the budget.
              </p>
              <p style="margin-bottom: 0; font-size: 16px; color: #6c757d;">
                We hope you'll find our designs valuable for your projects and look forward to serving you again in the future! 🎨
              </p>
            </div>

            <div class="footer">
              <p><strong>Exhibit3Design</strong></p>
              <p>Premium exhibition stand design files for professionals</p>
              <p style="font-size: 12px; margin-top: 15px;">Please keep this email for your records. Your order number is <strong>${orderNumber}</strong></p>
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
      
      // Send email to customer with BCC to info@exhibit3design.com
      await writeCommand(`MAIL FROM:<${fromEmail}>`);
      await readResponse();
      
      // Primary recipient: customer
      await writeCommand(`RCPT TO:<${order.customer_email}>`);
      await readResponse();
      
      // BCC recipient: info@exhibit3design.com
      await writeCommand(`RCPT TO:<info@exhibit3design.com>`);
      await readResponse();
      
      await writeCommand('DATA');
      await readResponse();
      
      const emailData = [
        `From: ${fromEmail}`,
        `To: ${order.customer_email}`,
        `Bcc: info@exhibit3design.com`,
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
      
      console.log('Payment confirmation email sent successfully to customer with BCC to admin');

      return new Response(
        JSON.stringify({ success: true, message: 'Payment confirmation email sent' }),
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