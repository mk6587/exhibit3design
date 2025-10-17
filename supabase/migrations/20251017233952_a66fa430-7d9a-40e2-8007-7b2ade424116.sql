-- Add soft delete to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deactivation_reason TEXT;

-- Create user activity log table
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  admin_id UUID,
  action_type TEXT NOT NULL,
  action_details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_admin_id ON public.user_activity_log(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_action_type ON public.user_activity_log(action_type);

-- Enable RLS
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view activity logs
CREATE POLICY "Admins can view all activity logs"
ON public.user_activity_log
FOR SELECT
TO authenticated
USING (public.current_user_is_admin());

-- Service role can insert activity logs
CREATE POLICY "Service role can insert activity logs"
ON public.user_activity_log
FOR INSERT
TO service_role
WITH CHECK (true);

-- Function to log user activity
CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id UUID,
  p_admin_id UUID,
  p_action_type TEXT,
  p_action_details JSONB DEFAULT '{}'::jsonb,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.user_activity_log (
    user_id,
    admin_id,
    action_type,
    action_details,
    ip_address
  ) VALUES (
    p_user_id,
    p_admin_id,
    p_action_type,
    p_action_details,
    p_ip_address
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Function to update user tokens (admin only)
CREATE OR REPLACE FUNCTION public.admin_update_user_tokens(
  p_user_id UUID,
  p_admin_id UUID,
  p_ai_tokens INTEGER,
  p_video_results INTEGER,
  p_reason TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_ai_tokens INTEGER;
  v_old_video_results INTEGER;
BEGIN
  -- Check if caller is admin
  IF NOT public.current_user_is_admin() THEN
    RAISE EXCEPTION 'Admin privileges required';
  END IF;

  -- Get current balances
  SELECT ai_tokens_balance, video_results_balance
  INTO v_old_ai_tokens, v_old_video_results
  FROM public.profiles
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Update tokens
  UPDATE public.profiles
  SET 
    ai_tokens_balance = p_ai_tokens,
    video_results_balance = p_video_results,
    ai_tokens_limit = GREATEST(ai_tokens_limit, p_ai_tokens),
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Log the change
  PERFORM public.log_user_activity(
    p_user_id,
    p_admin_id,
    'tokens_updated',
    jsonb_build_object(
      'old_ai_tokens', v_old_ai_tokens,
      'new_ai_tokens', p_ai_tokens,
      'old_video_results', v_old_video_results,
      'new_video_results', p_video_results,
      'reason', p_reason
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'ai_tokens', p_ai_tokens,
    'video_results', p_video_results
  );
END;
$$;

-- Function to soft delete/activate user (admin only)
CREATE OR REPLACE FUNCTION public.admin_toggle_user_status(
  p_user_id UUID,
  p_admin_id UUID,
  p_is_active BOOLEAN,
  p_reason TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT public.current_user_is_admin() THEN
    RAISE EXCEPTION 'Admin privileges required';
  END IF;

  -- Update user status
  UPDATE public.profiles
  SET 
    is_active = p_is_active,
    deactivated_at = CASE WHEN p_is_active THEN NULL ELSE now() END,
    deactivation_reason = CASE WHEN p_is_active THEN NULL ELSE p_reason END,
    updated_at = now()
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Log the action
  PERFORM public.log_user_activity(
    p_user_id,
    p_admin_id,
    CASE WHEN p_is_active THEN 'user_activated' ELSE 'user_deactivated' END,
    jsonb_build_object('reason', p_reason)
  );

  RETURN jsonb_build_object('success', true, 'is_active', p_is_active);
END;
$$;