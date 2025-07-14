import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  token?: string;
}

// SMTP configuration - using more reliable settings
const SMTP_CONFIG = {
  hostname: "mail.exhibit3design.com",
  port: 587, // Use 587 for STARTTLS
  username: "noreply@exhibit3design.com",
  password: "y*[-T%fglcTi",
  requireTLS: true,
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

async function sendSMTPEmail(to: string, subject: string, htmlContent: string) {
  console.log(`Attempting to send password reset email to ${to}`);
  
  try {
    // Try to connect with STARTTLS support
    const conn = await Deno.connectTls({
      hostname: SMTP_CONFIG.hostname,
      port: SMTP_CONFIG.port,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Helper function to read response
    const readResponse = async () => {
      const buffer = new Uint8Array(2048);
      const n = await conn.read(buffer);
      const response = decoder.decode(buffer.subarray(0, n || 0));
      console.log(`SMTP Response: ${response.trim()}`);
      return response;
    };

    // Helper function to send command
    const sendCommand = async (command: string, hideInLog = false) => {
      if (!hideInLog) {
        console.log(`SMTP Command: ${command}`);
      } else {
        console.log(`SMTP Command: [HIDDEN]`);
      }
      await conn.write(encoder.encode(command + "\r\n"));
      const response = await readResponse();
      
      // Check for error responses
      if (response.startsWith('5') || response.startsWith('4')) {
        throw new Error(`SMTP Error: ${response.trim()}`);
      }
      
      return response;
    };

    // SMTP conversation with better error handling
    console.log("Reading server greeting...");
    await readResponse(); // Read greeting
    
    console.log("Sending EHLO...");
    await sendCommand(`EHLO ${SMTP_CONFIG.hostname}`);
    
    console.log("Starting authentication...");
    await sendCommand("AUTH LOGIN");
    await sendCommand(btoa(SMTP_CONFIG.username), true);
    await sendCommand(btoa(SMTP_CONFIG.password), true);
    
    console.log("Setting sender and recipient...");
    await sendCommand(`MAIL FROM:<${SMTP_CONFIG.username}>`);
    await sendCommand(`RCPT TO:<${to}>`);
    await sendCommand("DATA");
    
    // Email content
    const emailContent = `From: Exhibit3Design <${SMTP_CONFIG.username}>
To: ${to}
Subject: ${subject}
Content-Type: text/html; charset=UTF-8
MIME-Version: 1.0

${htmlContent}
.`;
    
    console.log("Sending email content...");
    await conn.write(encoder.encode(emailContent + "\r\n"));
    await sendCommand("QUIT");
    
    conn.close();
    console.log("Password reset email sent successfully");
    return { success: true };
  } catch (error) {
    console.error("SMTP Error Details:", error);
    
    // Try fallback with plain connection if TLS fails
    try {
      console.log("Attempting fallback with plain connection...");
      return await sendEmailPlainConnection(to, subject, htmlContent);
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      throw new Error(`Email delivery failed: ${error.message}`);
    }
  }
}

// Fallback function for plain SMTP connection
async function sendEmailPlainConnection(to: string, subject: string, htmlContent: string) {
  const conn = await Deno.connect({
    hostname: SMTP_CONFIG.hostname,
    port: 25, // Try port 25 as fallback
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const readResponse = async () => {
    const buffer = new Uint8Array(1024);
    const n = await conn.read(buffer);
    return decoder.decode(buffer.subarray(0, n || 0));
  };

  const sendCommand = async (command: string) => {
    await conn.write(encoder.encode(command + "\r\n"));
    const response = await readResponse();
    if (response.startsWith('5') || response.startsWith('4')) {
      throw new Error(`SMTP Error: ${response}`);
    }
    return response;
  };

  await readResponse(); // Read greeting
  await sendCommand(`HELO ${SMTP_CONFIG.hostname}`);
  await sendCommand(`MAIL FROM:<${SMTP_CONFIG.username}>`);
  await sendCommand(`RCPT TO:<${to}>`);
  await sendCommand("DATA");
  
  const emailContent = `From: Exhibit3Design <${SMTP_CONFIG.username}>
To: ${to}
Subject: ${subject}
Content-Type: text/html; charset=UTF-8

${htmlContent}
.`;
  
  await conn.write(encoder.encode(emailContent + "\r\n"));
  await sendCommand("QUIT");
  conn.close();
  
  return { success: true };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();
    console.log(`Processing password reset email for: ${email}`);

    // Get the reset token from Supabase auth
    const { data: authData, error: authError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: 'https://fipebdkvzdrljwwxccrj.supabase.co/reset-password'
      }
    });

    if (authError) {
      console.error("Auth error:", authError);
      throw new Error(`Failed to generate reset link: ${authError.message}`);
    }

    const resetLink = authData.properties.action_link;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; text-align: center;">Password Reset Request</h1>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          You've requested to reset your password for your Exhibit3Design account.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 24 hours. If you didn't request a password reset, you can safely ignore this email.
        </p>
        <p style="color: #666; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:
          <br>
          <a href="${resetLink}" style="color: #dc3545; word-break: break-all;">${resetLink}</a>
        </p>
      </div>
    `;

    await sendSMTPEmail(email, "Password Reset - Exhibit3Design", htmlContent);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);