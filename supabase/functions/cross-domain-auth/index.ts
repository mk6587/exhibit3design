import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, token, redirectUrl } = await req.json()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (action === 'generate') {
      // Get current user from authorization header
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: corsHeaders }
        )
      }

      // Verify user session with anon key client
      const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!)
      const { data: { user }, error: authError } = await anonClient.auth.getUser(
        authHeader.replace('Bearer ', '')
      )

      if (authError || !user) {
        console.error('Auth verification failed:', authError)
        return new Response(
          JSON.stringify({ error: 'Invalid session' }),
          { status: 401, headers: corsHeaders }
        )
      }

      // Generate secure cross-domain token
      const crossDomainToken = crypto.randomUUID() + '-' + Date.now()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Store token in database
      const { error: insertError } = await supabase
        .from('sso_tokens')
        .insert({
          token: crossDomainToken,
          user_id: user.id,
          user_email: user.email || '',
          redirect_url: redirectUrl || 'https://designers.exhibit3design.com',
          expires_at: expiresAt.toISOString()
        })

      if (insertError) {
        console.error('Failed to store SSO token:', insertError)
        return new Response(
          JSON.stringify({ error: 'Failed to generate SSO token' }),
          { status: 500, headers: corsHeaders }
        )
      }

      // Create the redirect URL with token
      const targetUrl = new URL(redirectUrl || 'https://designers.exhibit3design.com')
      targetUrl.searchParams.set('sso_token', crossDomainToken)
      targetUrl.searchParams.set('sso_user', user.id)
      targetUrl.searchParams.set('sso_email', user.email || '')
      targetUrl.searchParams.set('sso_expires', Math.floor(expiresAt.getTime() / 1000).toString())

      console.log('Generated cross-domain token:', { token: crossDomainToken, userId: user.id, redirectUrl: targetUrl.toString() })

      return new Response(
        JSON.stringify({ 
          success: true, 
          redirectUrl: targetUrl.toString(),
          token: crossDomainToken,
          expiresAt: expiresAt.toISOString()
        }),
        { headers: corsHeaders }
      )
    }

    if (action === 'verify') {
      // Clean up expired tokens first
      await supabase.rpc('cleanup_expired_sso_tokens')

      // Verify cross-domain token
      if (!token) {
        return new Response(
          JSON.stringify({ error: 'Token required' }),
          { status: 400, headers: corsHeaders }
        )
      }

      // Verify token against database
      const { data: tokenData, error: tokenError } = await supabase
        .from('sso_tokens')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (tokenError || !tokenData) {
        console.error('Token verification failed:', tokenError)
        return new Response(
          JSON.stringify({ error: 'Invalid or expired token' }),
          { status: 400, headers: corsHeaders }
        )
      }

      // Mark token as used
      await supabase
        .from('sso_tokens')
        .update({ used: true })
        .eq('token', token)

      return new Response(
        JSON.stringify({ 
          success: true, 
          user_id: tokenData.user_id,
          user_email: tokenData.user_email,
          message: 'Token verified successfully' 
        }),
        { headers: corsHeaders }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: corsHeaders }
    )

  } catch (error) {
    console.error('Cross-domain auth error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    )
  }
})