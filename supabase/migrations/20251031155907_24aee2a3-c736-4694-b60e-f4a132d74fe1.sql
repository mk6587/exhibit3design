-- Make user_id nullable in user_roles since admin agents use admin_agent_id instead
ALTER TABLE public.user_roles 
ALTER COLUMN user_id DROP NOT NULL;

-- Add constraint to ensure either user_id or admin_agent_id is set, but not both
ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_user_or_agent_check 
CHECK (
  (user_id IS NOT NULL AND admin_agent_id IS NULL) OR
  (user_id IS NULL AND admin_agent_id IS NOT NULL)
);