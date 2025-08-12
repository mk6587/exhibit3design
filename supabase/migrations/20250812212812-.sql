-- Fix critical security issues in RLS policies

-- 1. Fix orders table RLS policies - ensure users can ONLY access their own orders
DROP POLICY IF EXISTS "Service role payment processing only" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Only authenticated users can create orders" ON public.orders;

-- Create more restrictive orders policies
CREATE POLICY "Users can only view their own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only create their own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own orders" 
ON public.orders 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can update payment fields only" 
ON public.orders 
FOR UPDATE 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 2. Fix otp_registrations table - only service role should have access
DROP POLICY IF EXISTS "Service role exclusive access to OTP data" ON public.otp_registrations;

CREATE POLICY "Only service role can access OTP data" 
ON public.otp_registrations 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 3. Fix profiles table policies to be more restrictive
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can only view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- 4. Fix admins table policies
DROP POLICY IF EXISTS "Only admins can view admin records" ON public.admins;
DROP POLICY IF EXISTS "Admins can manage admin records" ON public.admins;
DROP POLICY IF EXISTS "Service role can create admin records only" ON public.admins;

CREATE POLICY "Only admins can view admin records" 
ON public.admins 
FOR SELECT 
USING (public.current_user_is_admin());

CREATE POLICY "Only admins can manage admin records" 
ON public.admins 
FOR ALL 
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

CREATE POLICY "Service role can create admin records" 
ON public.admins 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- 5. Fix search_queries table policies
DROP POLICY IF EXISTS "Anyone can insert search queries" ON public.search_queries;
DROP POLICY IF EXISTS "Admins can view search queries" ON public.search_queries;

CREATE POLICY "Anyone can insert search queries" 
ON public.search_queries 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can view search queries" 
ON public.search_queries 
FOR SELECT 
USING (public.current_user_is_admin());

-- 6. Fix user_roles table to prevent infinite recursion
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create a security definer function to check admin status safely
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid() AND is_active = true
  );
$$;

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all user roles" 
ON public.user_roles 
FOR ALL 
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());