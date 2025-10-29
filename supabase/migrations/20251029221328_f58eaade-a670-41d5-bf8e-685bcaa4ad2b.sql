-- Update handle_new_user function to assign tokens from Free subscription plan
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  free_plan_tokens INTEGER;
  free_plan_video INTEGER;
BEGIN
  -- Get token values from the free subscription plan
  SELECT initial_ai_tokens, video_results 
  INTO free_plan_tokens, free_plan_video
  FROM subscription_plans 
  WHERE LOWER(name) LIKE '%free%' 
    AND price = 0 
    AND is_active = true
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Fallback to defaults if no free plan exists
  free_plan_tokens := COALESCE(free_plan_tokens, 2);
  free_plan_video := COALESCE(free_plan_video, 0);
  
  -- Insert profile with tokens from subscription plan
  INSERT INTO public.profiles (
    user_id, 
    first_name, 
    last_name, 
    email,
    ai_tokens_balance,
    ai_tokens_limit,
    video_results_balance
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.email,
    free_plan_tokens,
    free_plan_tokens,
    free_plan_video
  );
  
  RETURN new;
END;
$$;