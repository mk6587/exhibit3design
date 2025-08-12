-- Create triggers to automatically encrypt sensitive customer data
-- and implement secure OTP handling

-- Create trigger function to encrypt customer data in orders table
CREATE OR REPLACE FUNCTION public.encrypt_customer_data_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Create trigger function to hash OTP codes
CREATE OR REPLACE FUNCTION public.encrypt_otp_data_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Hash the OTP code before storing
  IF NEW.otp IS NOT NULL AND NEW.otp != '' THEN
    NEW.otp = public.hash_otp_code(NEW.otp);
  END IF;
  
  -- Encrypt email address
  IF NEW.email IS NOT NULL AND NEW.email != '' THEN
    NEW.email = public.encrypt_sensitive_data(NEW.email);
  END IF;

  RETURN NEW;
END;
$$;

-- Apply triggers to tables
DROP TRIGGER IF EXISTS encrypt_customer_data ON public.orders;
CREATE TRIGGER encrypt_customer_data
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_customer_data_trigger();

DROP TRIGGER IF EXISTS encrypt_otp_data ON public.otp_registrations;
CREATE TRIGGER encrypt_otp_data
  BEFORE INSERT OR UPDATE ON public.otp_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_otp_data_trigger();

-- Create secure view functions for accessing encrypted data (admin only)
CREATE OR REPLACE FUNCTION public.get_decrypted_customer_data(order_id uuid)
RETURNS TABLE (
  id uuid,
  customer_email text,
  customer_first_name text,
  customer_last_name text,
  customer_mobile text,
  customer_address text,
  customer_city text,
  customer_postal_code text,
  customer_country text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow access if user is admin
  IF NOT public.current_user_is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    o.id,
    public.decrypt_sensitive_data(o.customer_email) as customer_email,
    public.decrypt_sensitive_data(o.customer_first_name) as customer_first_name,
    public.decrypt_sensitive_data(o.customer_last_name) as customer_last_name,
    public.decrypt_sensitive_data(o.customer_mobile) as customer_mobile,
    public.decrypt_sensitive_data(o.customer_address) as customer_address,
    public.decrypt_sensitive_data(o.customer_city) as customer_city,
    public.decrypt_sensitive_data(o.customer_postal_code) as customer_postal_code,
    o.customer_country
  FROM public.orders o
  WHERE o.id = order_id;
END;
$$;