-- Create OTP registrations table for email verification
CREATE TABLE public.otp_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  password_hash TEXT, -- For new user registration during checkout
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.otp_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for OTP registrations
CREATE POLICY "Service role can manage OTP registrations" 
ON public.otp_registrations 
FOR ALL 
USING (true);

-- Create function to cleanup expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.otp_registrations 
  WHERE expires_at < now();
END;
$$;