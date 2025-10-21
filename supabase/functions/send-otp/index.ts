import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

// EdgeRuntime for background tasks
declare const EdgeRuntime: {
  waitUntil(promise: Promise<any>): void;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendOTPRequest {
  email: string;
  passwordHash?: string; // For checkout registration
  captchaToken?: string;
}

// Turnstile validation function
async function validateTurnstileCaptcha(token: string, secretKey: string, remoteIp?: string): Promise<boolean> {
  // Always pass validation for test tokens or test site key tokens
  if (token === 'test-token' || token.startsWith('XXXX.')) {
    console.log('🧪 Test captcha token detected - auto-passing validation');
    return true;
  }
  
  try {
    const formData = new URLSearchParams({
      secret: secretKey,
      response: token,
    });
    
    // Add remote IP if available (important for mobile validation)
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }
    
    console.log('🔐 Validating Turnstile with params:', {
      hasSecret: !!secretKey,
      hasToken: !!token,
      hasRemoteIp: !!remoteIp,
      remoteIp: remoteIp
    });
    
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const result = await response.json();
    console.log('🔐 Turnstile validation result:', result);
    return result.success === true;
  } catch (error) {
    console.error('Turnstile validation error:', error);
    return false;
  }
}

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Debug environment variables
console.log('🔧 Environment check:', {
  hasSupabaseUrl: !!supabaseUrl,
  hasServiceKey: !!supabaseServiceKey,
  supabaseUrlValue: supabaseUrl
});

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 OTP Request received');
    
    // Check environment variables first
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing environment variables:', {
        hasSupabaseUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
      });
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { email, passwordHash, captchaToken }: SendOTPRequest = await req.json();
    console.log('📧 Processing OTP for email:', email);

    if (!email) {
      console.error('❌ No email provided');
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate captcha token if provided (skip validation for test-token)
    if (captchaToken && captchaToken !== 'test-token') {
      const turnstileSecretKey = Deno.env.get('TURNSTILE_SECRET_KEY');
      if (!turnstileSecretKey) {
        console.error('❌ Turnstile secret key not configured');
        return new Response(
          JSON.stringify({ error: 'Captcha validation not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get client IP from headers
      const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                       req.headers.get('x-real-ip') || 
                       'unknown';
      
      console.log('🔐 Validating captcha token for IP:', clientIp);
      const captchaValid = await validateTurnstileCaptcha(captchaToken, turnstileSecretKey, clientIp);
      if (!captchaValid) {
        console.log('❌ Captcha validation failed for email:', email, 'IP:', clientIp);
        return new Response(
          JSON.stringify({ error: 'Security verification failed. Please try again.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('✅ Captcha validation successful for email:', email);
    } else if (captchaToken === 'test-token') {
      console.log('🧪 Using test captcha token - validation skipped');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Invalid email format:', email);
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Email format validated');

    // Rate limiting: Check if an OTP was sent recently (within 1 minute)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('🔧 Created Supabase client');
    
    console.log('🔍 Checking for recent OTP');
    const { data: hasRecentOTP, error: recentOtpError } = await supabase.rpc('check_recent_otp', {
      search_email: email
    });
    
    if (recentOtpError) {
      console.error('❌ Error checking recent OTP:', recentOtpError);
      return new Response(
        JSON.stringify({ error: 'Database error checking rate limit' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('✅ Recent OTP check result:', hasRecentOTP);

    if (hasRecentOTP) {
      console.log('⏳ Rate limit triggered');
      return new Response(
        JSON.stringify({ error: 'Please wait before requesting another code' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    console.log('🔢 Generated OTP:', otp);

    // Clean up expired OTPs
    console.log('🧹 Cleaning up expired OTPs');
    const { error: cleanupError } = await supabase.rpc('cleanup_expired_otps');
    if (cleanupError) {
      console.error('❌ Error cleaning up expired OTPs:', cleanupError);
    } else {
      console.log('✅ Cleaned up expired OTPs');
    }

    // Delete any existing OTP for this email
    console.log('🗑️ Deleting existing OTP for email');
    const { error: deleteError } = await supabase.rpc('delete_otp_by_email', {
      search_email: email
    });
    if (deleteError) {
      console.error('❌ Error deleting existing OTP:', deleteError);
    } else {
      console.log('✅ Deleted existing OTP');
    }

    // Insert new OTP record with proper hashing and encryption
    console.log('📝 Inserting new OTP record via RPC');
    console.log('📝 RPC parameters:', {
      p_email: email,
      p_otp: '[REDACTED]',
      p_expires_at: expiresAt.toISOString(),
      p_password_hash: passwordHash ? '[PRESENT]' : '[ABSENT]'
    });
    
    const { data: insertSuccess, error: insertError } = await supabase
      .rpc('insert_otp_registration', {
        p_email: email,
        p_otp: otp,
        p_expires_at: expiresAt.toISOString(),
        p_password_hash: passwordHash || null
      });

    console.log('📝 RPC Response:', {
      data: insertSuccess,
      error: insertError
    });

    if (insertError || !insertSuccess) {
      console.error('❌ Error inserting OTP:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate verification code', details: insertError?.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('✅ OTP record inserted successfully');

    // Start email sending in background - don't wait for it
    const sendEmailInBackground = async () => {
      try {
        console.log('📧 Sending email in background');
        const { error: emailError } = await supabase.functions.invoke('send-email', {
          body: {
            to: email,
            subject: 'Your verification code',
            template: {
              name: 'otp-verification',
              props: {
                otp,
                email
              }
            }
          }
        });

        if (emailError) {
          console.error('❌ Background email error:', emailError);
        } else {
          console.log('✅ Background email sent successfully');
        }
      } catch (error) {
        console.error('❌ Background email exception:', error);
      }
    };

    // Use waitUntil to handle email sending in background
    EdgeRuntime.waitUntil(sendEmailInBackground());

    console.log(`✅ OTP generated for ${email}: ${otp}`); // For testing - remove in production

    // Return immediate success so user can proceed to enter OTP
    return new Response(
      JSON.stringify({ success: true, message: 'Verification code sent to your email' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-otp function:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);