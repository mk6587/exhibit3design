-- Fix RLS policies for admins table to allow proper authentication

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view their own record" ON public.admins;
DROP POLICY IF EXISTS "Service role can access all admin records" ON public.admins;

-- Create new, working policies
-- Allow authenticated users to read admin records (needed for admin check)
CREATE POLICY "Allow authenticated users to read admin records" 
ON public.admins FOR SELECT 
TO authenticated 
USING (true);

-- Allow service role full access (for edge functions)
CREATE POLICY "Service role has full access to admin records" 
ON public.admins FOR ALL 
TO service_role 
USING (true);