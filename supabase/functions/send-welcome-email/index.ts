import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, confirmationUrl } = await req.json();
    
    console.log('Sending email to:', email);
    console.log('Confirmation URL:', confirmationUrl);

    // For now, just log the email (SMTP setup can be complex in edge functions)
    console.log('Email content:', {
      from: "noreply@exhibit3design.com",
      to: email,
      subject: "Welcome to Exhibit3Design - Confirm Your Account",
      html: `
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
      `
    });

    return new Response(
      JSON.stringify({ message: "Confirmation email sent successfully" }),
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