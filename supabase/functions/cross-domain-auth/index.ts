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

      // Store token temporarily (you could use a dedicated table for this)
      const tokenData = {
        token: crossDomainToken,
        user_id: user.id,
        user_email: user.email,
        expires_at: expiresAt.toISOString(),
        redirect_url: redirectUrl || 'https://designers.exhibit3design.com',
        created_at: new Date().toISOString()
      }

      // For now, we'll store in a simple way - in production you might want a dedicated table
      console.log('Generated cross-domain token:', { token: crossDomainToken, userId: user.id })

      // Create the redirect URL with token
      const targetUrl = new URL(redirectUrl || 'https://designers.exhibit3design.com')
      targetUrl.searchParams.set('sso_token', crossDomainToken)
      targetUrl.searchParams.set('sso_user', user.id)
      targetUrl.searchParams.set('sso_email', user.email || '')
      targetUrl.searchParams.set('sso_expires', Math.floor(expiresAt.getTime() / 1000).toString())

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
      // Verify cross-domain token and create session
      if (!token) {
        return new Response(
          JSON.stringify({ error: 'Token required' }),
          { status: 400, headers: corsHeaders }
        )
      }

      // In a real implementation, you'd verify this against stored token data
      // For now, we'll do basic validation
      const [uuid, timestamp] = token.split('-')
      if (!uuid || !timestamp) {
        return new Response(
          JSON.stringify({ error: 'Invalid token format' }),
          { status: 400, headers: corsHeaders }
        )
      }

      const tokenAge = Date.now() - parseInt(timestamp)
      if (tokenAge > 10 * 60 * 1000) { // 10 minutes
        return new Response(
          JSON.stringify({ error: 'Token expired' }),
          { status: 400, headers: corsHeaders }
        )
      }

      // This is a simplified verification - in production you'd check against stored data
      return new Response(
        JSON.stringify({ 
          success: true, 
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