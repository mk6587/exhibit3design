-- Fix critical security vulnerability: Remove overly permissive RLS policy on admins table
-- The current "Allow authenticated users to read admin records" policy exposes admin credentials
-- This allows any authenticated user to see admin emails/usernames for targeted attacks

-- Drop the problematic policy that allows all authenticated users to view admin records
DROP POLICY IF EXISTS "Allow authenticated users to read admin records" ON public.admins;

-- Create a secure policy that only allows admins to view admin records
-- Using the existing current_user_is_admin() function for secure admin verification
CREATE POLICY "Only admins can view admin records" 
ON public.admins 
FOR SELECT 
USING (current_user_is_admin());

-- Keep the existing "Service role has full access to admin records" policy
-- This is needed for system operations and admin user creation

-- Add a comment to document the security fix
COMMENT ON TABLE public.admins IS 'Admin table with secure RLS policies - only admins can view admin records';