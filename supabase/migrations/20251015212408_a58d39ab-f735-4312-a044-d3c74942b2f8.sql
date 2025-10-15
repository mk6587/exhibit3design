-- Drop and recreate get_user_token_balance to include token limits
DROP FUNCTION IF EXISTS public.get_user_token_balance(uuid);

CREATE OR REPLACE FUNCTION public.get_user_token_balance(p_user_id uuid)
RETURNS TABLE(
  ai_tokens integer, 
  video_results integer, 
  free_tokens_claimed boolean,
  ai_tokens_limit integer,
  video_results_limit integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(p.ai_tokens_balance, 0) as ai_tokens,
    COALESCE(p.video_results_balance, 0) as video_results,
    COALESCE(p.free_tokens_claimed, false) as free_tokens_claimed,
    COALESCE(p.ai_tokens_limit, 2) as ai_tokens_limit,
    -- Calculate video results limit based on subscription or default to 0 for free users
    COALESCE(
      (SELECT sp.video_results 
       FROM public.user_subscriptions us
       JOIN public.subscription_plans sp ON us.plan_id = sp.id
       WHERE us.user_id = p_user_id
         AND us.status = 'active'
         AND us.current_period_end > now()
       ORDER BY sp.display_order DESC
       LIMIT 1),
      0
    ) as video_results_limit
  FROM public.profiles p
  WHERE p.user_id = p_user_id;
END;
$$;