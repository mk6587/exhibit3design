import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'

const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

// Initialize Supabase client for calling the centralized email service
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('not allowed', { status: 400 })
  }

  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)
  const wh = new Webhook(hookSecret)
  
  try {
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

    console.log('📨 Processing email confirmation for:', user.email, 'Type:', email_action_type)

    // Determine template and subject based on action type
    const isPasswordReset = email_action_type === 'recovery'
    const templateName = isPasswordReset ? 'password-reset' : 'signup-confirmation'
    const subject = isPasswordReset 
      ? 'Reset Your Password - Exhibit3Design'
      : 'Welcome to Exhibit3Design - Confirm your account'

    console.log('📧 Using centralized email service:', { 
      to: user.email, 
      subject, 
      template: templateName,
      type: email_action_type 
    })

    // Use the centralized send-email service
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: user.email,
        subject,
        template: {
          name: templateName,
          props: {
            supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
            token,
            token_hash,
            redirect_to,
            email_action_type,
            user_email: user.email,
          }
        }
      }
    })

    if (error) {
      console.error('❌ Centralized email service error:', error)
      throw error
    }
    
    console.log('✅ Email sent successfully via centralized service')
    
  } catch (error) {
    console.error('❌ Email sending error:', error)
    return new Response(
      JSON.stringify({
        error: {
          http_code: error.code || 500,
          message: error.message,
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})