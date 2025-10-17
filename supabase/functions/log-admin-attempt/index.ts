import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LogAttemptRequest {
  email: string;
  ipAddress?: string;
  success: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, ipAddress, success } = await req.json() as LogAttemptRequest;
    
    // Get client IP from request if not provided
    const clientIp = ipAddress || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    console.log('Logging admin login attempt:', { email, clientIp, success });

    // Log the attempt
    const { error } = await supabase.rpc('log_admin_login_attempt', {
      p_email: email,
      p_ip_address: clientIp,
      p_success: success
    });

    if (error) {
      console.error('Error logging attempt:', error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to log attempt'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in log-admin-attempt:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
