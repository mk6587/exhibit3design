import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Create Supabase client with the user's JWT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get user from JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      console.error('[check-ai-tokens] Auth error:', userError)
      throw new Error('Unauthorized')
    }

    // Query user_ai_tokens table for this user
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_ai_tokens')
      .select('tokens_used, tokens_limit, is_premium')
      .eq('user_id', user.id)
      .single()

    if (tokenError && tokenError.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('[check-ai-tokens] Database error:', tokenError)
      throw tokenError
    }

    // If no record exists, return default values
    const tokensUsed = tokenData?.tokens_used || 0
    const tokensLimit = tokenData?.tokens_limit || 100
    const isPremium = tokenData?.is_premium || false
    const tokensRemaining = Math.max(0, tokensLimit - tokensUsed)
    const tokensBalance = tokensRemaining

    return new Response(
      JSON.stringify({
        hasTokens: tokensRemaining > 0,
        tokensUsed,
        tokensRemaining,
        tokensBalance,
        tokensLimit,
        isPremium
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[check-ai-tokens] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: error.message === 'Unauthorized' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
