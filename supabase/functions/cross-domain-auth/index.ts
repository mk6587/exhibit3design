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
      try {
        console.log('🔗 SSO: Starting token generation process')
        
        // Get current user from authorization header
        const authHeader = req.headers.get('Authorization')
        console.log('🔗 SSO: Auth header present:', !!authHeader)
        
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401, headers: corsHeaders }
          )
        }

        // Verify user session with anon key client
        const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!)
        console.log('🔗 SSO: Verifying user session...')
        
        const { data: { user }, error: authError } = await anonClient.auth.getUser(
          authHeader.replace('Bearer ', '')
        )

        if (authError || !user) {
          console.error('🔗 SSO: Auth verification failed:', authError)
          return new Response(
            JSON.stringify({ error: 'Invalid session' }),
            { status: 401, headers: corsHeaders }
          )
        }

        console.log('🔗 SSO: User verified:', user.id)

        // Generate secure cross-domain token
        const crossDomainToken = crypto.randomUUID() + '-' + Date.now()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        
        console.log('🔗 SSO: Generated token:', crossDomainToken)

        // Store token in database
        console.log('🔗 SSO: Storing token in database...')
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
          console.error('🔗 SSO: Failed to store SSO token:', insertError)
          return new Response(
            JSON.stringify({ error: 'Failed to generate SSO token' }),
            { status: 500, headers: corsHeaders }
          )
        }

        console.log('🔗 SSO: Token stored successfully')

        // Create the redirect URL with token
        const targetUrl = new URL(redirectUrl || 'https://designers.exhibit3design.com')
        
        // Validate the target URL
        if (!targetUrl.hostname || targetUrl.hostname === 'blank') {
          console.error('🔗 SSO: Invalid redirect URL provided:', redirectUrl)
          return new Response(
            JSON.stringify({ error: 'Invalid redirect URL provided' }),
            { status: 400, headers: corsHeaders }
          )
        }
        
        targetUrl.searchParams.set('sso_token', crossDomainToken)
        targetUrl.searchParams.set('sso_user', user.id)
        targetUrl.searchParams.set('sso_email', user.email || '')
        targetUrl.searchParams.set('sso_expires', Math.floor(expiresAt.getTime() / 1000).toString())

        const finalRedirectUrl = targetUrl.toString()
        
        console.log('🔗 SSO: Final redirect URL:', finalRedirectUrl)
        
        // Final validation of the complete URL
        try {
          const validateUrl = new URL(finalRedirectUrl)
          if (!validateUrl.protocol.startsWith('http') || !validateUrl.hostname) {
            throw new Error('Invalid final redirect URL')
          }
        } catch (validationError) {
          console.error('🔗 SSO: Final URL validation failed:', finalRedirectUrl, validationError)
          return new Response(
            JSON.stringify({ error: 'Generated redirect URL is invalid' }),
            { status: 500, headers: corsHeaders }
          )
        }

        console.log('🔗 SSO: Generated cross-domain token:', { 
          token: crossDomainToken, 
          userId: user.id, 
          redirectUrl: finalRedirectUrl,
          originalRedirectUrl: redirectUrl 
        })

        return new Response(
          JSON.stringify({ 
            success: true, 
            redirectUrl: finalRedirectUrl,
            token: crossDomainToken,
            expiresAt: expiresAt.toISOString()
          }),
          { headers: corsHeaders }
        )
      } catch (error) {
        console.error('🔗 SSO: Unexpected error in generate action:', error)
        return new Response(
          JSON.stringify({ error: 'Internal server error during token generation' }),
          { status: 500, headers: corsHeaders }
        )
      }
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