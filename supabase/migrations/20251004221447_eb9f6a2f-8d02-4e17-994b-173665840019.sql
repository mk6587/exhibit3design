-- Add ai_tokens_limit column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ai_tokens_limit integer NOT NULL DEFAULT 2;

-- Set the token limit for the specific user
UPDATE public.profiles
SET ai_tokens_limit = 5
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'mahsa.k8408@gmail.com'
);