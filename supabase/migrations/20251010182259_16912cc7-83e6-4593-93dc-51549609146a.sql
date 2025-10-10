-- Update default AI token balance for free users to 5
ALTER TABLE public.profiles 
ALTER COLUMN ai_tokens_balance SET DEFAULT 5;