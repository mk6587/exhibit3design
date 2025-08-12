import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendOTPRequest {
  email: string;
  passwordHash?: string; // For checkout registration
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
    console.log('🔧 OTP Request received');
    const { email, passwordHash, captchaToken }: SendOTPRequest = await req.json();
    console.log('📧 Processing OTP for email:', email);

    if (!email) {
      console.error('❌ No email provided');
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now
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

    // Send email with OTP
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
      console.error('Error sending email:', emailError);
      return new Response(
        JSON.stringify({ error: 'Failed to send verification code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`OTP sent to ${email}: ${otp}`); // Remove in production

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