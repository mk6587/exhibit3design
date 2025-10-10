-- Remove unused user_tokens table and related functions/triggers
-- The application is using profiles.ai_tokens_* columns instead

-- Drop trigger first
DROP TRIGGER IF EXISTS on_auth_user_created_tokens ON auth.users;

-- Drop trigger for updates
DROP TRIGGER IF EXISTS update_user_tokens_updated_at ON public.user_tokens;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user_tokens();
DROP FUNCTION IF EXISTS public.update_user_tokens_updated_at();

-- Drop the unused table
DROP TABLE IF EXISTS public.user_tokens;