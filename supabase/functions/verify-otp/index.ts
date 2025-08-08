import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyOTPRequest {
  email: string;
  otp: string;
  captchaToken?: string;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp, captchaToken }: VerifyOTPRequest = await req.json();

    if (!email || !otp) {
      return new Response(
        JSON.stringify({ error: 'Email and OTP are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Clean up expired OTPs
    await supabase.rpc('cleanup_expired_otps');

    // Find valid OTP
    const { data: otpRecord, error: fetchError } = await supabase
      .from('otp_registrations')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .eq('verified', false)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (fetchError || !otpRecord) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired verification code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark OTP as verified
    await supabase
      .from('otp_registrations')
      .update({ verified: true })
      .eq('id', otpRecord.id);

    // Check if user exists by searching through all users
    let existingUser = null;
    try {
      const { data: allUsers } = await supabase.auth.admin.listUsers();
      existingUser = allUsers?.users?.find(user => user.email === email);
    } catch (error) {
      console.error('Error listing users:', error);
    }

    let authResponse;

    if (existingUser) {
      // Existing user - generate a magic link session
      try {
        const { data, error } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: email,
        });

        if (error) {
          console.error('Error generating magic link:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to authenticate user' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        authResponse = { 
          user: existingUser, 
          session: null,
          magicLink: data.properties?.action_link
        };
      } catch (error) {
        console.error('Authentication failed:', error);
        return new Response(
          JSON.stringify({ error: 'Authentication failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (otpRecord.password_hash) {
      // New user registration
      try {
        const { data, error } = await supabase.auth.admin.createUser({
          email: email,
          password: otpRecord.password_hash,
          email_confirm: true,
          user_metadata: {
            email_verified: true
          }
        });

        if (error) {
          console.error('Error creating user:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to create user account' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Generate magic link for new user
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: email,
        });

        authResponse = { 
          user: data.user, 
          session: null,
          isNewUser: true,
          magicLink: linkData?.properties?.action_link
        };
      } catch (error) {
        console.error('User creation failed:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create user account' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'User not found and no registration data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean up OTP record
    await supabase
      .from('otp_registrations')
      .delete()
      .eq('id', otpRecord.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email verified successfully',
        user: authResponse.user,
        magicLink: authResponse.magicLink,
        isNewUser: authResponse.isNewUser || false
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in verify-otp function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
