-- Update the admin_update_user_tokens function to include ai_tokens_limit
CREATE OR REPLACE FUNCTION admin_update_user_tokens(
  p_user_id UUID,
  p_admin_id UUID,
  p_ai_tokens INTEGER,
  p_ai_tokens_limit INTEGER,
  p_video_results INTEGER,
  p_reason TEXT
)
RETURNS JSON AS $$
DECLARE
  v_old_ai_tokens INTEGER;
  v_old_ai_tokens_limit INTEGER;
  v_old_video_results INTEGER;
BEGIN
  -- Verify admin permissions
  IF NOT current_user_is_admin() AND NOT has_operator_role(p_admin_id) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Get current values
  SELECT ai_tokens_balance, ai_tokens_limit, video_results_balance 
  INTO v_old_ai_tokens, v_old_ai_tokens_limit, v_old_video_results
  FROM profiles 
  WHERE user_id = p_user_id;

  -- Update user tokens and limit
  UPDATE profiles
  SET 
    ai_tokens_balance = p_ai_tokens,
    ai_tokens_limit = p_ai_tokens_limit,
    video_results_balance = p_video_results,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Log AI tokens adjustment if changed
  IF v_old_ai_tokens != p_ai_tokens THEN
    INSERT INTO token_audit_log (
      user_id,
      token_type,
      action,
      amount,
      balance_before,
      balance_after,
      source,
      metadata
    ) VALUES (
      p_user_id,
      'ai_tokens',
      'admin_adjustment',
      p_ai_tokens - v_old_ai_tokens,
      v_old_ai_tokens,
      p_ai_tokens,
      'admin_panel',
      json_build_object('admin_id', p_admin_id, 'reason', p_reason)
    );
  END IF;

  -- Log AI tokens limit adjustment if changed
  IF v_old_ai_tokens_limit != p_ai_tokens_limit THEN
    INSERT INTO token_audit_log (
      user_id,
      token_type,
      action,
      amount,
      balance_before,
      balance_after,
      source,
      metadata
    ) VALUES (
      p_user_id,
      'ai_tokens_limit',
      'admin_adjustment',
      p_ai_tokens_limit - v_old_ai_tokens_limit,
      v_old_ai_tokens_limit,
      p_ai_tokens_limit,
      'admin_panel',
      json_build_object('admin_id', p_admin_id, 'reason', p_reason)
    );
  END IF;

  -- Log video results adjustment if changed
  IF v_old_video_results != p_video_results THEN
    INSERT INTO token_audit_log (
      user_id,
      token_type,
      action,
      amount,
      balance_before,
      balance_after,
      source,
      metadata
    ) VALUES (
      p_user_id,
      'video_results',
      'admin_adjustment',
      p_video_results - v_old_video_results,
      v_old_video_results,
      p_video_results,
      'admin_panel',
      json_build_object('admin_id', p_admin_id, 'reason', p_reason)
    );
  END IF;

  -- Log to user activity
  INSERT INTO user_activity_log (
    user_id,
    admin_id,
    action_type,
    action_details
  ) VALUES (
    p_user_id,
    p_admin_id,
    'token_adjustment',
    json_build_object(
      'old_ai_tokens', v_old_ai_tokens,
      'new_ai_tokens', p_ai_tokens,
      'old_ai_tokens_limit', v_old_ai_tokens_limit,
      'new_ai_tokens_limit', p_ai_tokens_limit,
      'old_video_results', v_old_video_results,
      'new_video_results', p_video_results,
      'reason', p_reason
    )
  );

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;