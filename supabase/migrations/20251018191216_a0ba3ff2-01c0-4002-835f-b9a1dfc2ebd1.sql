-- Update default AI tokens for new users from 5 to 2
ALTER TABLE public.profiles 
ALTER COLUMN ai_tokens_balance SET DEFAULT 2;