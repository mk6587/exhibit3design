import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'

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

      // For now, just log the email content (SMTP setup can be complex in edge functions)
      const confirmationUrl = `${Deno.env.get('SUPABASE_URL') ?? 'https://fipebdkvzdrljwwxccrj.supabase.co'}/auth/v1/verify?token=${token}&type=signup&redirect_to=${encodeURIComponent(redirect_to)}`
      
      console.log('Email content that would be sent:', {
        from: "noreply@exhibit3design.com",
        to: user.email,
        subject: "Welcome to Exhibit3Design - Confirm Your Account",
        confirmationUrl: confirmationUrl,
        token: token,
        token_hash: token_hash,
        redirect_to: redirect_to
      })

      console.log(`=== Success! Email details logged for ${user.email} ===`)
      return new Response(
        JSON.stringify({ message: 'Confirmation email processed successfully' }),
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