
-- Create a function to manually create subscriptions (admin use)
CREATE OR REPLACE FUNCTION public.create_subscription_for_user(
  p_user_id uuid,
  p_plan_id uuid,
  p_period_days integer DEFAULT 30
)
RETURNS TABLE(subscription_id uuid, success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_subscription_id uuid;
  plan_ai_tokens integer;
  plan_video_results integer;
BEGIN
  -- Get plan details
  SELECT initial_ai_tokens, video_results 
  INTO plan_ai_tokens, plan_video_results
  FROM subscription_plans 
  WHERE id = p_plan_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::uuid, false, 'Plan not found or inactive';
    RETURN;
  END IF;
  
  -- Create subscription
  INSERT INTO user_subscriptions (
    user_id,
    plan_id,
    status,
    current_period_start,
    current_period_end
  ) VALUES (
    p_user_id,
    p_plan_id,
    'active',
    now(),
    now() + (p_period_days || ' days')::interval
  )
  RETURNING id INTO new_subscription_id;
  
  -- Grant tokens
  PERFORM grant_tokens_atomic(
    p_user_id,
    plan_ai_tokens,
    plan_video_results,
    'subscription_activation',
    jsonb_build_object('subscription_id', new_subscription_id)
  );
  
  RETURN QUERY SELECT new_subscription_id, true, 'Subscription created successfully';
END;
$$;
