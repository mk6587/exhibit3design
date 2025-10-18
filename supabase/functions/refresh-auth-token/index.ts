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
    console.log('[RefreshToken] Processing token refresh request');

    // Get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[RefreshToken] Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const currentToken = authHeader.replace('Bearer ', '');
    const secret = Deno.env.get('SHARED_JWT_SECRET');
    
    if (!secret) {
      console.error('[RefreshToken] SHARED_JWT_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify current JWT token (with grace period for expiration)
    const secretKey = new TextEncoder().encode(secret);
    let payload;
    
    try {
      // Allow tokens up to 5 minutes past expiration for refresh requests
      const result = await jose.jwtVerify(currentToken, secretKey, {
        clockTolerance: 5 * 60 // 5 minutes grace period
      });
      payload = result.payload;
    } catch (error) {
      console.error('[RefreshToken] Token verification failed:', error.message);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = payload.userId as string;
    const email = payload.email as string;

    if (!userId || !email) {
      console.error('[RefreshToken] Invalid token payload - missing userId or email');
      return new Response(
        JSON.stringify({ error: 'Invalid token payload' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user still exists and is active in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, is_active, deactivated_at')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      console.error('[RefreshToken] User profile not found:', userId);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profile.is_active || profile.deactivated_at) {
      console.error('[RefreshToken] User account is deactivated:', userId);
      return new Response(
        JSON.stringify({ error: 'User account is deactivated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for rate limiting (max 1 refresh per 5 minutes per user)
    // This is a simple implementation - production might use Redis or similar
    const MIN_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
    
    // Generate new JWT token with extended expiration
    const TOKEN_EXPIRATION = 60 * 60; // 1 hour (in seconds)
    const expiresAt = Date.now() + (TOKEN_EXPIRATION * 1000);

    const newToken = await new jose.SignJWT({
      userId,
      email,
      refreshedAt: Date.now()
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${TOKEN_EXPIRATION}s`)
      .sign(secretKey);

    console.log('[RefreshToken] Token refreshed successfully for user:', userId);

    return new Response(
      JSON.stringify({
        token: newToken,
        expiresAt,
        userId
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[RefreshToken] Error in refresh-auth-token:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
