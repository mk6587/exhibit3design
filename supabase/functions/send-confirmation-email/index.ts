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
  ssl: true, // Added explicit SSL for port 465
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

  static debug(message: string, data?: any): void {
    console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    if (data) {
      console.log('[DEBUG] Data:', JSON.stringify(data, null, 2));
    }
  }
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Send confirmation email with enhanced error handling
 */
async function sendConfirmationEmail(userEmail: string): Promise<{success: boolean, error?: string}> {
  let client: SMTPClient | null = null;
  
  try {
    Logger.info('Initializing SMTP client with config:', {
      hostname: smtpConfig.hostname,
      port: smtpConfig.port,
      username: smtpConfig.username,
      ssl: smtpConfig.ssl,
      tls: smtpConfig.tls
    });
    
    // Create SMTP client with timeout handling
    client = new SMTPClient(smtpConfig);
    
    // Connect with timeout
    const connectTimeout = setTimeout(() => {
      Logger.error('SMTP connection timeout after 10 seconds');
      if (client) {
        client.close().catch(() => {});
      }
    }, 10000);

    try {
      await client.connect();
      clearTimeout(connectTimeout);
      Logger.info('SMTP connection established successfully');
    } catch (connectionError) {
      clearTimeout(connectTimeout);
      throw new Error(`SMTP connection failed: ${connectionError.message}`);
    }

    // Generate unique message ID
    const messageId = `exhibit3d-confirm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@exhibit3design.com`;
    
    Logger.info('Sending confirmation email to:', userEmail);
    
    await client.send({
      from: "noreply@exhibit3design.com",
      to: userEmail,
      subject: "Welcome to Exhibit3Design - Please Confirm Your Email",
      content: `
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Exhibit3Design</title>
          </head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #333; margin-bottom: 10px; font-size: 28px;">Welcome to Exhibit3Design!</h1>
                <p style="color: #666; font-size: 16px; margin: 0;">Thank you for creating your account.</p>
              </div>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #007bff;">
                <p style="color: #333; margin: 0 0 15px 0; font-size: 16px; line-height: 1.6;">
                  We're excited to have you join our community! Your account has been successfully created.
                </p>
                <p style="color: #333; margin: 0; font-size: 16px; line-height: 1.6;">
                  You can now log in to your account and start exploring our design services.
                </p>
              </div>
              
              <div style="background-color: #e8f4fd; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
                <p style="color: #0066cc; margin: 0; font-size: 14px; font-weight: bold;">
                  🎨 Ready to explore affordable exhibition stand designs?
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
                  If you have any questions, feel free to contact our support team.
                </p>
                <p style="color: #666; font-size: 14px; margin: 0;">
                  Best regards,<br>
                  <strong>The Exhibit3Design Team</strong>
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #f0f0f0;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  This is an automated message. Please do not reply to this email.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      html: true,
      headers: {
        'Message-ID': messageId,
        'Date': new Date().toUTCString(),
        'X-Mailer': 'Deno Confirmation Email Server v1.0.0',
        'X-Priority': '3',
        'Reply-To': 'noreply@exhibit3design.com'
      }
    });
    
    Logger.info('✅ Confirmation email sent successfully', {
      recipient: userEmail,
      messageId: messageId
    });
    
    return { success: true };
    
  } catch (error) {
    Logger.error('Failed to send confirmation email', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown SMTP error'
    };
  } finally {
    // Ensure SMTP connection is properly closed
    if (client) {
      try {
        await client.close();
        Logger.debug('SMTP connection closed successfully');
      } catch (closeError) {
        Logger.error('Error closing SMTP connection:', closeError);
      }
    }
  }
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    Logger.error(`Method not allowed: ${req.method}`);
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    Logger.info('=== Confirmation Email Hook Started ===');
    Logger.info(`Request: ${req.method} ${req.url}`);
    
    // Parse the webhook payload with error handling
    let payload: string;
    try {
      payload = await req.text();
    } catch (readError) {
      Logger.error('Failed to read request payload', readError);
      return new Response(
        JSON.stringify({ error: 'Failed to read request payload' }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    Logger.info('Received webhook payload', { payloadLength: payload.length });
    
    // Validate payload is not empty
    if (!payload || payload.trim().length === 0) {
      Logger.error('Empty payload received');
      return new Response(
        JSON.stringify({ error: 'Empty payload' }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    let webhookData: any;
    try {
      webhookData = JSON.parse(payload);
    } catch (parseError) {
      Logger.error('Failed to parse webhook payload as JSON', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    Logger.debug('Parsed webhook data structure', {
      keys: Object.keys(webhookData || {}),
      hasRecord: !!webhookData?.record,
      hasUser: !!webhookData?.user,
      hasData: !!webhookData?.data
    });
    
    // Extract user email from the webhook data with comprehensive fallback paths
    const userEmail = webhookData?.record?.email || 
                     webhookData?.user?.email || 
                     webhookData?.email ||
                     webhookData?.data?.email ||
                     webhookData?.data?.user?.email ||
                     webhookData?.new_record?.email ||
                     webhookData?.table?.email;
    
    Logger.info('Email extraction result', {
      found: !!userEmail,
      email: userEmail ? 'FOUND' : 'NOT_FOUND'
    });
    
    if (!userEmail) {
      Logger.error('No user email found in webhook payload');
      Logger.error('Available payload structure:', JSON.stringify(webhookData, null, 2));
      return new Response(
        JSON.stringify({ 
          error: 'No user email found in webhook payload',
          availableKeys: Object.keys(webhookData || {}),
          hint: 'Expected email in: record.email, user.email, email, data.email, data.user.email'
        }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Validate email format
    if (!isValidEmail(userEmail)) {
      Logger.error('Invalid email format:', userEmail);
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    Logger.info('Processing confirmation email for:', userEmail);
    
    // Send confirmation email via SMTP
    const emailResult = await sendConfirmationEmail(userEmail);
    
    if (emailResult.success) {
      Logger.info('✅ Confirmation email hook completed successfully');
      return new Response(
        JSON.stringify({ 
          message: 'Confirmation email sent successfully',
          email: userEmail,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 200, 
          headers: corsHeaders
        }
      );
    } else {
      Logger.error('❌ Failed to send confirmation email:', emailResult.error);
      return new Response(
        JSON.stringify({
          error: `Failed to send confirmation email: ${emailResult.error}`,
          email: userEmail,
          timestamp: new Date().toISOString()
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
      
  } catch (error) {
    Logger.error('=== Fatal error in confirmation email hook ===', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});

Logger.info('🚀 Deno Confirmation Email Server started');
Logger.info('📧 SMTP Configuration:', {
  host: smtpConfig.hostname,
  port: smtpConfig.port,
  username: smtpConfig.username,
  ssl: smtpConfig.ssl
});