-- Fix the infinite recursion in admin policies
-- Drop the problematic policy that uses the is_admin function recursively
DROP POLICY IF EXISTS "Only admins can view admins" ON admins;

-- Create a simpler policy that doesn't cause recursion
-- Admins can view their own record
CREATE POLICY "Admins can view their own record" 
ON admins 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow service role to access all admin records (for the edge function)
CREATE POLICY "Service role can access all admin records" 
ON admins 
FOR ALL 
USING (auth.role() = 'service_role');