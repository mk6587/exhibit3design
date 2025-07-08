import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    const { error } = await resend.emails.send({
      from: "Exhibit3Design <noreply@registration.exhibit3design.com>",
      to: [email],
      subject: "Welcome to Exhibit3Design!",
      html: `
        <h1>Welcome to Exhibit3Design!</h1>
        <p>Thank you for joining us! You can now access affordable exhibition stand design files.</p>
        <p>Start browsing our collection and download professional designs.</p>
        <p>Best regards,<br>The Exhibit3Design Team</p>
      `,
    });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ message: "Welcome email sent successfully" }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});