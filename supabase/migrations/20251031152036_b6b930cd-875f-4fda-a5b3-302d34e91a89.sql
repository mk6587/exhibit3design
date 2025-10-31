-- Drop the has_role function first to remove dependency
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

-- Drop existing enum values and recreate with new roles
ALTER TYPE public.app_role RENAME TO app_role_old;

CREATE TYPE public.app_role AS ENUM ('super_admin', 'content_creator', 'operator', 'user');

-- Update user_roles table to use new enum
ALTER TABLE public.user_roles 
  ALTER COLUMN role TYPE public.app_role 
  USING (
    CASE role::text
      WHEN 'admin' THEN 'super_admin'::public.app_role
      WHEN 'moderator' THEN 'operator'::public.app_role
      ELSE 'user'::public.app_role
    END
  );

DROP TYPE public.app_role_old;

-- Create helper functions for role checking
CREATE OR REPLACE FUNCTION public.has_any_admin_role(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.admins a ON ur.user_id = a.user_id
    WHERE ur.user_id = p_user_id
      AND ur.role IN ('super_admin', 'content_creator', 'operator')
      AND a.is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.has_super_admin_role(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.admins a ON ur.user_id = a.user_id
    WHERE ur.user_id = p_user_id
      AND ur.role = 'super_admin'
      AND a.is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.has_content_creator_role(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.admins a ON ur.user_id = a.user_id
    WHERE ur.user_id = p_user_id
      AND ur.role IN ('super_admin', 'content_creator')
      AND a.is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.has_operator_role(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.admins a ON ur.user_id = a.user_id
    WHERE ur.user_id = p_user_id
      AND ur.role IN ('super_admin', 'operator')
      AND a.is_active = true
  );
$$;

-- Recreate has_role function with new enum
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update existing is_admin function to check for any admin role
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_any_admin_role(user_id);
$$;

-- Function to get user's admin role
CREATE OR REPLACE FUNCTION public.get_user_admin_role(p_user_id uuid)
RETURNS TABLE(role text, is_active boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ur.role::text,
    a.is_active
  FROM public.user_roles ur
  JOIN public.admins a ON ur.user_id = a.user_id
  WHERE ur.user_id = p_user_id
    AND ur.role IN ('super_admin', 'content_creator', 'operator')
  LIMIT 1;
END;
$$;

-- Update product policies for content creators
DROP POLICY IF EXISTS "Only admins can modify products" ON public.products;

CREATE POLICY "Admins and content creators can modify products"
ON public.products
FOR ALL
USING (
  public.has_content_creator_role(auth.uid())
)
WITH CHECK (
  public.has_content_creator_role(auth.uid())
);

-- Update user management policies for operators
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins and operators can view all profiles"
ON public.profiles
FOR SELECT
USING (
  (auth.uid() = user_id) OR 
  public.has_operator_role(auth.uid())
);

-- Update admin-specific policies
DROP POLICY IF EXISTS "Only admins can manage admin records" ON public.admins;
DROP POLICY IF EXISTS "Only admins can view admin records" ON public.admins;

CREATE POLICY "Only super admins can manage admin records"
ON public.admins
FOR ALL
USING (public.has_super_admin_role(auth.uid()))
WITH CHECK (public.has_super_admin_role(auth.uid()));

CREATE POLICY "Admins can view admin records"
ON public.admins
FOR SELECT
USING (public.has_any_admin_role(auth.uid()));

-- Update user roles policies
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;

CREATE POLICY "Super admins can manage all user roles"
ON public.user_roles
FOR ALL
USING (public.has_super_admin_role(auth.uid()))
WITH CHECK (public.has_super_admin_role(auth.uid()));