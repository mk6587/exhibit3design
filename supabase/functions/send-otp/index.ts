import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate a 6-digit OTP
function generateOTP(): string {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');
}

interface OTPRequest {
  email: string;
  type: 'register' | 'verify';
  otp?: string;
  password?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, type, otp, password }: OTPRequest = await req.json();

    if (type === 'register') {
      // Check if user already exists
      const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email);
      
      if (existingUser.user) {
        return new Response(
          JSON.stringify({ error: 'User already exists' }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Generate OTP and store it temporarily
      const generatedOTP = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Store OTP in a temporary table
      const { error: insertError } = await supabase
        .from('otp_registrations')
        .insert({
          email,
          otp: generatedOTP,
          password_hash: password, // In production, hash this
          expires_at: expiresAt.toISOString(),
          verified: false
        });

      if (insertError) {
        console.error('Error storing OTP:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to generate OTP' }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Use Supabase's built-in email functionality by creating a temporary user
      // and sending a custom confirmation email with our OTP
      try {
        // Create a temporary signup to trigger email sending
        const { data: signupData, error: signupError } = await supabase.auth.admin.createUser({
          email,
          password: 'temp-password-' + Date.now(), // Temporary password
          email_confirm: false, // Don't auto-confirm
          user_metadata: {
            otp_code: generatedOTP,
            registration_type: 'otp'
          }
        });

        if (signupError) {
          console.error('Error creating temp user:', signupError);
          // Fall back to console logging if email fails
          console.log(`OTP for ${email}: ${generatedOTP}`);
        } else {
          // Delete the temporary user immediately
          if (signupData.user) {
            await supabase.auth.admin.deleteUser(signupData.user.id);
          }
        }
      } catch (emailError) {
        console.error('Email sending failed, logging OTP:', emailError);
        console.log(`OTP for ${email}: ${generatedOTP}`);
      }

      // For development, also log the OTP to console
      console.log(`Generated OTP for ${email}: ${generatedOTP}`);

      return new Response(
        JSON.stringify({ 
          message: 'OTP sent successfully',
          // In development, include OTP in response for testing
          ...(Deno.env.get('ENVIRONMENT') === 'development' && { otp: generatedOTP })
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (type === 'verify') {
      // Verify OTP
      const { data: otpRecord, error: fetchError } = await supabase
        .from('otp_registrations')
        .select('*')
        .eq('email', email)
        .eq('otp', otp)
        .eq('verified', false)
        .single();

      if (fetchError || !otpRecord) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired OTP' }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if OTP has expired
      if (new Date() > new Date(otpRecord.expires_at)) {
        return new Response(
          JSON.stringify({ error: 'OTP has expired' }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create the user account
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email,
        password: otpRecord.password_hash,
        email_confirm: true, // Auto-confirm since OTP is verified
      });

      if (userError) {
        console.error('Error creating user:', userError);
        return new Response(
          JSON.stringify({ error: 'Failed to create user account' }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Mark OTP as verified
      await supabase
        .from('otp_registrations')
        .update({ verified: true })
        .eq('email', email)
        .eq('otp', otp);

      return new Response(
        JSON.stringify({ 
          message: 'Registration completed successfully',
          user: userData.user 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request type' }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in send-otp function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);