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
  console.log(`✉️ Sending authenticated SMTP email to ${to}`);

  const conn = await Deno.connectTls({
    hostname: SMTP_CONFIG.hostname,
    port: SMTP_CONFIG.port,
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const sendCommand = async (command: string, hideInLog = false) => {
    if (!hideInLog) console.log("📤", command);
    await conn.write(encoder.encode(command + "\r\n"));
    const buffer = new Uint8Array(1024);
    const n = await conn.read(buffer);
    const response = decoder.decode(buffer.subarray(0, n || 0));
    if (response.startsWith("5") || response.startsWith("4")) {
      throw new Error("SMTP error: " + response.trim());
    }
    return response;
  };

  await sendCommand(""); // server greeting
  await sendCommand(`EHLO ${SMTP_CONFIG.hostname}`);
  await sendCommand("AUTH LOGIN");
  await sendCommand(toBase64(SMTP_CONFIG.username), true);
  await sendCommand(toBase64(SMTP_CONFIG.password), true);
  await sendCommand(`MAIL FROM:<${SMTP_CONFIG.username}>`);
  await sendCommand(`RCPT TO:<${to}>`);
  await sendCommand("DATA");

  const data = `From: Exhibit3Design <${SMTP_CONFIG.username}>
To: ${to}
Subject: ${subject}
Content-Type: text/html; charset=UTF-8

${htmlContent}
\r\n.\r\n`;

  await conn.write(encoder.encode(data));
  await sendCommand("QUIT");
  conn.close();

  console.log("✅ Email sent successfully to", to);
  return { success: true };
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: ConfirmationEmailRequest = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@"))
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    if (!checkRateLimit(email)) {
      return new Response(JSON.stringify({
        error: "Rate limit exceeded. Try again later.",
        rateLimited: true
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: authData, error: authError } = await supabase.auth.admin.generateLink({
      type: "signup",
      email,
      options: {
        redirectTo: "https://fipebdkvzdrljwwxccrj.supabase.co",
      },
    });

    if (authError || !authData) {
      console.error("⚠️ Supabase error:", authError);
      throw new Error(authError?.message ?? "Failed to get confirmation link");
    }

    const link = authData.properties?.action_link;
    const htmlContent = `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Welcome to Exhibit3Design!</h2>
        <p>Click below to confirm your email:</p>
        <p><a href="${link}" style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirm Email</a></p>
        <p>If you can't click the button, use this link:</p>
        <p><a href="${link}">${link}</a></p>
      </div>
    `;

    sendAuthenticatedEmail(email, "Confirm Your Email - Exhibit3Design", htmlContent).catch(console.error);

    return new Response(JSON.stringify({
      success: true,
      message: "Confirmation email is being sent.",
      email,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Error:", error);

    return new Response(JSON.stringify({
      error: "Internal server error.",
      temporary: true,
    }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);