import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LoginValidationRequest {
  email: string;
  ipAddress?: string;
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

    const { email, ipAddress } = await req.json() as LoginValidationRequest;
    
    // Get client IP from request if not provided
    const clientIp = ipAddress || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    console.log('Validating admin login:', { email, clientIp });

    // Check IP whitelist
    const { data: isWhitelisted, error: whitelistError } = await supabase
      .rpc('check_admin_ip_whitelist', { p_ip_address: clientIp });

    if (whitelistError) {
      console.error('Error checking IP whitelist:', whitelistError);
      return new Response(
        JSON.stringify({ 
          allowed: false, 
          reason: 'ip_check_failed',
          message: 'Failed to verify IP address'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!isWhitelisted) {
      console.log('IP not whitelisted:', clientIp);
      
      // Log failed attempt
      await supabase.rpc('log_admin_login_attempt', {
        p_email: email,
        p_ip_address: clientIp,
        p_success: false
      });

      return new Response(
        JSON.stringify({ 
          allowed: false, 
          reason: 'ip_not_whitelisted',
          message: `Access denied. IP address ${clientIp} is not whitelisted for admin access.`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Check rate limiting
    const { data: rateLimit, error: rateLimitError } = await supabase
      .rpc('check_admin_rate_limit', { 
        p_email: email,
        p_ip_address: clientIp
      });

    if (rateLimitError) {
      console.error('Error checking rate limit:', rateLimitError);
      return new Response(
        JSON.stringify({ 
          allowed: false, 
          reason: 'rate_limit_check_failed',
          message: 'Failed to verify rate limits'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!rateLimit.allowed) {
      console.log('Rate limit exceeded:', rateLimit);
      const lockoutMinutes = Math.ceil(
        (new Date(rateLimit.lockout_until).getTime() - Date.now()) / 60000
      );
      
      return new Response(
        JSON.stringify({ 
          allowed: false, 
          reason: 'rate_limit_exceeded',
          message: `Too many failed login attempts. Please try again in ${lockoutMinutes} minutes.`,
          lockoutUntil: rateLimit.lockout_until,
          emailAttempts: rateLimit.email_attempts,
          ipAttempts: rateLimit.ip_attempts
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      );
    }

    // All checks passed
    console.log('Login validation passed');
    return new Response(
      JSON.stringify({ 
        allowed: true,
        message: 'Validation successful',
        emailAttempts: rateLimit.email_attempts,
        ipAttempts: rateLimit.ip_attempts
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in validate-admin-login:', error);
    return new Response(
      JSON.stringify({ 
        allowed: false, 
        reason: 'internal_error',
        message: 'An internal error occurred during validation'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
