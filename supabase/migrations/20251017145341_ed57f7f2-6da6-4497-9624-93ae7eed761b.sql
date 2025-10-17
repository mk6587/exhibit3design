-- Drop and recreate get_active_subscription function to include max_files
DROP FUNCTION IF EXISTS public.get_active_subscription(uuid);

CREATE FUNCTION public.get_active_subscription(p_user_id uuid)
RETURNS TABLE(
  subscription_id uuid, 
  plan_id uuid, 
  plan_name text, 
  plan_price numeric, 
  file_access_tier text, 
  ai_tokens_included integer, 
  video_results_included integer, 
  max_files integer,
  status text, 
  current_period_end timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    sp.max_files,
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
$function$;