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

    // Query profiles table for this user's token data
    const { data: profile, error: tokenError } = await supabase
      .from('profiles')
      .select('ai_tokens_balance, ai_tokens_used, ai_tokens_limit, video_results_balance, video_results_used')
      .eq('user_id', user.id)
      .single()

    if (tokenError && tokenError.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('[check-ai-tokens] Database error:', tokenError)
      throw tokenError
    }

    // Calculate token values from profiles table
    const aiTokensBalance = profile?.ai_tokens_balance || 0
    const aiTokensUsed = profile?.ai_tokens_used || 0
    const aiTokensLimit = profile?.ai_tokens_limit || 2
    const videoResultsBalance = profile?.video_results_balance || 0
    const videoResultsUsed = profile?.video_results_used || 0
    
    // Total tokens = AI tokens + video results
    const tokensBalance = aiTokensBalance + videoResultsBalance
    const tokensUsed = aiTokensUsed + videoResultsUsed
    const tokensLimit = aiTokensLimit
    const tokensRemaining = tokensBalance
    
    // Check if user has active subscription (premium)
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gte('current_period_end', new Date().toISOString())
      .single()
    
    const isPremium = !!subscription

    return new Response(
      JSON.stringify({
        hasTokens: tokensRemaining > 0,
        tokensUsed: aiTokensUsed,
        tokensRemaining: aiTokensBalance,
        totalTokens: aiTokensBalance,
        monthlyLimit: aiTokensLimit,
        videoCredits: videoResultsBalance,
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
