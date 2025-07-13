import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

// CORS headers to allow requests from any origin
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

// SMTP Configuration - Replace with your actual SMTP server details
const smtpConfig = {
  hostname: 'mail.exhibit3design.com',
  port: 465, // Standard port for SMTPS (SMTP over SSL/TLS)
  username: 'noreply@exhibit3design.com',
  password: 'y*[-T%fglcTi', // IMPORTANT: Use environment variables for sensitive data in production!
  tls: true, // Enable TLS encryption
  ssl: true, // Explicitly enable SSL for port 465
};

/**
 * Logger utility for debugging and monitoring
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
    // Only log debug messages in a development environment if needed
    // console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    // if (data) {
    //   console.log('[DEBUG] Data:', JSON.stringify(data, null, 2));
    // }
  }
}

/**
 * Validates the format of an email address.
 * @param email The email string to validate.
 * @returns True if the email format is valid, false otherwise.
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sends a confirmation email using direct SMTP.
 * This function encapsulates the core email sending logic.
 * @param userEmail The recipient's email address.
 * @returns An object indicating success or failure with an error message.
 */
async function sendConfirmationEmail(userEmail: string): Promise<{success: boolean, error?: string}> {
  let client: SMTPClient | null = null;
  
  try {
    Logger.info('Attempting to send email. Initializing SMTP client with config:', {
      hostname: smtpConfig.hostname,
      port: smtpConfig.port,
      username: smtpConfig.username,
      ssl: smtpConfig.ssl,
      tls: smtpConfig.tls
    });
    
    // Create SMTP client instance
    client = new SMTPClient(smtpConfig);
    
    // Connect to the SMTP server with a timeout to prevent indefinite hangs
    const connectTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('SMTP connection timed out after 10 seconds')), 10000)
    );

    try {
      await Promise.race([client.connect(), connectTimeoutPromise]);
      Logger.info('SMTP connection established successfully');
    } catch (connectionError: any) {
      // Ensure client is closed if connection failed
      if (client) {
        client.close().catch(() => {});
      }
      throw new Error(`SMTP connection failed: ${connectionError.message || connectionError}`);
    }

    // Generate a unique message ID for the email
    const messageId = `exhibit3d-confirm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@exhibit3design.com`;
    
    Logger.info('Composing and sending confirmation email to:', userEmail);
    
    // Send the email
    await client.send({
      from: "noreply@exhibit3design.com", // Sender's email address
      to: userEmail, // Recipient's email address
      subject: "Welcome to Exhibit3Design - Your Account is Ready!", // Email subject
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
      html: true, // Specify that the content is HTML
      headers: {
        'Message-ID': messageId,
        'Date': new Date().toUTCString(),
        'X-Mailer': 'Deno Email Service v1.0.0', // Custom mailer header
        'X-Priority': '3', // Normal priority
        'Reply-To': 'noreply@exhibit3design.com' // Reply-to address
      }
    });
    
    Logger.info('✅ Email sent successfully', {
      recipient: userEmail,
      messageId: messageId
    });
    
    return { success: true };
    
  } catch (error: any) {
    Logger.error('Failed to send email', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown SMTP error'
    };
  } finally {
    // Ensure SMTP connection is properly closed in all cases
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

// Main HTTP server function
serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests (OPTIONS method)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests for sending emails
  if (req.method !== 'POST') {
    Logger.error(`Method not allowed: ${req.method}`);
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    Logger.info('=== Email Sending Service Request Received ===');
    Logger.info(`Request: ${req.method} ${req.url}`);
    
    // Parse the request payload
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
    
    Logger.info('Received payload', { payloadLength: payload.length });
    
    // Validate payload is not empty
    if (!payload || payload.trim().length === 0) {
      Logger.error('Empty payload received');
      return new Response(
        JSON.stringify({ error: 'Empty payload' }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    let requestData: any;
    try {
      requestData = JSON.parse(payload);
    } catch (parseError) {
      Logger.error('Failed to parse payload as JSON', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    Logger.debug('Parsed request data structure', {
      keys: Object.keys(requestData || {}),
    });
    
    // Extract user email from the request data. This logic is flexible
    // to handle various common JSON structures where the email might be found.
    const userEmail = requestData?.record?.email || 
                      requestData?.user?.email || 
                      requestData?.email ||
                      requestData?.data?.email ||
                      requestData?.data?.user?.email ||
                      requestData?.new_record?.email ||
                      requestData?.table?.email; // Example for specific table events
    
    Logger.info('Email extraction result', {
      found: !!userEmail,
      email: userEmail ? 'FOUND' : 'NOT_FOUND'
    });
    
    if (!userEmail) {
      Logger.error('No user email found in request payload');
      Logger.error('Available payload structure:', JSON.stringify(requestData, null, 2));
      return new Response(
        JSON.stringify({ 
          error: 'No user email found in request payload',
          availableKeys: Object.keys(requestData || {}),
          hint: 'Expected email in: record.email, user.email, email, data.email, data.user.email, new_record.email, table.email'
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
    
    Logger.info('Initiating email sending for:', userEmail);
    
    // Send email via direct SMTP
    const emailResult = await sendConfirmationEmail(userEmail);
    
    if (emailResult.success) {
      Logger.info('✅ Email sending service completed successfully');
      return new Response(
        JSON.stringify({ 
          message: 'Email sent successfully',
          email: userEmail,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 200, 
          headers: corsHeaders
        }
      );
    } else {
      Logger.error('❌ Failed to send email:', emailResult.error);
      return new Response(
        JSON.stringify({
          error: `Failed to send email: ${emailResult.error}`,
          email: userEmail,
          timestamp: new Date().toISOString()
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
      
  } catch (error: any) {
    Logger.error('=== Fatal error in email sending service ===', error);
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

Logger.info('🚀 Deno Email Sending Service started');
Logger.info('📧 SMTP Configuration:', {
  host: smtpConfig.hostname,
  port: smtpConfig.port,
  username: smtpConfig.username,
  ssl: smtpConfig.ssl
});
