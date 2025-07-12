import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

// SMTP Configuration
const smtpConfig = {
  hostname: 'mail.exhibit3design.com',
  port: 465,
  username: 'noreply@exhibit3design.com',
  password: 'y*[-T%fglcTi',
  tls: true,
};

/**
 * Logger utility for debugging
 */
class Logger {
  static info(message: string, data?: any): void {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
    if (data) {
      console.log('[INFO] Data:', JSON.stringify(data, null, 2));
    }
  }

  static error(message: string, error?: any): void {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    if (error) {
      if (error instanceof Error) {
        console.error('[ERROR] Stack:', error.stack);
        console.error('[ERROR] Message:', error.message);
      } else {
        console.error('[ERROR] Details:', JSON.stringify(error, null, 2));
      }
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    Logger.info('=== Confirmation Email Hook Started ===')
    
    // Parse the webhook payload
    const payload = await req.text()
    Logger.info('Received webhook payload', { payloadLength: payload.length })
    
    let webhookData;
    try {
      webhookData = JSON.parse(payload);
    } catch (e) {
      Logger.error('Failed to parse webhook payload as JSON', e);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    Logger.info('Parsed webhook data', webhookData);
    
    // Extract user email from the webhook data with multiple fallback paths
    const userEmail = webhookData?.record?.email || 
                     webhookData?.user?.email || 
                     webhookData?.email ||
                     webhookData?.data?.email ||
                     webhookData?.data?.user?.email;
    
    Logger.info('Extracted user email:', userEmail);
    Logger.info('Full webhook structure:', JSON.stringify(webhookData, null, 2));
    
    if (!userEmail) {
      Logger.error('No user email found in webhook payload');
      Logger.error('Available keys in payload:', Object.keys(webhookData || {}));
      return new Response(
        JSON.stringify({ error: 'No user email found' }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    Logger.info('Sending confirmation email to:', userEmail);
    
    // Send confirmation email via SMTP
    const client = new SMTPClient(smtpConfig);
    
    await client.send({
      from: "noreply@exhibit3design.com",
      to: userEmail,
      subject: "Welcome to Exhibit3Design - Please Confirm Your Email",
      content: `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin-bottom: 10px;">Welcome to Exhibit3Design!</h1>
              <p style="color: #666; font-size: 16px;">Thank you for creating your account.</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #333; margin: 0 0 15px 0;">
                We're excited to have you join our community! Your account has been successfully created.
              </p>
              <p style="color: #333; margin: 0;">
                You can now log in to your account and start exploring our design services.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; font-size: 14px;">
                If you have any questions, feel free to contact our support team.
              </p>
              <p style="color: #666; font-size: 14px;">
                Best regards,<br>
                The Exhibit3Design Team
              </p>
            </div>
          </body>
        </html>
      `,
      html: true,
    });
    
    await client.close();
    
    Logger.info('✅ Confirmation email sent successfully to:', userEmail);
    
    return new Response(
      JSON.stringify({ 
        message: 'Confirmation email sent successfully',
        email: userEmail
      }),
      { 
        status: 200, 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
      
  } catch (error) {
    Logger.error('=== Fatal error in confirmation email hook ===', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    )
  }
})