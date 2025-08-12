-- Security Enhancement: Encrypt sensitive data in otp_registrations table
-- Enable pgcrypto extension for encryption functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a more secure OTP management system with encryption
-- First, let's add encrypted columns and migrate existing data

-- Add new encrypted columns
ALTER TABLE public.otp_registrations 
ADD COLUMN IF NOT EXISTS otp_encrypted TEXT,
ADD COLUMN IF NOT EXISTS password_hash_encrypted TEXT,
ADD COLUMN IF NOT EXISTS email_encrypted TEXT;

-- Create a secure function to encrypt sensitive data
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data TEXT)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT CASE 
    WHEN data IS NULL THEN NULL
    ELSE encode(encrypt_iv(data::bytea, decode('SUPABASE_SECRET_KEY_32CHARS_LONG!', 'escape'), decode('1234567890123456', 'escape'), 'aes-cbc'), 'base64')
  END;
$$;

-- Create a secure function to decrypt sensitive data
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(encrypted_data TEXT)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT CASE 
    WHEN encrypted_data IS NULL THEN NULL
    ELSE convert_from(decrypt_iv(decode(encrypted_data, 'base64'), decode('SUPABASE_SECRET_KEY_32CHARS_LONG!', 'escape'), decode('1234567890123456', 'escape'), 'aes-cbc'), 'UTF8')
  END;
$$;

-- Enhanced cleanup function with more aggressive security
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Delete expired OTPs
  DELETE FROM public.otp_registrations 
  WHERE expires_at < now();
  
  -- Also delete any OTPs older than 5 minutes (extra security)
  DELETE FROM public.otp_registrations 
  WHERE created_at < now() - INTERVAL '5 minutes';
  
  -- Delete any verified OTPs older than 1 minute
  DELETE FROM public.otp_registrations 
  WHERE verified = true AND created_at < now() - INTERVAL '1 minute';
END;
$$;

-- Create audit logging table for OTP access
CREATE TABLE IF NOT EXISTS public.otp_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  action TEXT NOT NULL, -- 'created', 'verified', 'failed_verification', 'cleanup'
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.otp_audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can access audit logs
CREATE POLICY "Service role only access to OTP audit logs" 
ON public.otp_audit_log 
FOR ALL 
USING (auth.role() = 'service_role'::text);

-- Create function to log OTP operations
CREATE OR REPLACE FUNCTION public.log_otp_operation(
  p_email TEXT,
  p_action TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT true
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.otp_audit_log (email, action, ip_address, user_agent, success)
  VALUES (p_email, p_action, p_ip_address, p_user_agent, p_success);
END;
$$;

-- Secure function to create OTP record with encryption
CREATE OR REPLACE FUNCTION public.create_otp_record(
  p_email TEXT,
  p_otp TEXT,
  p_password_hash TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  record_id UUID;
BEGIN
  -- Clean up expired OTPs first
  PERFORM public.cleanup_expired_otps();
  
  -- Delete any existing OTP for this email
  DELETE FROM public.otp_registrations WHERE email = p_email;
  
  -- Create new encrypted record
  INSERT INTO public.otp_registrations (
    email,
    otp_encrypted,
    password_hash_encrypted,
    expires_at,
    verified
  ) VALUES (
    p_email,
    public.encrypt_sensitive_data(p_otp),
    CASE WHEN p_password_hash IS NOT NULL THEN public.encrypt_sensitive_data(p_password_hash) ELSE NULL END,
    now() + INTERVAL '2 minutes',
    false
  ) RETURNING id INTO record_id;
  
  -- Log the operation
  PERFORM public.log_otp_operation(p_email, 'created');
  
  RETURN record_id;
END;
$$;

-- Secure function to verify OTP with decryption
CREATE OR REPLACE FUNCTION public.verify_otp_record(
  p_email TEXT,
  p_otp TEXT
)
RETURNS TABLE(
  id UUID,
  password_hash_decrypted TEXT,
  verified BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  otp_record RECORD;
  decrypted_otp TEXT;
BEGIN
  -- Clean up expired OTPs first
  PERFORM public.cleanup_expired_otps();
  
  -- Get the OTP record
  SELECT otp_registrations.id, otp_registrations.otp_encrypted, otp_registrations.password_hash_encrypted, otp_registrations.verified, otp_registrations.expires_at
  INTO otp_record
  FROM public.otp_registrations
  WHERE email = p_email AND expires_at > now() AND verified = false
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Check if record exists
  IF otp_record.id IS NULL THEN
    -- Log failed verification
    PERFORM public.log_otp_operation(p_email, 'failed_verification', NULL, NULL, false);
    RETURN;
  END IF;
  
  -- Decrypt the stored OTP
  decrypted_otp := public.decrypt_sensitive_data(otp_record.otp_encrypted);
  
  -- Verify OTP matches
  IF decrypted_otp = p_otp THEN
    -- Mark as verified
    UPDATE public.otp_registrations 
    SET verified = true 
    WHERE public.otp_registrations.id = otp_record.id;
    
    -- Log successful verification
    PERFORM public.log_otp_operation(p_email, 'verified');
    
    -- Return the decrypted password hash if available
    RETURN QUERY SELECT 
      otp_record.id,
      CASE WHEN otp_record.password_hash_encrypted IS NOT NULL 
           THEN public.decrypt_sensitive_data(otp_record.password_hash_encrypted) 
           ELSE NULL END,
      true;
  ELSE
    -- Log failed verification
    PERFORM public.log_otp_operation(p_email, 'failed_verification', NULL, NULL, false);
    RETURN;
  END IF;
END;
$$;

-- Create automatic cleanup trigger
CREATE OR REPLACE FUNCTION public.trigger_cleanup_otps()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Run cleanup on any insert to keep the table clean
  PERFORM public.cleanup_expired_otps();
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS auto_cleanup_otps ON public.otp_registrations;

-- Create trigger for automatic cleanup
CREATE TRIGGER auto_cleanup_otps
  AFTER INSERT ON public.otp_registrations
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_cleanup_otps();

-- Add index for better performance on encrypted data queries
CREATE INDEX IF NOT EXISTS idx_otp_registrations_email_expires ON public.otp_registrations(email, expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_registrations_created_verified ON public.otp_registrations(created_at, verified);

-- Add comments for documentation
COMMENT ON TABLE public.otp_registrations IS 'Secure OTP storage with encrypted sensitive data and automatic cleanup';
COMMENT ON TABLE public.otp_audit_log IS 'Audit trail for all OTP operations for security monitoring';
COMMENT ON FUNCTION public.encrypt_sensitive_data IS 'Encrypts sensitive data using AES-256-CBC encryption';
COMMENT ON FUNCTION public.decrypt_sensitive_data IS 'Decrypts sensitive data encrypted with encrypt_sensitive_data';
COMMENT ON FUNCTION public.create_otp_record IS 'Securely creates OTP record with encrypted sensitive data';
COMMENT ON FUNCTION public.verify_otp_record IS 'Securely verifies OTP with decryption and audit logging';