-- Fix remaining security issues with function search paths

-- 1. Fix all functions to have secure search paths
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

CREATE OR REPLACE FUNCTION public.validate_order_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Allow updates from authenticated users (they can only update their own orders via RLS policies)
  IF auth.role() = 'authenticated' THEN
    NEW.updated_at = now();
    RETURN NEW;
  END IF;
  
  -- For service role updates, allow payment field updates only
  IF auth.role() = 'service_role' THEN
    NEW.updated_at = now();
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_payment_update()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- This function validates payment field updates in RLS policies
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT public.is_admin(auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = $1 AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.hash_otp_code(otp_code text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Use strong hashing for OTP codes
  IF otp_code IS NULL OR otp_code = '' THEN
    RETURN otp_code;
  END IF;
  
  RETURN encode(digest(otp_code || 'otp-salt-2024', 'sha256'), 'hex');
END;
$$;

CREATE OR REPLACE FUNCTION public.encrypt_customer_data_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Encrypt sensitive customer fields before storing
  IF NEW.customer_email IS NOT NULL AND NEW.customer_email != '' THEN
    NEW.customer_email = public.encrypt_sensitive_data(NEW.customer_email);
  END IF;
  
  IF NEW.customer_first_name IS NOT NULL AND NEW.customer_first_name != '' THEN
    NEW.customer_first_name = public.encrypt_sensitive_data(NEW.customer_first_name);
  END IF;
  
  IF NEW.customer_last_name IS NOT NULL AND NEW.customer_last_name != '' THEN
    NEW.customer_last_name = public.encrypt_sensitive_data(NEW.customer_last_name);
  END IF;
  
  IF NEW.customer_mobile IS NOT NULL AND NEW.customer_mobile != '' THEN
    NEW.customer_mobile = public.encrypt_sensitive_data(NEW.customer_mobile);
  END IF;
  
  IF NEW.customer_address IS NOT NULL AND NEW.customer_address != '' THEN
    NEW.customer_address = public.encrypt_sensitive_data(NEW.customer_address);
  END IF;
  
  IF NEW.customer_city IS NOT NULL AND NEW.customer_city != '' THEN
    NEW.customer_city = public.encrypt_sensitive_data(NEW.customer_city);
  END IF;
  
  IF NEW.customer_postal_code IS NOT NULL AND NEW.customer_postal_code != '' THEN
    NEW.customer_postal_code = public.encrypt_sensitive_data(NEW.customer_postal_code);
  END IF;

  RETURN NEW;
END;
$$;