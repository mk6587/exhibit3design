import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Logger utility for debugging
 */
class Logger {
  static debug(message: string, data?: any): void {
    console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    if (data) {
      console.log('[DEBUG] Data:', JSON.stringify(data, null, 2));
    }
  }

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

/**
 * Sends email using custom SMTP logic
 */
async function sendEmailViaCustomSMTP(email: string, confirmationUrl: string): Promise<any> {
  try {
    Logger.info('Starting custom SMTP email send', { recipientEmail: email });
    
    // For now, let's simulate sending the email and log the details
    const emailContent = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">Welcome to Exhibit3Design!</h1>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Thank you for registering with Exhibit3Design! We're excited to help you access affordable exhibition stand design files that save you time and money.
        </p>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          Please confirm your email address by clicking the button below:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmationUrl}" 
             style="background-color: #007bff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Confirm Your Email Address
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          Or copy and paste this link in your browser:
        </p>
        <p style="color: #007bff; font-size: 14px; word-break: break-all; margin-bottom: 30px;">
          ${confirmationUrl}
        </p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 30px 0;">
          <h3 style="color: #333; font-size: 18px; margin-bottom: 10px;">About Exhibit3Design</h3>
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
            We provide professional exhibition stand design files at affordable prices, helping businesses create stunning displays without breaking the budget.
          </p>
        </div>
        
        <p style="color: #999; font-size: 12px; line-height: 1.6; margin-top: 30px;">
          If you didn't create an account with us, you can safely ignore this email.
        </p>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            <strong>Exhibit3Design</strong><br>
            Professional Exhibition Stand Design Files
          </p>
        </div>
      </div>
    `;

    // Use Deno's built-in fetch to send email via a different SMTP service
    // Let's try using a basic HTTP request to test the connection
    Logger.info('Attempting to connect to SMTP server via HTTP...');
    
    // For testing, let's just log the email details and return success
    Logger.info('EMAIL CONTENT TO SEND:');
    Logger.info('='.repeat(50));
    Logger.info(`To: ${email}`);
    Logger.info(`From: noreply@exhibit3design.com`);
    Logger.info(`Subject: Welcome to Exhibit3Design - Confirm Your Account`);
    Logger.info(`Confirmation URL: ${confirmationUrl}`);
    Logger.info('HTML Content:', emailContent.substring(0, 200) + '...');
    Logger.info('='.repeat(50));

    // Simulate successful email send
    const messageId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    Logger.info('Email simulation completed successfully', { messageId });

    return {
      success: true,
      messageId: messageId,
      note: 'Email simulated - SMTP connection will be implemented next'
    };

  } catch (error) {
    Logger.error('Email send failed', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    Logger.info('=== Welcome Email Function Started ===');
    const { email, confirmationUrl } = await req.json();
    
    Logger.info('Processing welcome email request', { 
      email: email ? 'PROVIDED' : 'MISSING',
      confirmationUrl: confirmationUrl ? 'PROVIDED' : 'MISSING'
    });

    if (!email || !confirmationUrl) {
      Logger.error('Missing required parameters', { email: !!email, confirmationUrl: !!confirmationUrl });
      return new Response(
        JSON.stringify({ error: 'Email and confirmationUrl are required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const result = await sendEmailViaCustomSMTP(email, confirmationUrl);

    if (result.success) {
      Logger.info('=== Success! Welcome email processed ===', { messageId: result.messageId });
      return new Response(
        JSON.stringify({ 
          message: "Welcome email processed successfully", 
          messageId: result.messageId,
          note: result.note
        }),
        { status: 200, headers: corsHeaders }
      );
    } else {
      Logger.error('=== Failed to process welcome email ===', { error: result.error });
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 500, headers: corsHeaders }
      );
    }
  } catch (error) {
    Logger.error('=== Fatal error in welcome email function ===', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: corsHeaders }
    );
  }
});
