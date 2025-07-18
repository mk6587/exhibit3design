import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { PasswordResetEmail } from './_templates/password-reset.tsx'

const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

// SMTP configuration from Supabase secrets
const smtpConfig = {
  host: Deno.env.get('SMTP_HOST') as string,
  port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
  username: Deno.env.get('SMTP_USER') as string,
  password: Deno.env.get('SMTP_PASSWORD') as string,
  fromEmail: Deno.env.get('SMTP_FROM_EMAIL') as string,
}

async function sendEmail(to: string, subject: string, html: string) {
  console.log('📧 Sending password reset email via SMTP to:', to)
  console.log('📧 SMTP Config:', { 
    host: smtpConfig.host, 
    port: smtpConfig.port, 
    username: smtpConfig.username,
    fromEmail: smtpConfig.fromEmail 
  })
  
  try {
    // Use denomailer for SMTP
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

    console.log('📧 Connecting to SMTP server for password reset...')
    
    await client.send({
      from: smtpConfig.fromEmail,
      to,
      subject,
      content: html,
      html,
    })

    console.log('✅ Password reset email sent successfully via SMTP')
    await client.close()
    
    return { success: true }
  } catch (error) {
    console.error('❌ Password Reset SMTP Error:', error)
    throw error
  }
}

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

    console.log('🔑 Processing password reset email for:', user.email, 'Type:', email_action_type)

    const html = await renderAsync(
      React.createElement(PasswordResetEmail, {
        supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
        token,
        token_hash,
        redirect_to,
        email_action_type,
        user_email: user.email,
      })
    )

    const subject = 'Reset Your Password - Exhibit3Design'

    console.log('📧 Attempting to send password reset email:', { 
      to: user.email, 
      subject, 
      type: email_action_type 
    })

    // Send email via SMTP
    await sendEmail(user.email, subject, html)
    
    console.log('✅ Password reset email processing completed successfully')
    
  } catch (error) {
    console.error('❌ Password reset email sending error:', error)
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