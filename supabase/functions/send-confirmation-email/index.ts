// File: server.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
}

const SMTP_CONFIG = {
  hostname: "mail.exhibit3design.com",
  port: 465, // Explicit SSL (use connectTls)
  username: "noreply@exhibit3design.com",
  password: "y*[-T%fglcTi",
  secure: "ssl" as const,
};

const supabase = createClient(
  "https://fipebdkvzdrljwwxccrj.supabase.co",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

function encodeBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

async function sendEmailWithSSL(to: string, subject: string, html: string) {
  const conn = await Deno.connectTls({
    hostname: SMTP_CONFIG.hostname,
    port: SMTP_CONFIG.port,
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const readResponse = async (): Promise<string> => {
    const buffer = new Uint8Array(2048);
    const n = await conn.read(buffer);
    if (n === null) throw new Error("No response from SMTP server");
    return decoder.decode(buffer.subarray(0, n));
  };

  const sendCommand = async (cmd: string, hide = false): Promise<string> => {
    if (!hide) console.log("➡️ SMTP:", cmd);
    await conn.write(encoder.encode(cmd + "\r\n"));
    const response = await readResponse();
    if (response.startsWith("4") || response.startsWith("5")) {
      throw new Error(`SMTP error: ${response.trim()}`);
    }
    return response;
  };

  // Full SMTP sequence
  await readResponse(); // greeting
  await sendCommand(`EHLO ${SMTP_CONFIG.hostname}`);
  await sendCommand("AUTH LOGIN");
  await sendCommand(encodeBase64(SMTP_CONFIG.username), true);
  await sendCommand(encodeBase64(SMTP_CONFIG.password), true);
  await sendCommand(`MAIL FROM:<${SMTP_CONFIG.username}>`);
  await sendCommand(`RCPT TO:<${to}>`);
  await sendCommand("DATA");

  const messageData = `From: Exhibit3Design <${SMTP_CONFIG.username}>
To: ${to}
Subject: ${subject}
Content-Type: text/html; charset=UTF-8

${html}
\r\n.\r\n`;

  await conn.write(encoder.encode(messageData));
  await sendCommand("QUIT");
  conn.close();

  console.log("✅ Secure email sent to", to);
  return { success: true };
}

// Rate limiter
const RATE_LIMIT = {
  maxAttempts: 3,
  windowMs: 15 * 60 * 1000, // 15 mins
};
const emailAttempts = new Map<string, { count: number; lastAttempt: number }>();

function isAllowed(email: string) {
  const now = Date.now();
  const info = emailAttempts.get(email);

  if (!info) {
    emailAttempts.set(email, { count: 1, lastAttempt: now });
    return true;
  }

  if (now - info.lastAttempt > RATE_LIMIT.windowMs) {
    emailAttempts.set(email, { count: 1, lastAttempt: now });
    return true;
  }

  if (info.count >= RATE_LIMIT.maxAttempts) {
    return false;
  }

  info.count++;
  info.lastAttempt = now;
  return true;
}

// Main HTTP function
const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: ConfirmationEmailRequest = await req.json();

    if (
      !email ||
      typeof email !== "string" ||
      !email.match(/^[^@]+@[^@]+\.[^@]+$/)
    ) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isAllowed(email)) {
      return new Response(JSON.stringify({
        error: "Rate limit exceeded. Please wait before trying again.",
        rateLimited: true,
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data, error } = await supabase.auth.admin.generateLink({
      type: "signup",
      email,
      options: {
        redirectTo: "https://fipebdkvzdrljwwxccrj.supabase.co",
      },
    });

    if (error || !data?.properties?.action_link) {
      console.error("❌ Supabase generateLink error:", error);
      throw new Error("Failed to generate confirmation link.");
    }

    const html = `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Welcome to Exhibit3Design!</h2>
        <p>Click the button below to confirm your email:</p>
        <a href="${data.properties.action_link}" style="display: inline-block; padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px;">Confirm Email</a>
        <p>If you can't click the button, copy and paste this link into your browser:</p>
        <p><a href="${data.properties.action_link}">${data.properties.action_link}</a></p>
      </div>
    `;

    sendEmailWithSSL(email, "Confirm your email - Exhibit3Design", html).catch(console.error);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Confirmation email is being sent",
        email,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("❌ Email send error:", err);
    return new Response(JSON.stringify({
      error: "Failed to send confirmation email",
    }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);