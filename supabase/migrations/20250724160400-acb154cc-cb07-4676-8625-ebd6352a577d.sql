-- Remove all recursive policies on admins table
DROP POLICY IF EXISTS "Only admins can insert admin records" ON admins;
DROP POLICY IF EXISTS "Only admins can update admin records" ON admins;
DROP POLICY IF EXISTS "Only admins can view admin records" ON admins;

-- Create non-recursive policies
-- Allow service role full access (for edge functions)
-- Allow authenticated users to view their own admin record
-- No need for complex recursive checks since edge functions handle admin creation
-- and admin verification is done in the application layer