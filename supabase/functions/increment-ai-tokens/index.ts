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
    // Get request body for AI generation details
    const requestBody = await req.json();
    const { prompt, serviceType, inputImageUrl, outputImageUrl } = requestBody;

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

    // Use atomic token deduction to prevent race conditions
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Atomically deduct 1 AI token with race condition prevention
    const { data: result, error: deductError } = await supabase
      .rpc('deduct_tokens_atomic', {
        p_user_id: userId,
        p_token_type: 'ai_tokens',
        p_amount: 1,
        p_source: 'ai_studio',
        p_metadata: { 
          timestamp: new Date().toISOString(),
          source_app: 'ai.exhibit3design.com'
        }
      });

    if (deductError) {
      console.error('Error deducting tokens:', deductError);
      return new Response(
        JSON.stringify({ error: 'Failed to update token usage' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if deduction was successful
    if (!result || !result.success) {
      console.log('Insufficient token balance for user:', userId);
      return new Response(
        JSON.stringify({ 
          error: result?.error || 'No tokens remaining',
          message: result?.message || 'Insufficient AI tokens balance',
          tokensRemaining: 0
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create AI generation history record
    const { error: historyError } = await supabase
      .from('ai_generation_history')
      .insert({
        user_id: userId,
        prompt: prompt || 'AI Generation',
        service_type: serviceType || 'image_edit',
        input_image_url: inputImageUrl,
        output_image_url: outputImageUrl || '',
        tokens_used: 1,
        is_public_sample: false
      });

    if (historyError) {
      console.error('Error creating AI generation history:', historyError);
      // Don't fail the request if history creation fails
    }

    // Get updated usage stats
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('ai_tokens_used, ai_tokens_balance')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching updated profile:', profileError);
    }

    const newUsage = profile?.ai_tokens_used || 0;
    const tokensRemaining = result.balance || 0;

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
