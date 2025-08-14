-- Fix security vulnerabilities in otp_registrations table

-- 1. Drop the overly permissive RLS policies
DROP POLICY IF EXISTS "Service role full access to OTP data" ON public.otp_registrations;
DROP POLICY IF EXISTS "Allow OTP operations for verification" ON public.otp_registrations;

-- 2. Create strict RLS policies that only allow service role access
CREATE POLICY "Only service role can access OTP data" 
ON public.otp_registrations 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 3. Create a function to automatically clean up old OTP records (not just expired ones)
CREATE OR REPLACE FUNCTION public.cleanup_old_otp_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Delete OTP records older than 24 hours regardless of expiration
  DELETE FROM public.otp_registrations 
  WHERE created_at < now() - interval '24 hours';
  
  -- Also clean up expired OTPs
  DELETE FROM public.otp_registrations 
  WHERE expires_at < now();
  
  -- Clean up verified OTPs older than 1 hour (they should have been used)
  DELETE FROM public.otp_registrations 
  WHERE verified = true AND created_at < now() - interval '1 hour';
END;
$$;

-- 4. Create a function to mark OTP as verified and schedule cleanup
CREATE OR REPLACE FUNCTION public.mark_otp_verified_and_cleanup(otp_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Mark the OTP as verified
  UPDATE public.otp_registrations 
  SET verified = true 
  WHERE id = otp_id;
  
  -- Clean up expired and old records
  PERFORM public.cleanup_old_otp_records();
  
  RETURN FOUND;
END;
$$;

-- 5. Update the verification functions to use the new cleanup approach
CREATE OR REPLACE FUNCTION public.verify_otp_code(search_email text, input_otp text)
RETURNS TABLE(id uuid, email text, password_hash text, expires_at timestamp with time zone, verified boolean, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  encrypted_email text;
  hashed_otp text;
  otp_record_id uuid;
BEGIN
  -- First cleanup old records
  PERFORM public.cleanup_old_otp_records();
  
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

-- 6. Create a function to securely delete used OTP records
CREATE OR REPLACE FUNCTION public.delete_used_otp(otp_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.otp_registrations 
  WHERE id = otp_id;
  
  RETURN FOUND;
END;
$$;

-- 7. Add an index for faster cleanup operations
CREATE INDEX IF NOT EXISTS idx_otp_registrations_cleanup 
ON public.otp_registrations (created_at, expires_at, verified);

-- 8. Add a comment explaining the security model
COMMENT ON TABLE public.otp_registrations IS 'Sensitive authentication table. Access restricted to service role only. Data is encrypted/hashed before storage.';

-- 9. Grant necessary permissions to service role only
REVOKE ALL ON public.otp_registrations FROM PUBLIC;
REVOKE ALL ON public.otp_registrations FROM authenticated;
GRANT ALL ON public.otp_registrations TO service_role;