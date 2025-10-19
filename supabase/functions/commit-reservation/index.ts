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
    const { reservationId, aiResultUrl } = await req.json();

    if (!reservationId || !aiResultUrl) {
      console.error('[CommitReservation] Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing reservationId or aiResultUrl' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[CommitReservation] Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing or invalid Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const secret = Deno.env.get('SHARED_JWT_SECRET');
    if (!secret) {
      console.error('[CommitReservation] SHARED_JWT_SECRET not configured');
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
      console.error('[CommitReservation] JWT verification failed:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[CommitReservation] Committing reservation ${reservationId} for user ${userId}`);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Call the atomic commit function
    const { data, error } = await supabase.rpc('commit_reservation_atomic', {
      p_reservation_id: reservationId,
      p_user_id: userId,
      p_ai_result_url: aiResultUrl
    });

    if (error) {
      console.error('[CommitReservation] Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to commit reservation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!data.success) {
      console.warn(`[CommitReservation] Commit failed: ${data.error}`);
      return new Response(
        JSON.stringify({ error: data.error }),
        { status: data.status || 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[CommitReservation] Success! New balance: ${data.newBalance}`);

    return new Response(
      JSON.stringify({
        success: true,
        newBalance: data.newBalance
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[CommitReservation] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
