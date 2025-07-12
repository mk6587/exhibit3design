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
 * Sends email using custom SMTP implementation
 */
async function sendEmailViaCustomSMTP(email: string, confirmationUrl: string): Promise<any> {
  try {
    Logger.info('=== STARTING EMAIL SEND PROCESS ===');
    Logger.info('Recipient:', email);
    Logger.info('Confirmation URL:', confirmationUrl);
    
    // Test basic connectivity first
    Logger.info('Testing connection to mail.exhibit3design.com:587...');
    
    const conn = await Deno.connect({
      hostname: "mail.exhibit3design.com",
      port: 587
    });
    
    Logger.info('✅ TCP connection established successfully');
    
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // Read initial greeting
    const buffer = new Uint8Array(4096);
    const bytesRead = await conn.read(buffer);
    const greeting = decoder.decode(buffer.subarray(0, bytesRead || 0));
    Logger.info('SMTP Greeting:', greeting.trim());
    
    if (!greeting.includes('220')) {
      throw new Error(`Invalid SMTP greeting: ${greeting}`);
    }
    
    // Helper function to send command and read response
    async function sendCommand(command: string): Promise<string> {
      Logger.info(`→ SMTP: ${command.replace(/AUTH LOGIN|[A-Za-z0-9+/=]{20,}/, '[REDACTED]')}`);
      await conn.write(encoder.encode(command + '\r\n'));
      
      const respBuffer = new Uint8Array(4096);
      const respBytes = await conn.read(respBuffer);
      const response = decoder.decode(respBuffer.subarray(0, respBytes || 0));
      Logger.info(`← SMTP: ${response.trim()}`);
      
      if (response.startsWith('5') || response.startsWith('4')) {
        throw new Error(`SMTP Error: ${response.trim()}`);
      }
      
      return response;
    }
    
    // SMTP handshake
    await sendCommand('EHLO exhibit3design.com');
    await sendCommand('AUTH LOGIN');
    
    // Send credentials
    const usernameB64 = btoa('noreply@exhibit3design.com');
    const passwordB64 = btoa('y*[-T%fglcTi');
    
    await sendCommand(usernameB64);
    await sendCommand(passwordB64);
    
    Logger.info('✅ SMTP Authentication successful');
    
    await sendCommand('MAIL FROM:<noreply@exhibit3design.com>');
    await sendCommand(`RCPT TO:<${email}>`);
    await sendCommand('DATA');
    
    // Email content
    const emailContent = `From: "Exhibit3Design" <noreply@exhibit3design.com>
To: ${email}
Subject: Welcome to Exhibit3Design - Confirm Your Account
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">Welcome to Exhibit3Design!</h1>
  
  <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
    Thank you for registering with Exhibit3Design! We're excited to help you access affordable exhibition stand design files.
  </p>
  
  <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
    Please confirm your email address by clicking the link below:
  </p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${confirmationUrl}" 
       style="background-color: #007bff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
      Confirm Your Email Address
    </a>
  </div>
  
  <p style="color: #666; font-size: 14px; line-height: 1.6;">
    Or copy and paste this link: ${confirmationUrl}
  </p>
</div>`;
    
    Logger.info('Sending email content...');
    await conn.write(encoder.encode(emailContent + '\r\n.\r\n'));
    
    // Read final response
    const finalBuffer = new Uint8Array(4096);
    const finalBytes = await conn.read(finalBuffer);
    const finalResponse = decoder.decode(finalBuffer.subarray(0, finalBytes || 0));
    Logger.info(`Final SMTP Response: ${finalResponse.trim()}`);
    
    if (!finalResponse.includes('250')) {
      throw new Error(`Email send failed: ${finalResponse}`);
    }
    
    await sendCommand('QUIT');
    conn.close();
    
    Logger.info('✅ EMAIL SENT SUCCESSFULLY!');
    
    return {
      success: true,
      messageId: `smtp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      note: 'Email sent via custom SMTP implementation'
    };
    
  } catch (error) {
    Logger.error('❌ EMAIL SEND FAILED:', error);
    throw error;
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
