import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

      // Store OTP in a temporary table (we'll need to create this)
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

      // Send OTP email
      const emailResponse = await resend.emails.send({
        from: "Your App <onboarding@resend.dev>",
        to: [email],
        subject: "Your Registration OTP",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to Your App!</h2>
            <p>Your OTP code is:</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <h1 style="color: #2563eb; font-size: 32px; margin: 0; letter-spacing: 8px;">${generatedOTP}</h1>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });

      if (emailResponse.error) {
        console.error('Error sending OTP email:', emailResponse.error);
        return new Response(
          JSON.stringify({ error: 'Failed to send OTP email' }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ message: 'OTP sent successfully' }),
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