-- Create table for temporary OTP registrations
CREATE TABLE public.otp_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_otp_registrations_email_otp ON public.otp_registrations(email, otp);
CREATE INDEX idx_otp_registrations_expires_at ON public.otp_registrations(expires_at);

-- Enable RLS
ALTER TABLE public.otp_registrations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow the service role to manage OTP registrations
CREATE POLICY "Service role can manage OTP registrations"
ON public.otp_registrations
FOR ALL
USING (true);

-- Create function to clean up expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.otp_registrations 
  WHERE expires_at < now() - interval '1 hour';
END;
$$;