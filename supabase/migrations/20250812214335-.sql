-- Create a function to insert OTP with proper hashing and encryption

CREATE OR REPLACE FUNCTION public.insert_otp_registration(
  p_email text,
  p_otp text,
  p_expires_at timestamptz,
  p_password_hash text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.otp_registrations (
    email,
    otp,
    password_hash,
    expires_at,
    verified
  ) VALUES (
    public.encrypt_sensitive_data(p_email),
    public.hash_otp_code(p_otp),
    p_password_hash,
    p_expires_at,
    false
  );
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;