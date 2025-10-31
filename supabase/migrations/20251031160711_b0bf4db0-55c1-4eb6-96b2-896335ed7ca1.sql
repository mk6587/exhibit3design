-- Make user_id nullable in admins table since admin agents use admin_agent_id instead
ALTER TABLE public.admins 
ALTER COLUMN user_id DROP NOT NULL;

-- Add constraint to ensure either user_id or admin_agent_id is set, but not both
ALTER TABLE public.admins
ADD CONSTRAINT admins_user_or_agent_check 
CHECK (
  (user_id IS NOT NULL AND admin_agent_id IS NULL) OR
  (user_id IS NULL AND admin_agent_id IS NOT NULL)
);

-- Update RLS policies to work with both user_id and admin_agent_id
DROP POLICY IF EXISTS "Admins can view admin records" ON public.admins;
CREATE POLICY "Admins can view admin records"
ON public.admins
FOR SELECT
TO authenticated
USING (
  has_any_admin_role(auth.uid()) OR 
  admin_agent_id IN (
    SELECT id FROM public.admin_agents WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Update the has_any_admin_role function to support admin_agents
CREATE OR REPLACE FUNCTION public.has_any_admin_role(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.admins a ON (ur.user_id = a.user_id OR ur.admin_agent_id = a.admin_agent_id)
    WHERE (ur.user_id = p_user_id OR ur.admin_agent_id IN (
      SELECT admin_agent_id FROM public.admins WHERE user_id = p_user_id
    ))
      AND ur.role IN ('super_admin', 'content_creator', 'operator')
      AND a.is_active = true
  );
$$;

-- Update has_super_admin_role function similarly
CREATE OR REPLACE FUNCTION public.has_super_admin_role(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.admins a ON (ur.user_id = a.user_id OR ur.admin_agent_id = a.admin_agent_id)
    WHERE (ur.user_id = p_user_id OR ur.admin_agent_id IN (
      SELECT admin_agent_id FROM public.admins WHERE user_id = p_user_id
    ))
      AND ur.role = 'super_admin'
      AND a.is_active = true
  );
$$;

-- Update has_content_creator_role function
CREATE OR REPLACE FUNCTION public.has_content_creator_role(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.admins a ON (ur.user_id = a.user_id OR ur.admin_agent_id = a.admin_agent_id)
    WHERE (ur.user_id = p_user_id OR ur.admin_agent_id IN (
      SELECT admin_agent_id FROM public.admins WHERE user_id = p_user_id
    ))
      AND ur.role IN ('super_admin', 'content_creator')
      AND a.is_active = true
  );
$$;

-- Update has_operator_role function
CREATE OR REPLACE FUNCTION public.has_operator_role(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.admins a ON (ur.user_id = a.user_id OR ur.admin_agent_id = a.admin_agent_id)
    WHERE (ur.user_id = p_user_id OR ur.admin_agent_id IN (
      SELECT admin_agent_id FROM public.admins WHERE user_id = p_user_id
    ))
      AND ur.role IN ('super_admin', 'operator')
      AND a.is_active = true
  );
$$;