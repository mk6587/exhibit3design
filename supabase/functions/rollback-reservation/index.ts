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
    const { reservationId, reason } = await req.json();

    if (!reservationId || !reason) {
      console.error('[RollbackReservation] Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing reservationId or reason' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[RollbackReservation] Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing or invalid Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const secret = Deno.env.get('SHARED_JWT_SECRET');
    if (!secret) {
      console.error('[RollbackReservation] SHARED_JWT_SECRET not configured');
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
      console.error('[RollbackReservation] JWT verification failed:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[RollbackReservation] Rolling back reservation ${reservationId} for user ${userId}: ${reason}`);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Call the atomic rollback function
    const { data, error } = await supabase.rpc('rollback_reservation_atomic', {
      p_reservation_id: reservationId,
      p_user_id: userId,
      p_reason: reason
    });

    if (error) {
      console.error('[RollbackReservation] Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to rollback reservation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!data.success) {
      console.warn(`[RollbackReservation] Rollback failed: ${data.error}`);
      return new Response(
        JSON.stringify({ error: data.error }),
        { status: data.status || 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[RollbackReservation] Success! Refunded tokens, new balance: ${data.newBalance}`);

    return new Response(
      JSON.stringify({
        success: true,
        newBalance: data.newBalance
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[RollbackReservation] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
