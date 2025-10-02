-- Add AI tokens tracking column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ai_tokens_used INTEGER DEFAULT 0 NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.ai_tokens_used IS 'Tracks number of times user has accessed AI features (limit: 2)';