-- Update the has_super_admin_role function to support both regular users and admin agents
-- Keep the parameter name as p_user_id to maintain compatibility
CREATE OR REPLACE FUNCTION public.has_super_admin_role(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user has super_admin role in user_roles table
  -- Supports both regular users (user_id) and admin agents (admin_agent_id)
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE (user_id = p_user_id OR admin_agent_id = p_user_id)
    AND role = 'super_admin'
  );
END;
$$;

-- Helper function to check if an admin agent has a specific role
CREATE OR REPLACE FUNCTION public.has_admin_agent_role(p_agent_id uuid, p_role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE admin_agent_id = p_agent_id
      AND role = p_role
  );
END;
$$;