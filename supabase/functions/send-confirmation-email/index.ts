import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'

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

  try {
    Logger.info('=== Confirmation Email Hook Started ===')
    
    const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET')
    
    if (!hookSecret) {
      Logger.error('SEND_EMAIL_HOOK_SECRET not configured')
      return new Response(
        JSON.stringify({ error: 'Hook secret not configured' }),
        { status: 500, headers: corsHeaders }
      )
    }

    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    
    Logger.info('Processing webhook with secret verification')

    try {
      const wh = new Webhook(hookSecret)
      const webhookData = wh.verify(payload, headers) as {
        user: { email: string }
        email_data: { email_action_type: string }
      }
      
      Logger.info('✅ Webhook verified successfully')
      
      // Only handle signup confirmations
      if (webhookData.email_data?.email_action_type !== 'signup') {
        Logger.info('Not a signup confirmation, returning success')
        return new Response(
          JSON.stringify({ message: 'Not a signup confirmation' }),
          { status: 200, headers: corsHeaders }
        )
      }

      Logger.info('✅ Signup confirmation processed - emails handled by app')
      
      return new Response(
        JSON.stringify({ 
          message: 'Confirmation email hook processed successfully',
          note: 'Actual email sending handled by application'
        }),
        { status: 200, headers: corsHeaders }
      )
      
    } catch (webhookError) {
      Logger.error('Webhook verification failed', webhookError)
      return new Response(
        JSON.stringify({ error: `Webhook verification failed: ${webhookError.message}` }),
        { status: 400, headers: corsHeaders }
      )
    }
      
  } catch (error) {
    Logger.error('=== Fatal error in confirmation email hook ===', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    )
  }
})