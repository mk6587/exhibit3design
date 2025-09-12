import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 SSO Status Check: Request received');

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ SSO Status Check: No valid authorization header');
      return new Response(
        JSON.stringify({ 
          authenticated: false, 
          message: 'No authentication provided' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Extract the token
    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 SSO Status Check: Token received');

    // Verify the user with the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.log('❌ SSO Status Check: Invalid token or user not found:', userError?.message);
      return new Response(
        JSON.stringify({ 
          authenticated: false, 
          message: 'Invalid authentication token' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    console.log('✅ SSO Status Check: User authenticated:', user.email);

    // Generate SSO token for automatic login
    const tokenId = crypto.randomUUID();
    const timestamp = Date.now();
    const expiresAt = new Date(Date.now() + (10 * 60 * 1000)); // 10 minutes
    const redirectUrl = `https://designers.exhibit3design.com`;

    // Store the SSO token in database
    const { error: insertError } = await supabase
      .from('sso_tokens')
      .insert({
        id: tokenId,
        token: `${tokenId}-${timestamp}`,
        user_id: user.id,
        user_email: user.email!,
        redirect_url: redirectUrl,
        expires_at: expiresAt.toISOString(),
        used: false
      });

    if (insertError) {
      console.error('❌ SSO Status Check: Failed to store token:', insertError);
      return new Response(
        JSON.stringify({ 
          authenticated: true,
          user: {
            id: user.id,
            email: user.email
          },
          message: 'User authenticated but SSO token generation failed'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    const ssoToken = `${tokenId}-${timestamp}`;
    const autoLoginUrl = `https://designers.exhibit3design.com/auth?sso_token=${ssoToken}&sso_user=${user.id}&sso_email=${encodeURIComponent(user.email!)}&sso_expires=${Math.floor(expiresAt.getTime() / 1000)}`;

    console.log('✅ SSO Status Check: Generated auto-login URL');

    return new Response(
      JSON.stringify({
        authenticated: true,
        user: {
          id: user.id,
          email: user.email
        },
        autoLoginUrl,
        ssoToken,
        message: 'User authenticated and SSO token generated'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ SSO Status Check: Exception:', error);
    return new Response(
      JSON.stringify({ 
        authenticated: false, 
        message: 'Internal server error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});