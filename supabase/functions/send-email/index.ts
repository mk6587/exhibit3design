import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import React from 'npm:react@18.3.1';
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// SMTP configuration from Supabase secrets
const smtpConfig = {
  host: Deno.env.get('SMTP_HOST') as string,
  port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
  username: Deno.env.get('SMTP_USER') as string,
  password: Deno.env.get('SMTP_PASSWORD') as string,
  fromEmail: Deno.env.get('SMTP_FROM_EMAIL') as string,
};

// Log SMTP configuration (without password) for debugging
console.log('🔧 SMTP Configuration:', {
  host: smtpConfig.host,
  port: smtpConfig.port,
  username: smtpConfig.username,
  fromEmail: smtpConfig.fromEmail,
  hasPassword: !!smtpConfig.password
});

interface EmailRequest {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  bcc?: string | string[];
  cc?: string | string[];
  template?: {
    name: string;
    props: any;
  };
}

interface WebhookEmailData {
  user: {
    email: string;
  };
  email_data?: {
    token?: string;
    token_hash?: string;
    redirect_to?: string;
    email_action_type?: string;
    site_url?: string;
  };
}

// Enhanced SMTP client using denomailer
async function sendSMTPEmail(emailRequest: EmailRequest): Promise<void> {
  console.log('📧 Sending email via SMTP');
  console.log('📧 SMTP Config:', { 
    host: smtpConfig.host, 
    port: smtpConfig.port, 
    username: smtpConfig.username,
    fromEmail: smtpConfig.fromEmail 
  });

  // Validate recipients
  const recipients = Array.isArray(emailRequest.to) ? emailRequest.to : [emailRequest.to];
  for (const recipient of recipients) {
    if (!recipient || !recipient.includes('@')) {
      throw new Error(`Invalid email address: ${recipient}`);
    }
  }

  try {
    const { SMTPClient } = await import('https://deno.land/x/denomailer@1.6.0/mod.ts');
    
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
    });

    console.log('📧 Connecting to SMTP server...');

    // Prepare recipients
    const bccRecipients = emailRequest.bcc ? (Array.isArray(emailRequest.bcc) ? emailRequest.bcc : [emailRequest.bcc]) : [];
    const ccRecipients = emailRequest.cc ? (Array.isArray(emailRequest.cc) ? emailRequest.cc : [emailRequest.cc]) : [];

    // Validate BCC and CC recipients
    [...bccRecipients, ...ccRecipients].forEach(email => {
      if (email && !email.includes('@')) {
        throw new Error(`Invalid email address: ${email}`);
      }
    });

    // Send email to all recipients
    for (const recipient of recipients) {
      try {
        await client.send({
          from: `Exhibit3Design <${smtpConfig.fromEmail}>`,
          to: recipient,
          bcc: bccRecipients.length > 0 ? bccRecipients.join(', ') : undefined,
          cc: ccRecipients.length > 0 ? ccRecipients.join(', ') : undefined,
          subject: emailRequest.subject,
          content: emailRequest.text || emailRequest.html || '',
          html: emailRequest.html,
        });

        console.log(`✅ Email sent successfully to: ${recipient}`);
      } catch (sendError) {
        console.error(`❌ Failed to send email to ${recipient}:`, sendError);
        throw new Error(`Failed to send email to ${recipient}: ${sendError.message}`);
      }
    }

    await client.close();
    console.log('✅ SMTP connection closed');
    
  } catch (error) {
    console.error('❌ SMTP Error:', error);
    throw new Error(`SMTP Error: ${error.message || error}`);
  }
}

// Email templates registry
const getEmailTemplate = async (templateName: string, props: any): Promise<string> => {
  console.log(`📧 Rendering template: ${templateName}`);
  
  switch (templateName) {
    case 'signup-confirmation':
      const { SignupConfirmationEmail } = await import('./_templates/signup-confirmation.tsx');
      return await renderAsync(React.createElement(SignupConfirmationEmail, props));
      
    case 'password-reset':
      const { PasswordResetEmail } = await import('./_templates/password-reset.tsx');
      return await renderAsync(React.createElement(PasswordResetEmail, props));
      
    case 'contact-notification':
      return generateContactNotificationEmail(props);
      
    case 'otp-verification':
      return generateOTPVerificationEmail(props);
      
    default:
      throw new Error(`Unknown email template: ${templateName}`);
  }
};

