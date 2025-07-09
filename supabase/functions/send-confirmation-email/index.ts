import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { SignupConfirmationEmail } from './_templates/signup-confirmation.tsx'

const smtp = new SMTPClient({
  connection: {
    hostname: Deno.env.get("SMTP_HOST") || "mail.exhibit3design.com",
    port: parseInt(Deno.env.get("SMTP_PORT") || "465"),
    tls: true,
    auth: {
      username: Deno.env.get("SMTP_USER") || "noreply@exhibit3design.com",
      password: Deno.env.get("SMTP_PASS") || "",
    },
  },
});
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
    const smtpPass = Deno.env.get('SMTP_PASS')
    const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET')
    
    console.log('SMTP_PASS configured:', !!smtpPass)
    console.log('SEND_EMAIL_HOOK_SECRET configured:', !!hookSecret)
    
    if (!smtpPass) {
      console.error('SMTP_PASS not configured')
      return new Response(
        JSON.stringify({ error: 'SMTP_PASS not configured' }),
        { status: 500, headers: corsHeaders }
      )
    }
    
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

      // Only send custom emails for signup confirmations
      if (email_action_type !== 'signup') {
        console.log('Email type not signup, skipping custom email')
        return new Response(
          JSON.stringify({ message: 'Email type not handled by custom sender' }),
          { status: 200, headers: corsHeaders }
        )
      }

      console.log('=== Rendering email template ===')
      const html = await renderAsync(
        React.createElement(SignupConfirmationEmail, {
          supabase_url: Deno.env.get('SUPABASE_URL') ?? 'https://fipebdkvzdrljwwxccrj.supabase.co',
          token,
          token_hash,
          redirect_to,
          email_action_type,
          user_email: user.email,
        })
      )

      console.log('=== Sending email via SMTP ===')
      await smtp.send({
        from: 'Exhibit3Design <noreply@exhibit3design.com>',
        to: user.email,
        subject: 'Welcome to Exhibit3Design - Confirm Your Account',
        html,
      })

      console.log(`=== Success! Email sent to ${user.email} ===`)
      return new Response(
        JSON.stringify({ message: 'Email sent successfully' }),
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