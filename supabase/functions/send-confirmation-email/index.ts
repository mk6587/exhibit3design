import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { SignupConfirmationEmail } from './_templates/signup-confirmation.tsx'

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
  console.log('📧 Sending email via SMTP to:', to)
  
  try {
    // Create SMTP connection
    const conn = await Deno.connect({
      hostname: smtpConfig.host,
      port: smtpConfig.port,
    })

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    // Helper to send command and read response
    async function sendCommand(command: string): Promise<string> {
      await conn.write(encoder.encode(command + '\r\n'))
      const buffer = new Uint8Array(1024)
      const n = await conn.read(buffer)
      return decoder.decode(buffer.subarray(0, n || 0))
    }

    // SMTP conversation
    await sendCommand(`EHLO ${smtpConfig.host}`)
    await sendCommand('STARTTLS')
    
    // Simple AUTH LOGIN (base64 encoded)
    await sendCommand('AUTH LOGIN')
    await sendCommand(btoa(smtpConfig.username))
    await sendCommand(btoa(smtpConfig.password))
    
    // Send email
    await sendCommand(`MAIL FROM:<${smtpConfig.fromEmail}>`)
    await sendCommand(`RCPT TO:<${to}>`)
    await sendCommand('DATA')
    
    const emailContent = [
      `From: Exhibit3Design <${smtpConfig.fromEmail}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      '',
      html,
      '.',
    ].join('\r\n')
    
    await conn.write(encoder.encode(emailContent + '\r\n'))
    await sendCommand('QUIT')
    
    conn.close()
    console.log('✅ Email sent successfully via SMTP')
    return { success: true }
  } catch (error) {
    console.error('❌ SMTP Error:', error)
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

    console.log('📨 Processing email for:', user.email, 'Type:', email_action_type)

    const html = await renderAsync(
      React.createElement(SignupConfirmationEmail, {
        supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
        token,
        token_hash,
        redirect_to,
        email_action_type,
        user_email: user.email,
      })
    )

    // Determine email content based on action type
    const isPasswordReset = email_action_type === 'recovery'
    const subject = isPasswordReset 
      ? 'Reset Your Password - Exhibit3Design'
      : 'Welcome to Exhibit3Design - Confirm your account'

    // Send email via SMTP
    await sendEmail(user.email, subject, html)
    
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