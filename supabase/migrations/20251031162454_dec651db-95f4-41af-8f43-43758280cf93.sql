-- Create admin_activity_log table to track all admin agent actions
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_agent_id UUID REFERENCES public.admin_agents(id) ON DELETE CASCADE,
  admin_user_id UUID, -- For backward compatibility with auth.users based admins
  action_type TEXT NOT NULL,
  action_details JSONB DEFAULT '{}'::jsonb,
  resource_type TEXT, -- e.g., 'product', 'user', 'subscription'
  resource_id TEXT, -- ID of the affected resource
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Only super admins can view activity logs
CREATE POLICY "Super admins can view all activity logs"
ON public.admin_activity_log
FOR SELECT
TO authenticated
USING (public.has_super_admin_role(auth.uid()));

-- Service role can insert activity logs
CREATE POLICY "Service role can insert activity logs"
ON public.admin_activity_log
FOR INSERT
TO service_role
WITH CHECK (true);

-- Admin agents can insert their own activity logs
CREATE POLICY "Admin agents can insert their own logs"
ON public.admin_activity_log
FOR INSERT
TO authenticated
WITH CHECK (
  admin_agent_id IN (
    SELECT id FROM public.admin_agents 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  ) OR
  admin_user_id = auth.uid()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_agent_id ON public.admin_activity_log(admin_agent_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_user_id ON public.admin_activity_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_action_type ON public.admin_activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON public.admin_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_resource ON public.admin_activity_log(resource_type, resource_id);