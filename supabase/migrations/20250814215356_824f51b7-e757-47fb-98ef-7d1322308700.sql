-- Fix critical security vulnerability: Restrict product modifications to admin users only
-- Currently ANY authenticated user can modify products, which is extremely dangerous

-- Drop the insecure policy that allows all operations with 'true' condition
DROP POLICY IF EXISTS "Admin operations allowed on products" ON public.products;

-- Create a secure policy that only allows admin users to modify products
CREATE POLICY "Only admins can modify products" 
ON public.products 
FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Verify the existing read-only policy for public product viewing is still intact
-- (This should already exist: "Anyone can view products" for SELECT with condition 'true')

-- Add a comment to document the security fix
COMMENT ON POLICY "Only admins can modify products" ON public.products IS 
'Security policy: Only authenticated admin users can create, update, or delete products. This prevents unauthorized product catalog manipulation.';