-- Fix OTP registrations table policy conflicts
-- Remove conflicting policies that create unpredictable security behavior
-- OTP data contains sensitive authentication secrets (OTP codes, password hashes, emails)

-- Drop all existing conflicting policies
DROP POLICY IF EXISTS "Service role only access to OTP registrations" ON public.otp_registrations;
DROP POLICY IF EXISTS "Block all non-service-role access to OTP registrations" ON public.otp_registrations;

-- Create single, restrictive policy for service role only
-- RLS denies access by default, so we only need to explicitly allow service role
CREATE POLICY "Service role exclusive access to OTP data" 
ON public.otp_registrations 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Ensure RLS is enabled (should already be enabled)
ALTER TABLE public.otp_registrations ENABLE ROW LEVEL SECURITY;