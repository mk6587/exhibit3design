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

// Turnstile validation function
async function validateTurnstileCaptcha(token: string, secretKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Turnstile validation error:', error);
    return false;
  }
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

    // Validate captcha token if provided (optional for OTP verification)
    if (captchaToken) {
      const turnstileSecretKey = Deno.env.get('TURNSTILE_SECRET_KEY');
      if (turnstileSecretKey) {
        console.log('🔐 Validating captcha token');
        const captchaValid = await validateTurnstileCaptcha(captchaToken, turnstileSecretKey);
        if (!captchaValid) {
          console.log('❌ Captcha validation failed for email:', email);
          return new Response(
            JSON.stringify({ error: 'Security verification failed. Please try again.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log('✅ Captcha validation successful for email:', email);
      }
    }

    console.log('🔧 Created Supabase client');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Clean up expired OTPs
    console.log('🧹 Cleaning up expired OTPs');
    await supabase.rpc('cleanup_expired_otps');

    // Debug: Let's check the raw OTP table to see what's stored
    console.log('🔍 DEBUG: Checking raw OTP table');
    const { data: rawOTPs, error: rawError } = await supabase
      .from('otp_registrations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    console.log('📝 DEBUG: Raw OTP records:', {
      count: rawOTPs ? rawOTPs.length : 0,
      rawError: rawError ? rawError.message : 'none',
      records: rawOTPs ? rawOTPs.map(r => ({
        id: r.id,
        created_at: r.created_at,
        expires_at: r.expires_at,
        verified: r.verified,
        email_encrypted: r.email?.substring(0, 20) + '...',
        otp_hashed: r.otp?.substring(0, 20) + '...'
      })) : []
    });

    // Try to find OTP record using the helper function
    console.log('🔍 Finding OTP record with helper function for email:', email);
    const { data: existingOTPs, error: findError } = await supabase.rpc('find_otp_by_email', {
      search_email: email
    });

    console.log('📝 Helper function result:', { 
      count: existingOTPs ? existingOTPs.length : 0,
      findError: findError ? findError.message : 'none'
    });

    if (findError) {
      console.error('❌ Error finding OTP records:', findError);
      return new Response(JSON.stringify({ 
        error: 'Database error during OTP lookup: ' + findError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!existingOTPs || existingOTPs.length === 0) {
      console.error('❌ No OTP record found for email:', email);
      return new Response(JSON.stringify({ 
        error: 'No verification code found. Please request a new code.',
        errorType: 'no_code_found'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if OTP is already verified
    const otpCheck = existingOTPs[0];
    if (otpCheck.verified) {
      console.error('❌ OTP already verified for email:', email);
      return new Response(JSON.stringify({ 
        error: 'This code has already been used. Please request a new code.',
        errorType: 'code_already_used'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if OTP has expired
    const now = new Date();
    const expiresAt = new Date(otpCheck.expires_at);
    if (now > expiresAt) {
      console.error('❌ OTP expired for email:', email);
      return new Response(JSON.stringify({ 
        error: 'This code has expired. Please request a new code.',
        errorType: 'code_expired'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Now verify the OTP code using the database function
    console.log('🔍 Verifying OTP code with verify_otp_code function');
    console.log('📝 Input parameters:', { email: email, otp: otp });
    
    const { data: otpRecords, error: fetchError } = await supabase.rpc('verify_otp_code', {
      search_email: email,
      input_otp: otp
    });

    console.log('📝 verify_otp_code result:', { 
      hasRecords: !!otpRecords && otpRecords.length > 0, 
      recordCount: otpRecords ? otpRecords.length : 0,
      error: fetchError?.message || 'none' 
    });

    if (fetchError) {
      console.error('❌ Database error during OTP verification:', fetchError);
      return new Response(JSON.stringify({ 
        error: 'Database verification error: ' + fetchError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!otpRecords || otpRecords.length === 0) {
      console.error('❌ OTP verification failed - incorrect code');
      return new Response(JSON.stringify({ 
        error: 'Incorrect verification code. Please check and try again.',
        errorType: 'incorrect_code'
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
