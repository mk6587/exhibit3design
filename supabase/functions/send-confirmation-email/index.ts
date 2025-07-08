import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { SignupConfirmationEmail } from './_templates/signup-confirmation.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
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
    console.log('Received webhook request')
    
    // Check if secrets are configured
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    console.log('RESEND_API_KEY configured:', !!resendApiKey)
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured')
      throw new Error('RESEND_API_KEY not configured')
    }
    if (!hookSecret) {
      console.error('SEND_EMAIL_HOOK_SECRET not configured')
      throw new Error('SEND_EMAIL_HOOK_SECRET not configured')
    }

    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    console.log('Processing webhook for signup confirmation')
    console.log('Payload length:', payload.length)
    console.log('Headers present:', Object.keys(headers))
    
    // Try webhook verification
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
      
      const { user, email_data: { token, token_hash, redirect_to, email_action_type } } = webhookData

      console.log(`Webhook verified for user: ${user.email}, action: ${email_action_type}`)

      // Only send custom emails for signup confirmations
      if (email_action_type !== 'signup') {
        console.log('Email type not signup, skipping custom email')
        return new Response(
          JSON.stringify({ message: 'Email type not handled by custom sender' }),
          { status: 200, headers: corsHeaders }
        )
      }

      console.log('Rendering email template...')
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

      console.log('Sending email via Resend...')
      const { error } = await resend.emails.send({
        from: 'Exhibit3Design <noreply@registration.exhibit3design.com>',
        to: [user.email],
        subject: 'Welcome to Exhibit3Design - Confirm Your Account',
        html,
      })

      if (error) {
        console.error('Resend error:', error)
        throw new Error(`Resend error: ${error.message || 'Unknown Resend error'}`)
      }

      console.log(`Custom confirmation email sent successfully to ${user.email}`)

      return new Response(
        JSON.stringify({ message: 'Email sent successfully' }),
        { status: 200, headers: corsHeaders }
      )
      
    } catch (webhookError) {
      console.error('Webhook verification failed:', webhookError)
      throw new Error(`Webhook verification failed: ${webhookError.message}`)
    }
    
  } catch (error) {
    console.error('Error in send-confirmation-email function:', error)
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