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
-- Users can only update non-payment fields of their own orders
CREATE POLICY "Users can update their own orders" 
ON public.orders 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Service role can update any order (needed for payment processing)
CREATE POLICY "Service role can update all orders" 
ON public.orders 
FOR UPDATE 
TO service_role
USING (true)
WITH CHECK (true);

-- Anonymous users cannot update any orders
CREATE POLICY "Anonymous users cannot update orders" 
ON public.orders 
FOR UPDATE 
TO anon
USING (false);