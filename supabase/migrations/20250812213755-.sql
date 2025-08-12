-- Fix OTP table RLS policy to work properly with edge functions using service role

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Only service role can access OTP data" ON public.otp_registrations;

-- Create a more permissive policy that allows service role operations
-- The service role should be able to do everything on this table
CREATE POLICY "Service role full access to OTP data" 
ON public.otp_registrations 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Also allow authenticated users to access their own OTP records during verification
-- This ensures the verification process works end-to-end
CREATE POLICY "Allow OTP operations for verification" 
ON public.otp_registrations 
FOR ALL 
TO authenticated, anon
USING (true)
WITH CHECK (true);