import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import * as jose from "https://deno.land/x/jose@v5.9.6/index.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const secret = Deno.env.get('SHARED_JWT_SECRET');
    
    if (!secret) {
      console.error('SHARED_JWT_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify JWT token
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jose.jwtVerify(token, secretKey);

    const userId = payload.userId as string;
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Invalid token payload' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Increment user's AI token usage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // First, get current balance and usage
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('ai_tokens_used, ai_tokens_balance')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const currentUsage = currentProfile?.ai_tokens_used || 0;
    const currentBalance = currentProfile?.ai_tokens_balance || 0;

    // Check if user has tokens available
    if (currentBalance <= 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No tokens remaining',
          tokensUsed: currentUsage,
          tokensRemaining: 0,
          tokensBalance: 0
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Increment usage and decrement balance
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        ai_tokens_used: currentUsage + 1,
        ai_tokens_balance: currentBalance - 1
      })
      .eq('user_id', userId)
      .select('ai_tokens_used, ai_tokens_balance')
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update token usage' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newUsage = updatedProfile.ai_tokens_used;
    const tokensRemaining = updatedProfile.ai_tokens_balance;

    return new Response(
      JSON.stringify({
        success: true,
        tokensUsed: newUsage,
        tokensRemaining,
        tokensBalance: tokensRemaining
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in increment-ai-tokens:', error);
    
    // Handle JWT verification errors specifically
    if (error.code === 'ERR_JWT_EXPIRED') {
      return new Response(
        JSON.stringify({ error: 'Token expired' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
