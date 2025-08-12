-- Create helper functions for OTP handling with encrypted data
-- These functions will be used by Edge functions to work with encrypted data

-- Function to find OTP record by email (handles encrypted emails)
CREATE OR REPLACE FUNCTION public.find_otp_by_email(search_email text)
RETURNS TABLE (
  id uuid,
  email text,
  otp text,
  password_hash text,
  expires_at timestamptz,
  verified boolean,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  encrypted_email text;
BEGIN
  -- Encrypt the search email to match stored format
  encrypted_email := public.encrypt_sensitive_data(search_email);
  
  RETURN QUERY
  SELECT 
    o.id,
    o.email,
    o.otp,
    o.password_hash,
    o.expires_at,
    o.verified,
    o.created_at
  FROM public.otp_registrations o
  WHERE o.email = encrypted_email;
END;
$$;

-- Function to verify OTP code (handles hashing comparison)
CREATE OR REPLACE FUNCTION public.verify_otp_code(search_email text, input_otp text)
RETURNS TABLE (
  id uuid,
  email text,
  password_hash text,
  expires_at timestamptz,
  verified boolean,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  encrypted_email text;
  hashed_otp text;
BEGIN
  -- Encrypt the search email to match stored format
  encrypted_email := public.encrypt_sensitive_data(search_email);
  
  -- Hash the input OTP to compare with stored hashed OTP
  hashed_otp := public.hash_otp_code(input_otp);
  
  RETURN QUERY
  SELECT 
    o.id,
    o.email,
    o.password_hash,
    o.expires_at,
    o.verified,
    o.created_at
  FROM public.otp_registrations o
  WHERE o.email = encrypted_email 
    AND o.otp = hashed_otp
    AND o.verified = false
    AND o.expires_at > now();
END;
$$;

-- Function to check recent OTP for rate limiting
CREATE OR REPLACE FUNCTION public.check_recent_otp(search_email text, minutes_ago integer DEFAULT 1)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  encrypted_email text;
  recent_count integer;
BEGIN
  -- Encrypt the search email to match stored format
  encrypted_email := public.encrypt_sensitive_data(search_email);
  
  SELECT COUNT(*)
  INTO recent_count
  FROM public.otp_registrations
  WHERE email = encrypted_email
    AND created_at > now() - interval '1 minute' * minutes_ago;
    
  RETURN recent_count > 0;
END;
$$;

-- Function to safely delete OTP by email
CREATE OR REPLACE FUNCTION public.delete_otp_by_email(search_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  encrypted_email text;
BEGIN
  -- Encrypt the search email to match stored format
  encrypted_email := public.encrypt_sensitive_data(search_email);
  
  DELETE FROM public.otp_registrations
  WHERE email = encrypted_email;
  
  RETURN FOUND;
END;
$$;