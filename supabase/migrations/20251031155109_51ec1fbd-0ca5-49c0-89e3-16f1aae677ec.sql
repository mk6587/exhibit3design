-- Create admin_agents table for separate admin authentication
CREATE TABLE IF NOT EXISTS public.admin_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_agents ENABLE ROW LEVEL SECURITY;

-- Only super admins can view admin agents
CREATE POLICY "Super admins can view admin agents"
ON public.admin_agents
FOR SELECT
TO authenticated
USING (public.has_super_admin_role(auth.uid()));

-- Only super admins can manage admin agents
CREATE POLICY "Super admins can manage admin agents"
ON public.admin_agents
FOR ALL
TO authenticated
USING (public.has_super_admin_role(auth.uid()))
WITH CHECK (public.has_super_admin_role(auth.uid()));

-- Service role can create admin agents
CREATE POLICY "Service role can create admin agents"
ON public.admin_agents
FOR INSERT
TO service_role
WITH CHECK (true);

-- Service role can read admin agents for authentication
CREATE POLICY "Service role can read admin agents"
ON public.admin_agents
FOR SELECT
TO service_role
USING (true);

-- Add admin_agent_id to admins table
ALTER TABLE public.admins 
ADD COLUMN IF NOT EXISTS admin_agent_id UUID REFERENCES public.admin_agents(id) ON DELETE CASCADE;

-- Add admin_agent_id to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS admin_agent_id UUID REFERENCES public.admin_agents(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_agents_email ON public.admin_agents(email);
CREATE INDEX IF NOT EXISTS idx_admin_agents_username ON public.admin_agents(username);
CREATE INDEX IF NOT EXISTS idx_admins_admin_agent_id ON public.admins(admin_agent_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_admin_agent_id ON public.user_roles(admin_agent_id);

-- Update check_user_admin_status function to support both auth.users and admin_agents
CREATE OR REPLACE FUNCTION public.check_user_admin_status(check_user_id uuid)
RETURNS TABLE(is_admin boolean, is_active boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXISTS (
      SELECT 1 
      FROM public.user_roles ur
      JOIN public.admins a ON ur.user_id = a.user_id OR ur.admin_agent_id = a.admin_agent_id
      WHERE (ur.user_id = check_user_id OR ur.admin_agent_id IN (
        SELECT admin_agent_id FROM public.admins WHERE user_id = check_user_id
      ))
        AND ur.role IN ('super_admin', 'content_creator', 'operator')
        AND a.is_active = true
    ),
    COALESCE(
      (SELECT a.is_active FROM public.admins a WHERE a.user_id = check_user_id LIMIT 1),
      false
    );
END;
$$;