import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      throw new Error("Session not found");
    }

    const orderNumber = session.metadata?.orderNumber;
    if (!orderNumber) {
      throw new Error("Order number not found in session metadata");
    }

    // Update order status based on payment status
    let orderStatus = 'pending';
    if (session.payment_status === 'paid') {
      orderStatus = 'completed';
    } else if (session.payment_status === 'unpaid') {
      orderStatus = 'failed';
    }

    // Update the order in the database
    const { error } = await supabase
      .from('orders')
      .update({
        status: orderStatus,
        authority: session.payment_intent as string,
        updated_at: new Date().toISOString()
      })
      .eq('order_number', orderNumber);

    if (error) {
      console.error("Database update error:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentStatus: session.payment_status,
        orderStatus: orderStatus,
        orderNumber: orderNumber
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});