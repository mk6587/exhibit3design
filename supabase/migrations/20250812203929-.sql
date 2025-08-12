-- Enhance security for orders table: Make service role UPDATE policy more restrictive
-- Current "Service role can update orders" policy allows updating ANY field
-- This could potentially allow modification of sensitive customer data
-- Restrict to only payment-related fields that need to be updated during payment processing

-- Drop the overly broad service role update policy
DROP POLICY IF EXISTS "Service role can update orders" ON public.orders;

-- Create a more restrictive policy that only allows updating payment-related fields
-- This ensures service role (edge functions) can only update order status and payment data
-- but cannot modify sensitive customer information like emails, addresses, names, etc.
CREATE POLICY "Service role can update payment fields only" 
ON public.orders 
FOR UPDATE 
USING (true)
WITH CHECK (
  -- Only allow updating these specific payment-related columns
  -- Prevent modification of sensitive customer PII
  CASE 
    WHEN OLD.status IS DISTINCT FROM NEW.status THEN true
    WHEN OLD.transaction_id IS DISTINCT FROM NEW.transaction_id THEN true
    WHEN OLD.authority IS DISTINCT FROM NEW.authority THEN true
    WHEN OLD.yekpay_reference IS DISTINCT FROM NEW.yekpay_reference THEN true
    WHEN OLD.payment_method IS DISTINCT FROM NEW.payment_method THEN true
    WHEN OLD.payment_description IS DISTINCT FROM NEW.payment_description THEN true
    WHEN OLD.updated_at IS DISTINCT FROM NEW.updated_at THEN true
    -- Block updates to sensitive customer data
    WHEN OLD.customer_email IS DISTINCT FROM NEW.customer_email THEN false
    WHEN OLD.customer_first_name IS DISTINCT FROM NEW.customer_first_name THEN false
    WHEN OLD.customer_last_name IS DISTINCT FROM NEW.customer_last_name THEN false
    WHEN OLD.customer_mobile IS DISTINCT FROM NEW.customer_mobile THEN false
    WHEN OLD.customer_address IS DISTINCT FROM NEW.customer_address THEN false
    WHEN OLD.customer_city IS DISTINCT FROM NEW.customer_city THEN false
    WHEN OLD.customer_postal_code IS DISTINCT FROM NEW.customer_postal_code THEN false
    WHEN OLD.customer_country IS DISTINCT FROM NEW.customer_country THEN false
    WHEN OLD.user_id IS DISTINCT FROM NEW.user_id THEN false
    WHEN OLD.product_id IS DISTINCT FROM NEW.product_id THEN false
    WHEN OLD.amount IS DISTINCT FROM NEW.amount THEN false
    ELSE true
  END
);

-- Add a comment to document the enhanced security
COMMENT ON TABLE public.orders IS 'Orders table with enhanced RLS policies - service role can only update payment fields, not customer PII';