import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
}

// Proper SMTP config (use connectTls with port 465)
const SMTP_CONFIG = {
  hostname: "mail.exhibit3design.com",
  port: 465,
  username: "noreply@exhibit3design.com",
  password: "y*[-T%fglcTi", // ⚠️ Real password -- use env vars in production!
};

const supabase = createClient(
  "https://fipebdkvzdrljwwxccrj.supabase.co",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Helper to base64 encode (for SMTP auth)
function toBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

// Send email over TLS
async function sendAuthenticatedEmail(to: string, subject: string, htmlContent: string) {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] 🚀 Starting email send process to: ${to}`);
  console.log(`[${new Date().toISOString()}] 📡 Connecting to SMTP server: ${SMTP_CONFIG.hostname}:${SMTP_CONFIG.port}`);

  let conn;
  try {
    conn = await Deno.connectTls({
      hostname: SMTP_CONFIG.hostname,
      port: SMTP_CONFIG.port,
    });
    console.log(`[${new Date().toISOString()}] ✅ TLS connection established successfully`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Failed to establish TLS connection:`, error);
    throw new Error(`TLS connection failed: ${error.message}`);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const sendCommand = async (command: string, hideInLog = false) => {
    const timestamp = new Date().toISOString();
    if (!hideInLog) {
      console.log(`[${timestamp}] 📤 SMTP CMD: ${command}`);
    } else {
      console.log(`[${timestamp}] 📤 SMTP CMD: [HIDDEN - AUTH DATA]`);
    }
    
    try {
      await conn.write(encoder.encode(command + "\r\n"));
      const buffer = new Uint8Array(1024);
      const n = await conn.read(buffer);
      const response = decoder.decode(buffer.subarray(0, n || 0));
      
      console.log(`[${timestamp}] 📥 SMTP RESP: ${response.trim()}`);
      
      if (response.startsWith("5") || response.startsWith("4")) {
        console.error(`[${timestamp}] ❌ SMTP Error Response: ${response.trim()}`);
        throw new Error("SMTP error: " + response.trim());
      }
      return response;
    } catch (error) {
      console.error(`[${timestamp}] ❌ SMTP Command failed:`, error);
      throw error;
    }
  };

  try {
    console.log(`[${new Date().toISOString()}] 🤝 Starting SMTP handshake`);
    await sendCommand(""); // server greeting
    await sendCommand(`EHLO ${SMTP_CONFIG.hostname}`);
    
    console.log(`[${new Date().toISOString()}] 🔐 Starting authentication`);
    await sendCommand("AUTH LOGIN");
    await sendCommand(toBase64(SMTP_CONFIG.username), true);
    await sendCommand(toBase64(SMTP_CONFIG.password), true);
    console.log(`[${new Date().toISOString()}] ✅ Authentication successful`);
    
    console.log(`[${new Date().toISOString()}] 📧 Setting email parameters`);
    await sendCommand(`MAIL FROM:<${SMTP_CONFIG.username}>`);
    await sendCommand(`RCPT TO:<${to}>`);
    await sendCommand("DATA");

    const data = `From: Exhibit3Design <${SMTP_CONFIG.username}>
To: ${to}
Subject: ${subject}
Content-Type: text/html; charset=UTF-8

${htmlContent}
\r\n.\r\n`;

    console.log(`[${new Date().toISOString()}] 📝 Sending email content (${data.length} bytes)`);
    await conn.write(encoder.encode(data));
    await sendCommand("QUIT");
    
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ✅ Email sent successfully to ${to} in ${duration}ms`);
    
    return { success: true, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] ❌ Email send failed after ${duration}ms:`, error);
    throw error;
  } finally {
    if (conn) {
      try {
        conn.close();
        console.log(`[${new Date().toISOString()}] 🔌 SMTP connection closed`);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] ⚠️ Error closing connection:`, error);
      }
    }
  }
}

// In-memory rate limiter
const RATE_LIMIT = {
  maxAttempts: 3,
  windowMs: 15 * 60 * 1000,
};
const emailAttempts = new Map<string, { count: number; lastAttempt: number }>();

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const entry = emailAttempts.get(email);
  if (!entry) {
    emailAttempts.set(email, { count: 1, lastAttempt: now });
    return true;
  }

  if (now - entry.lastAttempt > RATE_LIMIT.windowMs) {
    emailAttempts.set(email, { count: 1, lastAttempt: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT.maxAttempts) return false;

  entry.count++;
  entry.lastAttempt = now;
  return true;
}

// Main handler function
const handler = async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  
  console.log(`[${new Date().toISOString()}] 🌟 NEW REQUEST [${requestId}] ${req.method} ${req.url}`);
  
  if (req.method === "OPTIONS") {
    console.log(`[${new Date().toISOString()}] 🔄 CORS preflight request [${requestId}]`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`[${new Date().toISOString()}] 📨 Processing confirmation email request [${requestId}]`);
    const { email }: ConfirmationEmailRequest = await req.json();
    console.log(`[${new Date().toISOString()}] 📧 Email target: ${email} [${requestId}]`);

    if (!email || typeof email !== "string" || !email.includes("@")) {
      console.error(`[${new Date().toISOString()}] ❌ Invalid email format: ${email} [${requestId}]`);
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[${new Date().toISOString()}] 🚦 Checking rate limit for: ${email} [${requestId}]`);
    if (!checkRateLimit(email)) {
      console.warn(`[${new Date().toISOString()}] 🚫 Rate limit exceeded for: ${email} [${requestId}]`);
      return new Response(JSON.stringify({
        error: "Rate limit exceeded. Try again later.",
        rateLimited: true
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log(`[${new Date().toISOString()}] ✅ Rate limit check passed [${requestId}]`);

    console.log(`[${new Date().toISOString()}] 🔗 Generating Supabase confirmation link [${requestId}]`);
    const { data: authData, error: authError } = await supabase.auth.admin.generateLink({
      type: "signup",
      email,
      options: {
        redirectTo: "https://fipebdkvzdrljwwxccrj.supabase.co",
      },
    });

    if (authError || !authData) {
      console.error(`[${new Date().toISOString()}] ❌ Supabase generateLink failed [${requestId}]:`, authError);
      throw new Error(authError?.message ?? "Failed to get confirmation link");
    }
    
    const link = authData.properties?.action_link;
    console.log(`[${new Date().toISOString()}] ✅ Confirmation link generated successfully [${requestId}]`);

    const htmlContent = `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Welcome to Exhibit3Design!</h2>
        <p>Click below to confirm your email:</p>
        <p><a href="${link}" style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirm Email</a></p>
        <p>If you can't click the button, use this link:</p>
        <p><a href="${link}">${link}</a></p>
      </div>
    `;

    console.log(`[${new Date().toISOString()}] 📤 Initiating email send [${requestId}]`);
    sendAuthenticatedEmail(email, "Confirm Your Email - Exhibit3Design", htmlContent)
      .then(() => {
        console.log(`[${new Date().toISOString()}] ✅ Email send completed successfully [${requestId}]`);
      })
      .catch((error) => {
        console.error(`[${new Date().toISOString()}] ❌ Email send failed [${requestId}]:`, error);
      });

    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] 🎉 Request completed successfully in ${duration}ms [${requestId}]`);
    
    return new Response(JSON.stringify({
      success: true,
      message: "Confirmation email is being sent.",
      email,
      timestamp: new Date().toISOString(),
      requestId,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] ❌ Request failed after ${duration}ms [${requestId}]:`, error);

    return new Response(JSON.stringify({
      error: "Internal server error.",
      temporary: true,
      requestId,
      timestamp: new Date().toISOString(),
    }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);