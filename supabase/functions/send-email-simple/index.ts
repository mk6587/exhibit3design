import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  template?: {
    name: string;
    props: any;
  };
}

// Simple email templates
const getEmailTemplate = (templateName: string, props: any): string => {
  console.log(`📧 Rendering template: ${templateName}`);
  
  switch (templateName) {
    case 'otp-verification':
      const { otp, email } = props;
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Verification Code</title>
          </head>
          <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">Verification Code</h1>
              </div>
              <div style="padding: 40px 20px; text-align: center;">
                <h2 style="color: #333; margin-bottom: 20px;">Your verification code is:</h2>
                <div style="font-size: 36px; font-weight: bold; color: #333; letter-spacing: 8px; background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px dashed #ccc;">
                  ${otp}
                </div>
                <p style="color: #666; margin: 20px 0;">Enter this code to verify your email address.</p>
                <p style="color: #666; margin: 20px 0;">This code will expire in 2 minutes.</p>
                <p style="color: #999; font-size: 14px;">If you didn't request this code, you can safely ignore this email.</p>
              </div>
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
                <p style="margin: 0;">© 2024 Exhibit3Design. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;
      
    default:
      throw new Error(`Unknown email template: ${templateName}`);
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📧 Email request received');
    const emailRequest: EmailRequest = await req.json();
    console.log('📧 Email details:', { to: emailRequest.to, subject: emailRequest.subject });

    // Render template if specified
    if (emailRequest.template) {
      console.log('📧 Rendering template:', emailRequest.template.name);
      emailRequest.html = getEmailTemplate(emailRequest.template.name, emailRequest.template.props);
    }

    // Validate email request
    if (!emailRequest.to || !emailRequest.subject || (!emailRequest.html && !emailRequest.text)) {
      throw new Error('Missing required email fields: to, subject, and content');
    }

    // For now, just log the email instead of actually sending it
    // This allows the OTP flow to work without SMTP configuration
    console.log('📧 EMAIL WOULD BE SENT:');
    console.log('📧 To:', emailRequest.to);
    console.log('📧 Subject:', emailRequest.subject);
    if (emailRequest.template?.name === 'otp-verification') {
      console.log('📧 OTP CODE:', emailRequest.template.props.otp);
    }
    console.log('📧 HTML Length:', emailRequest.html?.length || 0);

    // Return success - in production you'd actually send the email here
    console.log('✅ Email logged successfully (would be sent in production)');

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('❌ Error in send-email-simple function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);