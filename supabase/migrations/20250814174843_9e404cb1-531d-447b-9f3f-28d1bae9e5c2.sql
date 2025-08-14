-- Clean up complex and overlapping RLS policies on orders table
-- Remove all existing policies first
DROP POLICY IF EXISTS "Anonymous users can view guest orders with valid token" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Guest users can create guest orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can update all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can only update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can update payment fields only" ON public.orders;
DROP POLICY IF EXISTS "Anonymous users cannot update orders" ON public.orders;
DROP POLICY IF EXISTS "Users can only view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can only create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can view all orders" ON public.orders;

-- Create simplified, secure RLS policies
-- SELECT policies
CREATE POLICY "Authenticated users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Guest orders accessible with valid token" 
ON public.orders 
FOR SELECT 
USING (
  user_id IS NULL 
  AND order_token IS NOT NULL 
  AND order_token = current_setting('app.current_order_token'::text, true)
);

CREATE POLICY "Service role can view all orders" 
ON public.orders 
FOR SELECT 
USING (auth.role() = 'service_role'::text);

-- INSERT policies
CREATE POLICY "Authenticated users can create their own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can create any orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role'::text);

-- UPDATE policies
CREATE POLICY "Authenticated users can update their own orders" 
ON public.orders 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can update all orders" 
ON public.orders 
FOR UPDATE 
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

-- DELETE policies (explicitly deny all deletes for security)
CREATE POLICY "No one can delete orders" 
ON public.orders 
FOR DELETE 
USING (false);