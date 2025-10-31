-- Create a security definer function to check if an email belongs to an admin agent
-- This allows the login flow to determine the authentication method without exposing sensitive data
CREATE OR REPLACE FUNCTION public.is_admin_agent_email(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_agents
    WHERE email = p_email
    AND is_active = true
  );
$$;