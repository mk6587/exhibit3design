-- Fix critical RLS security vulnerabilities

-- Fix profiles table - ensure users can only access their own data
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Fix orders table - ensure users can only access their own orders  
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Fix admins table - ensure only current admins can view admin data
DROP POLICY IF EXISTS "Only admins can view admin records" ON public.admins;
CREATE POLICY "Only admins can view admin records" 
ON public.admins 
FOR SELECT 
TO authenticated
USING (current_user_is_admin());

-- Fix otp_registrations table - ensure it's completely locked down to service role only
DROP POLICY IF EXISTS "Service role only access to OTP registrations" ON public.otp_registrations;
CREATE POLICY "Service role only access to OTP registrations" 
ON public.otp_registrations 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Ensure no other roles can access OTP data
CREATE POLICY "Block all non-service-role access to OTP registrations" 
ON public.otp_registrations 
FOR ALL 
TO authenticated, anon
USING (false)
WITH CHECK (false);