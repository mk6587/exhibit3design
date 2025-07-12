import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
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
    
    // Parse the webhook payload
    const payload = await req.text()
    Logger.info('Received webhook payload', { payloadLength: payload.length })
    
    // For now, simply process all webhook calls successfully
    // The actual email sending is handled in the auth page
    Logger.info('✅ Webhook processed successfully - emails handled by app')
    
    return new Response(
      JSON.stringify({ 
        message: 'Confirmation email hook processed successfully',
        note: 'Actual email sending handled by application'
      }),
      { 
        status: 200, 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
      
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