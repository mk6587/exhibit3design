import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import * as jose from "https://deno.land/x/jose@v5.9.6/index.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[GetUserBalance] Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing or invalid Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const secret = Deno.env.get('SHARED_JWT_SECRET');
    if (!secret) {
      console.error('[GetUserBalance] SHARED_JWT_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify and decode JWT
    let userId: string;
    try {
      const secretKey = new TextEncoder().encode(secret);
      const { payload } = await jose.jwtVerify(token, secretKey);
      userId = payload.userId as string;

      if (!userId) {
        throw new Error('No userId in token');
      }
    } catch (error) {
      console.error('[GetUserBalance] JWT verification failed:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[GetUserBalance] Getting balance for user ${userId}`);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Clean up expired reservations first
    await supabase.rpc('cleanup_expired_reservations');

    // Get user profile with available balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('ai_tokens_balance, reserved_tokens')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      console.error('[GetUserBalance] Failed to get profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get active subscription
    const { data: subscription } = await supabase.rpc('get_active_subscription', {
      p_user_id: userId
    });

    const availableBalance = profile.ai_tokens_balance - profile.reserved_tokens;
    const subscriptionPlan = subscription?.[0]?.plan_name || 'Free';
    const isPremium = subscription?.[0]?.file_access_tier === 'premium' || false;

    console.log(`[GetUserBalance] Balance: ${availableBalance}, Plan: ${subscriptionPlan}, Premium: ${isPremium}`);

    return new Response(
      JSON.stringify({
        balance: availableBalance,
        totalBalance: profile.ai_tokens_balance,
        reservedTokens: profile.reserved_tokens,
        subscriptionPlan,
        isPremium
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[GetUserBalance] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
