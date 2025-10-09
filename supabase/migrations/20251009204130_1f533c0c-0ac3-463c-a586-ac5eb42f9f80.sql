-- Rename video_seconds columns to video_results in subscription_plans
ALTER TABLE public.subscription_plans 
  RENAME COLUMN video_seconds TO video_results;

-- Rename video_seconds columns to video_results in profiles
ALTER TABLE public.profiles 
  RENAME COLUMN video_seconds_balance TO video_results_balance;

ALTER TABLE public.profiles 
  RENAME COLUMN video_seconds_used TO video_results_used;

-- Drop and recreate get_user_token_balance function with new return type
DROP FUNCTION IF EXISTS public.get_user_token_balance(uuid);

CREATE FUNCTION public.get_user_token_balance(p_user_id uuid)
RETURNS TABLE(ai_tokens integer, video_results integer, free_tokens_claimed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(p.ai_tokens_balance, 0) as ai_tokens,
    COALESCE(p.video_results_balance, 0) as video_results,
    COALESCE(p.free_tokens_claimed, false) as free_tokens_claimed
  FROM public.profiles p
  WHERE p.user_id = p_user_id;
END;
$$;

-- Drop old deduct_video_seconds function and create new deduct_video_results
DROP FUNCTION IF EXISTS public.deduct_video_seconds(uuid, integer);

CREATE FUNCTION public.deduct_video_results(p_user_id uuid, p_count integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT video_results_balance INTO current_balance
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  -- Check if user has enough video results
  IF current_balance < p_count THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct video results
  UPDATE public.profiles
  SET 
    video_results_balance = video_results_balance - p_count,
    video_results_used = video_results_used + p_count,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$;

-- Drop and recreate get_active_subscription function
DROP FUNCTION IF EXISTS public.get_active_subscription(uuid);

CREATE FUNCTION public.get_active_subscription(p_user_id uuid)
RETURNS TABLE(subscription_id uuid, plan_id uuid, plan_name text, plan_price numeric, file_access_tier text, ai_tokens_included integer, video_results_included integer, status text, current_period_end timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.id as subscription_id,
    sp.id as plan_id,
    sp.name as plan_name,
    sp.price as plan_price,
    sp.file_access_tier,
    sp.initial_ai_tokens as ai_tokens_included,
    sp.video_results as video_results_included,
    us.status,
    us.current_period_end
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
    AND us.status = 'active'
    AND us.current_period_end > now()
  ORDER BY sp.display_order DESC
  LIMIT 1;
END;
$$;