-- Fix search path for admin_fix_user_tokens function
CREATE OR REPLACE FUNCTION public.admin_fix_user_tokens(
  p_user_id uuid,
  p_ai_tokens_balance integer,
  p_ai_tokens_limit integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    ai_tokens_balance = p_ai_tokens_balance,
    ai_tokens_limit = p_ai_tokens_limit,
    updated_at = now()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User tokens updated successfully'
  );
END;
$$;