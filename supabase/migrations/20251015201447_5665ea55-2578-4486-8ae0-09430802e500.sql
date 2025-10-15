-- Update trial/free subscription plans to have no design files and 2 AI tokens
UPDATE public.subscription_plans
SET 
  max_files = 0,
  initial_ai_tokens = 2,
  updated_at = now()
WHERE name ILIKE '%trial%' OR name ILIKE '%free%' OR file_access_tier = 'sample';

-- Update default ai_tokens_limit in profiles table to 2
ALTER TABLE public.profiles 
ALTER COLUMN ai_tokens_limit SET DEFAULT 2;

-- Update existing trial users who haven't claimed tokens yet to have limit of 2
UPDATE public.profiles
SET 
  ai_tokens_limit = 2,
  ai_tokens_balance = LEAST(ai_tokens_balance, 2),
  updated_at = now()
WHERE ai_tokens_limit = 5 
  AND free_tokens_claimed = false;