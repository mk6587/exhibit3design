-- Fix critical security vulnerability in admins table RLS policies
-- Remove the dangerous "Service role has full access to admin records" policy
DROP POLICY IF EXISTS "Service role has full access to admin records" ON public.admins;

-- Create a more restrictive policy that only allows service role to INSERT new admin records
-- This allows the create-admin-user edge function to work while preventing abuse
CREATE POLICY "Service role can create admin records only" 
ON public.admins 
FOR INSERT 
TO service_role 
WITH CHECK (true);

-- Allow authenticated admin users to manage admin records
CREATE POLICY "Admins can manage admin records" 
ON public.admins 
FOR ALL 
TO authenticated
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Ensure the existing policy for admin viewing is still in place
-- (This should already exist based on the current configuration)