// Generate OTP verification email HTML
function generateOTPVerificationEmail(props: any): string {
  const { otp, email } = props;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Code</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 20px; text-align: center; }
          .otp { font-size: 36px; font-weight: bold; color: #333; letter-spacing: 8px; background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px dashed #ccc; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verification Code</h1>
          </div>
          <div class="content">
            <h2>Your verification code is:</h2>
            <div class="otp">${otp}</div>
            <p>Enter this code to verify your email address. This code will expire in 2 minutes.</p>
            <p>If you didn't request this code, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 Exhibit3Design. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Generate order confirmation email HTML
function generateOrderConfirmationEmail(props: any): string {
  const { order, orderNumber, customerName } = props;
  
  // Validate required props
  if (!order || !orderNumber || !customerName) {
    throw new Error('Missing required props for order confirmation email');
  }

  // Safely parse amount
  const amount = order.amount ? parseFloat(order.amount) : 0;
  const formattedAmount = amount > 0 ? amount.toFixed(2) : '0.00';
  
  // Safely format date
  const paymentDate = order.created_at 
    ? new Date(order.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString();
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
          .success-icon { font-size: 48px; margin-bottom: 10px; }
          .section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #28a745; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e9ecef; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; align-items: center; }
          .label { font-weight: bold; color: #495057; }
          .value { color: #212529; }
          .amount { color: #212529; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">✅</div>
            <h1>Payment Successful!</h1>
            <p>Thank you for your purchase, ${customerName}</p>
          </div>
          
          <div class="section">
            <h3>🎉 Your payment has been processed successfully</h3>
            <p>We're excited to prepare your design files! Your order has been confirmed and our team is already working on processing your files.</p>
          </div>
          
          <div class="order-details">
            <h3 style="margin-top: 0; color: #495057;">📋 Order Summary</h3>
            <div class="detail-row">
              <span class="label">Order Number:</span>
              <span class="value" style="font-family: monospace; font-weight: bold;">${orderNumber}</span>
            </div>
            <div class="detail-row">
              <span class="label">Amount Paid:</span>
              <span class="amount">€${formattedAmount}</span>
            </div>
            <div class="detail-row">
              <span class="label">Payment Date:</span>
              <span class="value">${paymentDate}</span>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Exhibit3Design</strong></p>
            <p>Premium exhibition stand design files for professionals</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Generate contact notification email HTML
function generateContactNotificationEmail(props: any): string {
  const { name, email, message } = props;
  
  // Validate required props
  if (!name || !email || !message) {
    throw new Error('Missing required props for contact notification email');
  }

  // Sanitize inputs to prevent HTML injection
  const safeName = String(name).replace(/[<>]/g, '');
  const safeEmail = String(email).replace(/[<>]/g, '');
  const safeMessage = String(message).replace(/[<>]/g, '').replace(/\n/g, '<br>');
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Contact Form Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
          .timestamp { color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Contact Form Submission</h2>
            <div class="timestamp">Received: ${new Date().toLocaleString()}</div>
          </div>
          <div class="content">
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Message:</strong></p>
            <p>${safeMessage}</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    let emailRequest: EmailRequest;
    let isWebhook = false;

    // Check if this is a webhook request
    const webhookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET');
    if (webhookSecret && req.headers.get('webhook-signature')) {
      console.log('📧 Processing webhook email request');
      isWebhook = true;
      
      const payload = await req.text();
      const headers = Object.fromEntries(req.headers);
      const wh = new Webhook(webhookSecret);
      
      const webhookData = wh.verify(payload, headers) as WebhookEmailData;
      
      // Transform webhook data to email request
      if (webhookData.email_data) {
        const { email_action_type } = webhookData.email_data;
        const isPasswordReset = email_action_type === 'recovery';
        
        emailRequest = {
          to: webhookData.user.email,
          subject: isPasswordReset 
            ? 'Reset Your Password - Exhibit3Design'
            : 'Welcome to Exhibit3Design - Confirm your account',
          template: {
            name: isPasswordReset ? 'password-reset' : 'signup-confirmation',
            props: {
              supabase_url: Deno.env.get('SUPABASE_URL') || '',
              user_email: webhookData.user.email,
              ...webhookData.email_data
            }
          }
        };
      } else {
        throw new Error('Invalid webhook data');
      }
    } else {
      console.log('📧 Processing direct API email request');
      emailRequest = await req.json();
    }

    // Validate SMTP configuration
    if (!smtpConfig.host || !smtpConfig.username || !smtpConfig.password || !smtpConfig.fromEmail) {
      throw new Error('SMTP configuration incomplete');
    }

    // Render template if specified
    if (emailRequest.template) {
      emailRequest.html = await getEmailTemplate(emailRequest.template.name, emailRequest.template.props);
    }

    // Validate email request
    if (!emailRequest.to || !emailRequest.subject || (!emailRequest.html && !emailRequest.text)) {
      throw new Error('Missing required email fields: to, subject, and content (html or text)');
    }

    // Additional validation
    if (emailRequest.subject.length > 200) {
      throw new Error('Email subject too long (max 200 characters)');
    }

    // Validate recipient emails
    const recipients = Array.isArray(emailRequest.to) ? emailRequest.to : [emailRequest.to];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    for (const recipient of recipients) {
      if (!emailRegex.test(recipient)) {
        throw new Error(`Invalid email format: ${recipient}`);
      }
    }

    console.log('📧 Sending email to:', emailRequest.to);
    console.log('📧 Subject:', emailRequest.subject);

    // Send email via SMTP
    await sendSMTPEmail(emailRequest);

    console.log('✅ Email sent successfully');

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
    console.error('❌ Error in send-email function:', error);
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