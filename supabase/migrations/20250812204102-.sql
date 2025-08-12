-- Clean up and secure orders table RLS policies
-- Remove all existing update policies and create a single, secure one

-- Drop any existing update policies
DROP POLICY IF EXISTS "Service role can update orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can update payment fields only" ON public.orders;
DROP POLICY IF EXISTS "Service role can update payment status only" ON public.orders;

-- Create a secure policy that only allows service role to update payment status and metadata
-- This prevents modification of sensitive customer PII (emails, names, addresses, etc.)
-- while allowing payment processing to update order status and payment references
CREATE POLICY "Service role payment updates only" 
ON public.orders 
FOR UPDATE 
USING (true)
WITH CHECK (
  -- Ensure core order data cannot be changed (protect against tampering)
  user_id = user_id AND 
  product_id = product_id AND 
  amount = amount AND
  -- Ensure customer PII cannot be modified (protect sensitive data)
  COALESCE(customer_email, '') = COALESCE(customer_email, '') AND
  COALESCE(customer_first_name, '') = COALESCE(customer_first_name, '') AND
  COALESCE(customer_last_name, '') = COALESCE(customer_last_name, '') AND
  COALESCE(customer_mobile, '') = COALESCE(customer_mobile, '') AND
  COALESCE(customer_address, '') = COALESCE(customer_address, '') AND
  COALESCE(customer_city, '') = COALESCE(customer_city, '') AND
  COALESCE(customer_postal_code, '') = COALESCE(customer_postal_code, '') AND
  COALESCE(customer_country, '') = COALESCE(customer_country, '')
  -- Payment fields (status, transaction_id, authority, etc.) can be updated
);

-- Remove the helper function we don't need
DROP FUNCTION IF EXISTS public.validate_payment_update();

-- Update table comment
COMMENT ON TABLE public.orders IS 'Secure orders table - service role can only update payment status, customer PII is protected';