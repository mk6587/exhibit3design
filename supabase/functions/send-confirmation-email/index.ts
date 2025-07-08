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
    if (!Deno.env.get('RESEND_API_KEY')) {
      throw new Error('RESEND_API_KEY not configured')
    }
    if (!hookSecret) {
      throw new Error('SEND_EMAIL_HOOK_SECRET not configured')
    }

    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    console.log('Processing webhook for signup confirmation')
    
    // Remove the v1,whsec_ prefix if present
    const cleanSecret = hookSecret.startsWith('v1,whsec_') ? hookSecret.slice(9) : hookSecret
    const wh = new Webhook(cleanSecret)
    
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as {
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