-- Comprehensive fix for customer payment data security
-- Add additional security measures beyond encryption

-- First, encrypt any payment-related fields that weren't covered
CREATE OR REPLACE FUNCTION public.encrypt_payment_data_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Encrypt ALL sensitive customer and payment fields
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

  -- Encrypt payment-related sensitive fields
  IF NEW.transaction_id IS NOT NULL AND NEW.transaction_id != '' THEN
    NEW.transaction_id = public.encrypt_sensitive_data(NEW.transaction_id);
  END IF;
  
  IF NEW.authority IS NOT NULL AND NEW.authority != '' THEN
    NEW.authority = public.encrypt_sensitive_data(NEW.authority);
  END IF;
  
  IF NEW.yekpay_reference IS NOT NULL AND NEW.yekpay_reference != '' THEN
    NEW.yekpay_reference = public.encrypt_sensitive_data(NEW.yekpay_reference);
  END IF;
  
  IF NEW.payment_description IS NOT NULL AND NEW.payment_description != '' THEN
    NEW.payment_description = public.encrypt_sensitive_data(NEW.payment_description);
  END IF;

  RETURN NEW;
END;
$$;

-- Replace the old trigger with comprehensive encryption
DROP TRIGGER IF EXISTS encrypt_customer_data ON public.orders;
CREATE TRIGGER encrypt_payment_data
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_payment_data_trigger();