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
  console.log('🔧 Verify OTP Request received');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp, captchaToken }: VerifyOTPRequest = await req.json();
    console.log('📧 Processing OTP verification for email:', email);

    if (!email || !otp) {
      console.error('❌ Missing email or OTP');
      return new Response(
        JSON.stringify({ error: 'Email and OTP are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔧 Created Supabase client');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Clean up expired OTPs
    console.log('🧹 Cleaning up expired OTPs');
    await supabase.rpc('cleanup_expired_otps');

    // First, let's check if any OTP record exists for this email
    console.log('🔍 Checking for OTP record with email:', email);
    const { data: existingOTPs, error: findError } = await supabase.rpc('find_otp_by_email', {
      search_email: email
    });

    console.log('📝 Found OTP records:', { 
      count: existingOTPs ? existingOTPs.length : 0,
      findError: findError ? findError.message : 'none'
    });

    if (findError) {
      console.error('❌ Error finding OTP records:', findError);
      return new Response(JSON.stringify({ 
        error: 'Database error during OTP lookup' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!existingOTPs || existingOTPs.length === 0) {
      console.error('❌ No OTP record found for email:', email);
      return new Response(JSON.stringify({ 
        error: 'No verification code found for this email. Please request a new code.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log the first OTP record details (without showing sensitive data)
    const firstOTP = existingOTPs[0];
    console.log('📝 OTP record details:', {
      id: firstOTP.id,
      verified: firstOTP.verified,
      expires_at: firstOTP.expires_at,
      created_at: firstOTP.created_at,
      has_password_hash: !!firstOTP.password_hash,
      expired: new Date(firstOTP.expires_at) < new Date()
    });

    // Check if OTP is expired
    if (new Date(firstOTP.expires_at) < new Date()) {
      console.error('❌ OTP has expired at:', firstOTP.expires_at);
      return new Response(JSON.stringify({ 
        error: 'Verification code has expired. Please request a new code.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if OTP was already verified
    if (firstOTP.verified) {
      console.error('❌ OTP was already verified');
      return new Response(JSON.stringify({ 
        error: 'Verification code has already been used. Please request a new code.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Now verify the OTP code using the database function
    console.log('🔍 Verifying OTP code with input:', otp);
    const { data: otpRecords, error: fetchError } = await supabase.rpc('verify_otp_code', {
      search_email: email,
      input_otp: otp
    });

    console.log('📝 OTP verification result:', { 
      hasRecords: !!otpRecords && otpRecords.length > 0, 
      error: fetchError?.message || 'none' 
    });

    if (fetchError) {
      console.error('❌ Database error during OTP verification:', fetchError);
      return new Response(JSON.stringify({ 
        error: 'Database verification error' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!otpRecords || otpRecords.length === 0) {
      console.error('❌ OTP code does not match. Input OTP:', otp);
      return new Response(JSON.stringify({ 
        error: 'Invalid verification code. Please check the code and try again.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const otpRecord = otpRecords[0];
    console.log('✅ Valid OTP found, record ID:', otpRecord.id);

    // Mark OTP as verified
    console.log('📝 Marking OTP as verified');
    await supabase
      .from('otp_registrations')
      .update({ verified: true })
      .eq('id', otpRecord.id);

    // Check if user exists by searching through all users
    console.log('👤 Checking if user exists');
    let existingUser = null;
    try {
      const { data: allUsers, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        console.error('❌ Error listing users:', listError);
        throw listError;
      }
      existingUser = allUsers?.users?.find(user => user.email === email);
      console.log('👤 User lookup result:', existingUser ? 'Found existing user' : 'New user');
    } catch (error) {
      console.error('❌ Error listing users:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to verify user status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
    console.error('❌ Error in verify-otp function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
