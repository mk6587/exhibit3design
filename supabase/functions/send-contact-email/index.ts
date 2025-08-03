import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// SMTP configuration from Supabase secrets (same as confirmation email)
const smtpConfig = {
  host: Deno.env.get('SMTP_HOST') as string,
  port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
  username: Deno.env.get('SMTP_USER') as string,
  password: Deno.env.get('SMTP_PASSWORD') as string,
  fromEmail: Deno.env.get('SMTP_FROM_EMAIL') as string,
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

async function sendEmail(to: string, subject: string, html: string) {
  console.log('📧 Sending contact email via SMTP to:', to)
  console.log('📧 SMTP Config:', { 
    host: smtpConfig.host, 
    port: smtpConfig.port, 
    username: smtpConfig.username,
    fromEmail: smtpConfig.fromEmail 
  })
  
  try {
    // Use the same SMTP approach as confirmation emails
    const { SMTPClient } = await import('https://deno.land/x/denomailer@1.6.0/mod.ts')
    
    const client = new SMTPClient({
      connection: {
        hostname: smtpConfig.host,
        port: smtpConfig.port,
        tls: true,
        auth: {
          username: smtpConfig.username,
          password: smtpConfig.password,
        },
      },
    })

    console.log('📧 Connecting to SMTP server...')
    
    await client.send({
      from: smtpConfig.fromEmail,
      to,
      subject,
      content: html,
      html,
    })

    console.log('✅ Contact email sent successfully via SMTP')
    await client.close()
    
    return { success: true }
  } catch (error) {
    console.error('❌ SMTP Error:', error)
    throw error
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactEmailRequest = await req.json();

    console.log('📬 Processing contact form submission:', { name, email, subject });

    // Create HTML email content
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Contact Form Message</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">New Contact Form Message</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Contact Details</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 0;"><strong>Subject:</strong> ${subject}</p>
            </div>
            
            <h3 style="color: #333; margin-bottom: 15px;">Message:</h3>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
              <p style="margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #e8f4fd; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #0066cc; font-size: 14px;">
                <strong>Reply directly to this email to respond to ${name}</strong>
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>This message was sent from the Exhibit3Design contact form</p>
          </div>
        </body>
      </html>
    `;

    // Send email to info@exhibit3design.com
    await sendEmail('info@exhibit3design.com', `Contact Form: ${subject}`, html);

    console.log("✅ Contact email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ Error in send-contact-email function:", error);
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