import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    console.log('=== Function started ===')
    
    // Check if secrets are configured
    const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET')
    
    console.log('SEND_EMAIL_HOOK_SECRET configured:', !!hookSecret)
    
    if (!hookSecret) {
      console.error('SEND_EMAIL_HOOK_SECRET not configured')
      return new Response(
        JSON.stringify({ error: 'SEND_EMAIL_HOOK_SECRET not configured' }),
        { status: 500, headers: corsHeaders }
      )
    }

    console.log('=== Getting request data ===')
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    
    console.log('Payload length:', payload.length)
    console.log('Headers present:', Object.keys(headers))
    
    // Try webhook verification
    console.log('=== Starting webhook verification ===')
    try {
      const wh = new Webhook(hookSecret)
      const webhookData = wh.verify(payload, headers) as {
        user: {
          email: string
        }
        email_data: {
          token: string
          token_hash: string
          redirect_to: string
          email_action_type: string
          site_url: string
        }
      }
      
      console.log('=== Webhook verified successfully ===')
      const { user, email_data: { token, token_hash, redirect_to, email_action_type } } = webhookData

      console.log(`User email: ${user.email}, action: ${email_action_type}`)

      // Only handle signup confirmations
      if (email_action_type !== 'signup') {
        console.log('Email type not signup, skipping custom email')
        return new Response(
          JSON.stringify({ message: 'Email type not handled by custom sender' }),
          { status: 200, headers: corsHeaders }
        )
      }

      // Send confirmation email using SMTP
      const confirmationUrl = `${Deno.env.get('SUPABASE_URL') ?? 'https://fipebdkvzdrljwwxccrj.supabase.co'}/auth/v1/verify?token=${token}&type=signup&redirect_to=${encodeURIComponent(redirect_to)}`
      
      console.log('=== Sending confirmation email via SMTP ===')
      
      // Create SMTP client
      const client = new SmtpClient();
      
      await client.connectTLS({
        hostname: "mail.exhibit3design.com",
        port: 465,
        username: "noreply@exhibit3design.com",
        password: "hMYDp2uQAO8x",
      });

      // Send email
      await client.send({
        from: "noreply@exhibit3design.com",
        to: user.email,
        subject: "Welcome to Exhibit3Design - Confirm Your Account",
        content: `
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
        `,
        html: true,
      });

      await client.close();

      console.log(`=== Success! Email sent to ${user.email} ===`)
      return new Response(
        JSON.stringify({ message: 'Confirmation email sent successfully' }),
        { status: 200, headers: corsHeaders }
      )
      
    } catch (webhookError) {
      console.error('=== Webhook verification failed ===')
      console.error('Webhook error:', webhookError)
      console.error('Webhook error message:', webhookError.message)
      return new Response(
        JSON.stringify({ error: `Webhook verification failed: ${webhookError.message}` }),
        { status: 500, headers: corsHeaders }
      )
    }
    
  } catch (error) {
    console.error('=== Fatal error in function ===')
    console.error('Error:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    return new Response(
      JSON.stringify({
        error: {
          message: error.message || 'Unknown error occurred',
        },
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    )
  }
})