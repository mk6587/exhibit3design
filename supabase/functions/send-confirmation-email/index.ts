import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
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
  console.log(`🔄 Attempting to send email to ${to} with subject: ${subject}`);
  
  try {
    // Simplified SMTP approach - try basic connection first
    console.log(`📡 Connecting to SMTP server: ${SMTP_CONFIG.hostname}:${SMTP_CONFIG.port}`);
    
    const conn = await Deno.connect({
      hostname: SMTP_CONFIG.hostname,
      port: 25, // Use basic port 25 first
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Helper function to read response with timeout
    const readResponse = async (timeoutMs = 10000) => {
      const timeout = setTimeout(() => {
        console.log("⚠️ SMTP read timeout");
        conn.close();
      }, timeoutMs);
      
      try {
        const buffer = new Uint8Array(2048);
        const n = await conn.read(buffer);
        clearTimeout(timeout);
        const response = decoder.decode(buffer.subarray(0, n || 0));
        console.log(`📨 SMTP Response: ${response.trim()}`);
        return response;
      } catch (error) {
        clearTimeout(timeout);
        throw error;
      }
    };

    // Helper function to send command
    const sendCommand = async (command: string, hideInLog = false) => {
      if (!hideInLog) {
        console.log(`📤 SMTP Command: ${command}`);
      } else {
        console.log(`📤 SMTP Command: [HIDDEN AUTH]`);
      }
      await conn.write(encoder.encode(command + "\r\n"));
      const response = await readResponse();
      
      // Check for error responses
      if (response.startsWith('5') || response.startsWith('4')) {
        throw new Error(`SMTP Error: ${response.trim()}`);
      }
      
      return response;
    };

    try {
      // Simple SMTP conversation
      console.log("🔍 Reading server greeting...");
      await readResponse(5000); // 5 second timeout for greeting
      
      console.log("👋 Sending HELO...");
      await sendCommand(`HELO ${SMTP_CONFIG.hostname}`);
      
      console.log("📧 Setting sender and recipient...");
      await sendCommand(`MAIL FROM:<${SMTP_CONFIG.username}>`);
      await sendCommand(`RCPT TO:<${to}>`);
      await sendCommand("DATA");
      
      // Simplified email content
      const emailContent = `From: Exhibit3Design <${SMTP_CONFIG.username}>
To: ${to}
Subject: ${subject}
Content-Type: text/html; charset=UTF-8

${htmlContent}
.`;
      
      console.log("📝 Sending email content...");
      await conn.write(encoder.encode(emailContent + "\r\n"));
      await sendCommand("QUIT");
      
      conn.close();
      console.log("✅ Email sent successfully (basic SMTP)");
      return { success: true, method: 'basic' };
      
    } catch (basicError) {
      console.log(`❌ Basic SMTP failed: ${basicError.message}`);
      conn.close();
      
      // Try with authentication as fallback
      console.log("🔄 Trying authenticated SMTP...");
      return await sendAuthenticatedEmail(to, subject, htmlContent);
    }
    
  } catch (error) {
    console.error("💥 SMTP Connection Error:", error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
}

// Fallback authenticated email function
async function sendAuthenticatedEmail(to: string, subject: string, htmlContent: string) {
  try {
    const conn = await Deno.connect({
      hostname: SMTP_CONFIG.hostname,
      port: 587,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const readResponse = async () => {
      const buffer = new Uint8Array(1024);
      const n = await conn.read(buffer);
      const response = decoder.decode(buffer.subarray(0, n || 0));
      console.log(`🔐 Auth SMTP Response: ${response.trim()}`);
      return response;
    };

    const sendCommand = async (command: string, hideInLog = false) => {
      if (!hideInLog) {
        console.log(`🔐 Auth SMTP Command: ${command}`);
      }
      await conn.write(encoder.encode(command + "\r\n"));
      const response = await readResponse();
      if (response.startsWith('5') || response.startsWith('4')) {
        throw new Error(`Auth SMTP Error: ${response}`);
      }
      return response;
    };

    await readResponse(); // greeting
    await sendCommand(`EHLO ${SMTP_CONFIG.hostname}`);
    await sendCommand("AUTH LOGIN");
    await sendCommand(btoa(SMTP_CONFIG.username), true);
    await sendCommand(btoa(SMTP_CONFIG.password), true);
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
    
    console.log("✅ Email sent successfully (authenticated SMTP)");
    return { success: true, method: 'authenticated' };
    
  } catch (authError) {
    console.error("💥 Authenticated SMTP also failed:", authError);
    throw authError;
  }
}

// Rate limiting storage (in-memory for simplicity)
const emailAttempts = new Map<string, { count: number; lastAttempt: number }>();

const RATE_LIMIT = {
  maxAttempts: 3,
  windowMs: 15 * 60 * 1000, // 15 minutes
};

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const attempts = emailAttempts.get(email);
  
  if (!attempts) {
    emailAttempts.set(email, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Reset if window has passed
  if (now - attempts.lastAttempt > RATE_LIMIT.windowMs) {
    emailAttempts.set(email, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Check if within limit
  if (attempts.count >= RATE_LIMIT.maxAttempts) {
    return false;
  }
  
  // Increment counter
  attempts.count++;
  attempts.lastAttempt = now;
  return true;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: ConfirmationEmailRequest = await req.json();
    console.log(`📧 Processing confirmation email request for: ${email}`);

    // Check rate limit first
    if (!checkRateLimit(email)) {
      console.log(`⚠️ Rate limit exceeded for email: ${email}`);
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded. Please wait 15 minutes before requesting another email.",
          rateLimited: true 
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    console.log(`🔐 Generating confirmation link for: ${email}`);
    
    // Get the confirmation token from Supabase auth
    const { data: authData, error: authError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: email,
      options: {
        redirectTo: 'https://fipebdkvzdrljwwxccrj.supabase.co'
      }
    });

    if (authError) {
      console.error("💥 Supabase auth error:", authError);
      throw new Error(`Failed to generate confirmation link: ${authError.message}`);
    }

    console.log(`✅ Confirmation link generated successfully`);
    const confirmationLink = authData.properties.action_link;

    console.log(`📝 Preparing email content for: ${email}`);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; text-align: center;">Welcome to Exhibit3Design!</h1>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Thank you for signing up! Please confirm your email address to complete your registration.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmationLink}" 
             style="background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Confirm Email Address
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          If you didn't sign up for this account, you can safely ignore this email.
        </p>
        <p style="color: #666; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:
          <br>
          <a href="${confirmationLink}" style="color: #0066cc; word-break: break-all;">${confirmationLink}</a>
        </p>
      </div>
    `;

    // Use background task for email sending to avoid blocking
    const emailTask = async () => {
      try {
        console.log(`🚀 Starting email delivery task for: ${email}`);
        const result = await sendSMTPEmail(email, "Confirm Your Email - Exhibit3Design", htmlContent);
        console.log(`✅ Email delivery completed for ${email}:`, result);
      } catch (emailError) {
        console.error(`💥 Email delivery failed for ${email}:`, emailError);
        // Log the failure but don't crash the function
      }
    };

    // Start background task
    console.log(`⏰ Scheduling background email task for: ${email}`);
    if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
      EdgeRuntime.waitUntil(emailTask());
      console.log(`✅ Background task scheduled via EdgeRuntime`);
    } else {
      // Fallback for environments without EdgeRuntime
      console.log(`⚠️ EdgeRuntime not available, using fallback`);
      emailTask().catch(error => {
        console.error(`Background task fallback error:`, error);
      });
    }

    // Return immediate success response
    console.log(`📤 Returning success response for: ${email}`);
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Confirmation email is being sent",
      email: email,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
    
    // Handle specific rate limit errors
    if (error.message?.includes('rate limit') || error.message?.includes('429')) {
      return new Response(
        JSON.stringify({ 
          error: "Email service rate limit exceeded. Please try again later.",
          rateLimited: true 
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: "Email service temporarily unavailable. Please try again later.",
        temporary: true 
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);