-- Reset token usage for the specific user so they see 5 from 5
UPDATE public.profiles
SET ai_tokens_used = 0, updated_at = now()
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'mahsa.k8408@gmail.com'
);