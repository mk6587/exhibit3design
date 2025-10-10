-- Remove duplicate inactive subscription plans
DELETE FROM public.subscription_plans 
WHERE is_active = false;