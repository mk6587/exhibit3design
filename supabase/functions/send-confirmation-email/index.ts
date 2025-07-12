import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Logger utility for debugging
 */
class Logger {
  static info(message: string, data?: any): void {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
    if (data) {
      console.log('[INFO] Data:', JSON.stringify(data, null, 2));
    }
  }

  static error(message: string, error?: any): void {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    if (error) {
      if (error instanceof Error) {
        console.error('[ERROR] Stack:', error.stack);
        console.error('[ERROR] Message:', error.message);
      } else {
        console.error('[ERROR] Details:', JSON.stringify(error, null, 2));
      }
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    Logger.info('=== Confirmation Email Hook Started ===')
    
    const payload = await req.text()
    Logger.info('Received webhook payload, delegating to welcome email function')

    // Parse the webhook payload to extract user email
    let webhookData;
    try {
      webhookData = JSON.parse(payload);
    } catch (parseError) {
      Logger.error('Failed to parse webhook payload', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid webhook payload' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const userEmail = webhookData?.record?.email || webhookData?.user?.email;
    
    if (!userEmail) {
      Logger.error('No user email found in webhook data', { data: webhookData });
      return new Response(
        JSON.stringify({ error: 'No user email found' }),
        { status: 400, headers: corsHeaders }
      );
    }

    Logger.info(`Processing confirmation for user: ${userEmail}`);

    // Create Supabase client to call the welcome email function
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Call the working welcome email function
    const confirmationUrl = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovableproject.com') || 'https://example.com'}/auth?confirmed=true`;
    
    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: {
        email: userEmail,
        confirmationUrl: confirmationUrl
      }
    });

    if (error) {
      Logger.error('Failed to call welcome email function', error);
      return new Response(
        JSON.stringify({ error: `Welcome email function failed: ${error.message}` }),
        { status: 500, headers: corsHeaders }
      );
    }

    Logger.info('Successfully delegated to welcome email function', { data });
    
    return new Response(
      JSON.stringify({ message: 'Confirmation email processed via welcome function', data }),
      { status: 200, headers: corsHeaders }
    );
      
  } catch (error) {
    Logger.error('=== Fatal error in confirmation email hook ===', error)
    return new Response(
      JSON.stringify({
        error: {
          message: error.message || 'Unknown error occurred',
        },
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    )
  }
})