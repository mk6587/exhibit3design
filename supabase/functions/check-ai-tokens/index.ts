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

    // Query user's AI token usage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Use the get_user_token_balance function to get accurate token data including limits
    const { data: tokenData, error } = await supabase
      .rpc('get_user_token_balance', { p_user_id: userId });

    if (error) {
      console.error('Error fetching token balance:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get ai_tokens_used from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('ai_tokens_used')
      .eq('user_id', userId)
      .single();

    const tokensUsed = profile?.ai_tokens_used || 0;
    const tokensBalance = tokenData?.[0]?.ai_tokens || 0;
    const tokensLimit = tokenData?.[0]?.ai_tokens_limit || 2;
    const hasTokens = tokensBalance > 0;

    return new Response(
      JSON.stringify({
        hasTokens,
        tokensUsed,
        tokensRemaining: tokensBalance,
        tokensBalance,
        tokensLimit
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in check-ai-tokens:', error);
    
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
