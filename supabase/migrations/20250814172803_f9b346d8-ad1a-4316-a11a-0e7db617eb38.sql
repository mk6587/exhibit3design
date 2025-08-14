-- Fix critical security issue: Remove overly permissive order policies and implement secure ones

-- First, drop the dangerous policies that allow unrestricted access
DROP POLICY IF EXISTS "Orders can be inserted" ON public.orders;
DROP POLICY IF EXISTS "Orders can be updated" ON public.orders;

-- Create secure policies for order insertion
-- Policy for authenticated users creating their own orders
CREATE POLICY "Authenticated users can create their own orders" 
ON public.orders 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for guest checkout (user_id = NULL)
CREATE POLICY "Guest users can create guest orders" 
ON public.orders 
FOR INSERT 
TO anon
WITH CHECK (user_id IS NULL);

-- Policy for service role to create orders (needed for payment processing)
CREATE POLICY "Service role can create orders" 
ON public.orders 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Create secure policies for order updates
-- Policy for authenticated users updating their own orders (limited fields)
CREATE POLICY "Users can update their own order status" 
ON public.orders 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  -- Only allow updating non-sensitive fields
  (OLD.customer_email = NEW.customer_email OR NEW.customer_email IS NULL) AND
  (OLD.customer_first_name = NEW.customer_first_name OR NEW.customer_first_name IS NULL) AND
  (OLD.customer_last_name = NEW.customer_last_name OR NEW.customer_last_name IS NULL) AND
  (OLD.customer_mobile = NEW.customer_mobile OR NEW.customer_mobile IS NULL) AND
  (OLD.customer_address = NEW.customer_address OR NEW.customer_address IS NULL) AND
  (OLD.customer_city = NEW.customer_city OR NEW.customer_city IS NULL) AND
  (OLD.customer_postal_code = NEW.customer_postal_code OR NEW.customer_postal_code IS NULL) AND
  (OLD.customer_country = NEW.customer_country OR NEW.customer_country IS NULL) AND
  (OLD.product_id = NEW.product_id) AND
  (OLD.amount = NEW.amount)
);

-- Policy for service role to update payment-related fields
CREATE POLICY "Service role can update payment fields" 
ON public.orders 
FOR UPDATE 
TO service_role
USING (true)
WITH CHECK (true);

-- Create a more restrictive policy for guest order updates (very limited)
CREATE POLICY "Guest orders cannot be updated by users" 
ON public.orders 
FOR UPDATE 
TO anon
USING (false)
WITH CHECK (false);