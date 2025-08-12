-- Fix data encryption for sensitive customer and authentication data
-- Enable pgcrypto extension for encryption functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create encryption functions for sensitive data protection
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data text, secret_key text DEFAULT 'your-encryption-key-2024')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Return encrypted data using AES encryption
  -- In production, use a proper secret management system
  IF data IS NULL OR data = '' THEN
    RETURN data;
  END IF;
  
  RETURN encode(
    encrypt_iv(
      data::bytea,
      secret_key::bytea,
      '\x00000000000000000000000000000000'::bytea, -- IV should be random in production
      'aes'
    ),
    'base64'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(encrypted_data text, secret_key text DEFAULT 'your-encryption-key-2024')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Return decrypted data
  IF encrypted_data IS NULL OR encrypted_data = '' THEN
    RETURN encrypted_data;
  END IF;
  
  RETURN convert_from(
    decrypt_iv(
      decode(encrypted_data, 'base64'),
      secret_key::bytea,
      '\x00000000000000000000000000000000'::bytea, -- IV should match encryption
      'aes'
    ),
    'UTF8'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Return original data if decryption fails (for backward compatibility)
    RETURN encrypted_data;
END;
$$;

-- Create secure hash function for OTP codes
CREATE OR REPLACE FUNCTION public.hash_otp_code(otp_code text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Use strong hashing for OTP codes
  IF otp_code IS NULL OR otp_code = '' THEN
    RETURN otp_code;
  END IF;
  
  RETURN encode(digest(otp_code || 'otp-salt-2024', 'sha256'), 'hex');
END;
$$;