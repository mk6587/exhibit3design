-- Fix critical security vulnerability: Restrict overly permissive RLS policy on otp_registrations table
-- The current "Service role can manage OTP registrations" policy with "true" condition 
-- makes sensitive OTP data (emails, password hashes, OTP codes) publicly accessible
-- This allows hackers to steal registration data and compromise user accounts

-- Drop the overly permissive policy that allows public access
DROP POLICY IF EXISTS "Service role can manage OTP registrations" ON public.otp_registrations;

-- Create a secure policy that only allows service role operations (edge functions)
-- This ensures only authorized Supabase edge functions can access OTP data
-- Regular users (authenticated or anonymous) will be blocked from accessing this sensitive data
CREATE POLICY "Service role only access to OTP registrations" 
ON public.otp_registrations 
FOR ALL 
USING (auth.role() = 'service_role');

-- Add a comment to document the security fix
COMMENT ON TABLE public.otp_registrations IS 'OTP registrations table - restricted to service role access only for security';