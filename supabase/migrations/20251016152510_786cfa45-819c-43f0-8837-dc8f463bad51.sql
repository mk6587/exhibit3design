
-- Create a function to correct user token balances
CREATE OR REPLACE FUNCTION public.correct_user_tokens(
  p_user_id uuid,
  p_ai_tokens integer,
  p_video_results integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_ai_tokens integer;
  v_old_video_results integer;
BEGIN
  -- Get current balances
  SELECT ai_tokens_balance, video_results_balance
  INTO v_old_ai_tokens, v_old_video_results
  FROM public.profiles
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User profile not found');
  END IF;

  -- Update to correct balances
  UPDATE public.profiles
  SET 
    ai_tokens_balance = p_ai_tokens,
    video_results_balance = p_video_results,
    ai_tokens_limit = p_ai_tokens,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Log the correction
  INSERT INTO public.token_audit_log (
    user_id, action, token_type, amount,
    balance_before, balance_after, source, metadata
  ) VALUES (
    p_user_id, 'correction', 'ai_tokens', p_ai_tokens - v_old_ai_tokens,
    v_old_ai_tokens, p_ai_tokens, 'admin_correction',
    '{"reason": "Correcting duplicate token grant"}'::jsonb
  );

  INSERT INTO public.token_audit_log (
    user_id, action, token_type, amount,
    balance_before, balance_after, source, metadata
  ) VALUES (
    p_user_id, 'correction', 'video_results', p_video_results - v_old_video_results,
    v_old_video_results, p_video_results, 'admin_correction',
    '{"reason": "Correcting duplicate token grant"}'::jsonb
  );

  RETURN jsonb_build_object(
    'success', true,
    'ai_tokens_balance', p_ai_tokens,
    'video_results_balance', p_video_results
  );
END;
$$;
