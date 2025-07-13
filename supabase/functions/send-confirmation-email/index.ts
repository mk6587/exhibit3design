import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// CORS headers to allow requests from any origin
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

// SMTP Configuration - Replace with your actual SMTP server details
// Note: Port 587 typically uses STARTTLS, which is handled manually below.
const smtpConfig = {
  hostname: 'mail.exhibit3design.com',
  port: 587, // Standard port for SMTP with STARTTLS
  username: 'noreply@exhibit3design.com',
  password: 'y*[-T%fglcTi', // IMPORTANT: Use environment variables for sensitive data in production!
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
    // Uncomment the lines below to enable debug logging
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
 * Sends email using a custom, low-level SMTP implementation over TCP.
 * This function manually handles the SMTP handshake, TLS upgrade (STARTTLS),
 * authentication, and email data transfer.
 * @param userEmail The recipient's email address.
 * @param confirmationUrl The URL for email confirmation.
 * @returns An object indicating success or failure with an error message.
 */
async function sendEmailViaCustomSMTP(userEmail: string, confirmationUrl: string): Promise<{success: boolean, error?: string}> {
  let conn: Deno.Conn | null = null;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  try {
    Logger.info('=== STARTING MANUAL SMTP EMAIL SEND PROCESS ===');
    Logger.info('Recipient:', userEmail);
    Logger.info('Confirmation URL:', confirmationUrl);
    
    Logger.info(`Attempting to connect to ${smtpConfig.hostname}:${smtpConfig.port}...`);
    
    // Establish a raw TCP connection
    conn = await Deno.connect({
      hostname: smtpConfig.hostname,
      port: smtpConfig.port
    });
    
    Logger.info('✅ TCP connection established successfully');
    
    // Helper function to send command and read response
    async function sendCommand(command: string): Promise<string> {
      Logger.debug(`→ SMTP: ${command.replace(/AUTH LOGIN|[A-Za-z0-9+/=]{20,}/, '[REDACTED]')}`);
      await conn!.write(encoder.encode(command + '\r\n')); // conn is guaranteed to be non-null here

      const respBuffer = new Uint8Array(4096);
      const respBytes = await conn!.read(respBuffer); // conn is guaranteed to be non-null here
      const response = decoder.decode(respBuffer.subarray(0, respBytes || 0));
      Logger.debug(`← SMTP: ${response.trim()}`);
      
      // Check for error responses (4xx or 5xx)
      if (response.startsWith('5') || response.startsWith('4')) {
        throw new Error(`SMTP Error: ${response.trim()}`);
      }
      
      return response;
    }
    
    // Read initial greeting from the SMTP server
    const initialBuffer = new Uint8Array(4096);
    const initialBytesRead = await conn.read(initialBuffer);
    const greeting = decoder.decode(initialBuffer.subarray(0, initialBytesRead || 0));
    Logger.info('SMTP Greeting:', greeting.trim());
    
    if (!greeting.includes('220')) {
      throw new Error(`Invalid SMTP greeting: ${greeting}`);
    }
    
    // SMTP handshake: EHLO
    await sendCommand(`EHLO ${smtpConfig.hostname}`);

    // --- IMPORTANT: Initiate STARTTLS for secure communication on port 587 ---
    // This upgrades the plain TCP connection to a TLS-encrypted one.
    await sendCommand('STARTTLS');
    Logger.info('Initiating TLS handshake...');
    
    // Upgrade the connection to TLS
    conn = await Deno.startTls(conn);
    Logger.info('✅ TLS handshake completed.');

    // Now, perform authentication over the secure channel
    await sendCommand('AUTH LOGIN');
    
    // Send base64-encoded credentials
    const usernameB64 = btoa(smtpConfig.username);
    const passwordB64 = btoa(smtpConfig.password);
    
    await sendCommand(usernameB64);
    await sendCommand(passwordB64);
    
    Logger.info('✅ SMTP Authentication successful');
    
    // Specify sender and recipient
    await sendCommand(`MAIL FROM:<${smtpConfig.username}>`);
    await sendCommand(`RCPT TO:<${userEmail}>`);
    
    // Start sending email data
    await sendCommand('DATA');
    
    // Email content (HTML format)
    const emailContent = `From: "Exhibit3Design" <${smtpConfig.username}>
To: ${userEmail}
Subject: Welcome to Exhibit3Design - Confirm Your Account
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
  <h1 style="color: #333; font-size: 28px; text-align: center; margin-bottom: 25px;">Welcome to Exhibit3Design!</h1>
  
  <p style="color: #555; font-size: 16px; line-height: 1.7; margin-bottom: 20px;">
    Thank you for registering with Exhibit3Design! We're thrilled to have you join our community.
    You're just one step away from accessing affordable exhibition stand design files and resources.
  </p>
  
  <p style="color: #555; font-size: 16px; line-height: 1.7; margin-bottom: 30px;">
    To activate your account and get started, please confirm your email address by clicking the button below:
  </p>
  
  <div style="text-align: center; margin: 35px 0;">
    <a href="${confirmationUrl}" 
       style="background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 17px; box-shadow: 0 4px 10px rgba(0,123,255,0.3);">
      Confirm Your Email Address
    </a>
  </div>
  
  <p style="color: #777; font-size: 14px; line-height: 1.6; text-align: center; margin-top: 30px;">
    If the button above doesn't work, please copy and paste the following link into your web browser:
    <br>
    <a href="${confirmationUrl}" style="color: #007bff; word-break: break-all;">${confirmationUrl}</a>
  </p>

  <div style="border-top: 1px solid #eee; padding-top: 25px; margin-top: 40px; text-align: center;">
    <p style="color: #888; font-size: 13px; margin-bottom: 10px;">
      If you have any questions or need assistance, please don't hesitate to contact our support team.
    </p>
    <p style="color: #888; font-size: 13px; margin: 0;">
      Best regards,<br>
      <strong>The Exhibit3Design Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px;">
    <p style="color: #aaa; font-size: 11px; margin: 0;">
      This is an automated message. Please do not reply directly to this email.
    </p>
  </div>
</div>`;
    
    Logger.info('Sending email content...');
    // Send the email content followed by a dot on a new line to signify end of DATA
    await conn.write(encoder.encode(emailContent + '\r\n.\r\n'));
    
    // Read final response from the server after sending data
    const finalBuffer = new Uint8Array(4096);
    const finalBytes = await conn.read(finalBuffer);
    const finalResponse = decoder.decode(finalBuffer.subarray(0, finalBytes || 0));
    Logger.info(`Final SMTP Response: ${finalResponse.trim()}`);
    
    if (!finalResponse.includes('250')) {
      throw new Error(`Email send failed: ${finalResponse}`);
    }
    
    // Quit the SMTP session
    await sendCommand('QUIT');
    
    Logger.info('✅ EMAIL SENT SUCCESSFULLY!');
    
    return {
      success: true,
      messageId: `manual-smtp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      note: 'Email sent via custom TCP SMTP implementation'
    };
    
  } catch (error: any) {
    Logger.error('❌ EMAIL SEND FAILED:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  } finally {
    // Ensure the TCP connection is closed
    if (conn) {
      try {
        conn.close();
        Logger.debug('TCP connection closed successfully');
      } catch (closeError) {
        Logger.error('Error closing TCP connection:', closeError);
      }
    }
  }
}

// Main HTTP server function to handle incoming requests
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
    
    // Extract user email and confirmation URL from the request data.
    // This logic is flexible to handle various common JSON structures.
    const userEmail = requestData?.record?.email || 
                      requestData?.user?.email || 
                      requestData?.email ||
                      requestData?.data?.email ||
                      requestData?.data?.user?.email ||
                      requestData?.new_record?.email ||
                      requestData?.table?.email;
    
    const confirmationUrl = requestData?.confirmationUrl ||
                            requestData?.data?.confirmationUrl ||
                            requestData?.record?.confirmationUrl; // Assuming a confirmation URL is passed
    
    Logger.info('Email and URL extraction result', {
      emailFound: !!userEmail,
      urlFound: !!confirmationUrl,
      email: userEmail ? 'FOUND' : 'NOT_FOUND'
    });
    
    if (!userEmail || !confirmationUrl) {
      Logger.error('Missing required parameters in request payload', { userEmail: !!userEmail, confirmationUrl: !!confirmationUrl });
      Logger.error('Available payload structure:', JSON.stringify(requestData, null, 2));
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: email and confirmationUrl',
          availableKeys: Object.keys(requestData || {}),
          hint: 'Expected email in: record.email, user.email, email, data.email, data.user.email, new_record.email, table.email. Expected confirmationUrl in: confirmationUrl, data.confirmationUrl, record.confirmationUrl'
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
    
    // Send email via custom SMTP implementation
    const emailResult = await sendEmailViaCustomSMTP(userEmail, confirmationUrl);
    
    if (emailResult.success) {
      Logger.info('✅ Email sending service completed successfully');
      return new Response(
        JSON.stringify({ 
          message: 'Email sent successfully',
          email: userEmail,
          messageId: emailResult.messageId,
          note: emailResult.note,
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

Logger.info('🚀 Deno Email Sending Service started (Manual TCP Implementation)');
Logger.info('📧 SMTP Configuration:', {
  host: smtpConfig.hostname,
  port: smtpConfig.port,
  username: smtpConfig.username,
});
