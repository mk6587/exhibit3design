-- Fix critical orders table UPDATE policies security vulnerability
-- The current UPDATE policies allow ANY user to update ANY order (qual:true)
-- This exposes customer payment data to unauthorized modification

-- Drop dangerous UPDATE policies
DROP POLICY IF EXISTS "Restricted service role order updates" ON public.orders;
DROP POLICY IF EXISTS "Service role payment updates only" ON public.orders;

-- Create secure UPDATE policies that restrict WHO can update orders

-- Allow order owners to update their own orders (for legitimate customer updates)
CREATE POLICY "Users can update their own orders" 
ON public.orders 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow service role to update payment status fields only (for payment processing)
CREATE POLICY "Service role payment processing only" 
ON public.orders 
FOR UPDATE 
TO service_role
USING (true)
WITH CHECK (
  -- Prevent service role from modifying customer personal data
  customer_email = customer_email AND
  customer_first_name = customer_first_name AND 
  customer_last_name = customer_last_name AND
  customer_mobile = customer_mobile AND
  customer_address = customer_address AND
  customer_city = customer_city AND
  customer_postal_code = customer_postal_code AND
  customer_country = customer_country AND
  user_id = user_id AND
  product_id = product_id AND
  amount = amount
);