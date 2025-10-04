-- Update token limit for specific user
UPDATE public.user_tokens
SET tokens_limit = 5, updated_at = now()
WHERE email = 'mahsa.k8408@gmail.com';