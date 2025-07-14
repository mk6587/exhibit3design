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

// SMTP configuration
const SMTP_CONFIG = {
  hostname: "mail.exhibit3design.com",
  port: 25,
  username: "noreply@exhibit3design.com",
  password: "y*[-T%fglcTi",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

async function sendSMTPEmail(to: string, subject: string, htmlContent: string) {
  console.log(`Sending password reset email to ${to} with subject: ${subject}`);
  
  try {
    const conn = await Deno.connect({
      hostname: SMTP_CONFIG.hostname,
      port: SMTP_CONFIG.port,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Helper function to read response
    const readResponse = async () => {
      const buffer = new Uint8Array(1024);
      const n = await conn.read(buffer);
      return decoder.decode(buffer.subarray(0, n || 0));
    };

    // Helper function to send command
    const sendCommand = async (command: string) => {
      console.log(`SMTP Command: ${command}`);
      await conn.write(encoder.encode(command + "\r\n"));
      const response = await readResponse();
      console.log(`SMTP Response: ${response}`);
      return response;
    };

    // SMTP conversation
    await readResponse(); // Read greeting
    await sendCommand(`HELO ${SMTP_CONFIG.hostname}`);
    await sendCommand(`MAIL FROM:<${SMTP_CONFIG.username}>`);
    await sendCommand(`RCPT TO:<${to}>`);
    await sendCommand("DATA");
    
    // Email content
    const emailContent = `From: Exhibit3Design <${SMTP_CONFIG.username}>
To: ${to}
Subject: ${subject}
Content-Type: text/html; charset=UTF-8

${htmlContent}
.`;
    
    await conn.write(encoder.encode(emailContent + "\r\n"));
    await sendCommand("QUIT");
    
    conn.close();
    console.log("Password reset email sent successfully");
    return { success: true };
  } catch (error) {
    console.error("SMTP Error:", error);
    throw error;
  }
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