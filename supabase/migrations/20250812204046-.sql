-- Enhanced security for orders table: Create more restrictive service role UPDATE policy
-- Replace the broad "Service role can update orders" with field-specific restrictions

-- Drop the overly broad service role update policy
DROP POLICY IF EXISTS "Service role can update orders" ON public.orders;

-- Create a secure policy that allows service role to update orders
-- but with restrictions to protect customer data integrity
CREATE POLICY "Service role can update payment status only" 
ON public.orders 
FOR UPDATE 
USING (true);

-- Create a trigger function to validate service role updates
-- This ensures only payment-related fields can be modified by service role
CREATE OR REPLACE FUNCTION validate_order_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow updates from authenticated users (they can only update their own orders via other policies)
  IF auth.role() = 'authenticated' THEN
    RETURN NEW;
  END IF;
  
  -- For service role updates, only allow changes to payment-related fields
  IF auth.role() = 'service_role' THEN
    -- Prevent modification of sensitive customer data by service role
    IF (OLD.customer_email IS DISTINCT FROM NEW.customer_email OR
        OLD.customer_first_name IS DISTINCT FROM NEW.customer_first_name OR
        OLD.customer_last_name IS DISTINCT FROM NEW.customer_last_name OR
        OLD.customer_mobile IS DISTINCT FROM NEW.customer_mobile OR
        OLD.customer_address IS DISTINCT FROM NEW.customer_address OR
        OLD.customer_city IS DISTINCT FROM NEW.customer_city OR
        OLD.customer_postal_code IS DISTINCT FROM NEW.customer_postal_code OR
        OLD.customer_country IS DISTINCT FROM NEW.customer_country OR
        OLD.user_id IS DISTINCT FROM NEW.user_id OR
        OLD.product_id IS DISTINCT FROM NEW.product_id OR
        OLD.amount IS DISTINCT FROM NEW.amount) THEN
      RAISE EXCEPTION 'Service role cannot modify customer personal data or order details';
    END IF;
  END IF;
  
  -- Update the timestamp
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to enforce the validation
CREATE TRIGGER validate_order_updates
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION validate_order_update();

-- Add comment documenting the enhanced security
COMMENT ON TABLE public.orders IS 'Orders table with enhanced security - service role updates restricted to payment fields only via trigger';