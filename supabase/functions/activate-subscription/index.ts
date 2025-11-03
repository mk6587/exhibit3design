import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

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
    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create client with user's auth token for verification
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { orderNumber, planId } = await req.json();

    if (!orderNumber || !planId) {
      return new Response(
        JSON.stringify({ error: 'Missing orderNumber or planId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create service role client for secure operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Verify the subscription order exists and belongs to the user
    const { data: order, error: orderError } = await supabaseAdmin
      .from('subscription_orders')
      .select('*')
      .eq('order_number', orderNumber)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      console.error('Order verification failed:', orderError);
      return new Response(
        JSON.stringify({ error: 'Order not found or unauthorized' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Verify order is in completed status (payment successful)
    if (order.status !== 'completed') {
      return new Response(
        JSON.stringify({ error: 'Order not completed. Payment may be pending or failed.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Get subscription plan details
    const { data: plan, error: planError } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      console.error('Plan fetch failed:', planError);
      return new Response(
        JSON.stringify({ error: 'Invalid subscription plan' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Calculate subscription period (one-time purchase, expires at end of period)
    const now = new Date();
    const periodEnd = new Date(now);
    if (plan.billing_period === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    // 5. Create or update subscription (one-time purchase, no auto-renewal)
    const { error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .upsert({
        user_id: user.id,
        plan_id: planId,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: true // One-time purchase, will expire after period
      });

    if (subError) {
      console.error('Failed to create subscription:', subError);
      return new Response(
        JSON.stringify({ error: 'Failed to activate subscription' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Grant tokens using secure atomic function
    const { data: tokenResult, error: tokenError } = await supabaseAdmin
      .rpc('grant_tokens_atomic', {
        p_user_id: user.id,
        p_ai_tokens: plan.initial_ai_tokens || 0,
        p_video_results: plan.video_results || 0,
        p_source: 'subscription',
        p_metadata: {
          plan_id: planId,
          plan_name: plan.name,
          order_number: orderNumber,
          billing_period: plan.billing_period
        }
      });

    if (tokenError) {
      console.error('Failed to grant tokens:', tokenError);
      // Subscription was created but tokens failed - log for manual review
      return new Response(
        JSON.stringify({ 
          error: 'Subscription activated but failed to grant tokens. Contact support.',
          subscription_created: true
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Subscription activated successfully:', {
      user_id: user.id,
      plan_id: planId,
      tokens_granted: tokenResult
    });

    return new Response(
      JSON.stringify({
        success: true,
        subscription: {
          plan_name: plan.name,
          period_end: periodEnd.toISOString()
        },
        tokens: tokenResult
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in activate-subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
