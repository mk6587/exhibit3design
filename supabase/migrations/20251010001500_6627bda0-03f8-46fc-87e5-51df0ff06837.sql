-- Step 1: Modify ai_generation_history to support public samples
-- Make user_id nullable to support public samples
ALTER TABLE public.ai_generation_history 
ALTER COLUMN user_id DROP NOT NULL;

-- Add a flag to identify public samples
ALTER TABLE public.ai_generation_history 
ADD COLUMN IF NOT EXISTS is_public_sample boolean DEFAULT false;

-- Step 2: Migrate data from ai_edit_samples to ai_generation_history
INSERT INTO public.ai_generation_history (
  id,
  user_id,
  prompt,
  service_type,
  input_image_url,
  output_image_url,
  tokens_used,
  created_at,
  is_public_sample
)
SELECT 
  id,
  NULL as user_id, -- Public samples have no user
  COALESCE(prompt_used, title) as prompt,
  category as service_type,
  before_image_url as input_image_url,
  after_image_url as output_image_url,
  1 as tokens_used,
  created_at,
  true as is_public_sample
FROM public.ai_edit_samples;

-- Step 3: Update RLS policies to allow viewing public samples
DROP POLICY IF EXISTS "Users can view their own AI history" ON public.ai_generation_history;
DROP POLICY IF EXISTS "Users can create their own AI history" ON public.ai_generation_history;

-- Allow viewing own history OR public samples
CREATE POLICY "Users can view their own AI history or public samples"
ON public.ai_generation_history
FOR SELECT
USING (
  (auth.uid() = user_id) OR 
  (is_public_sample = true)
);

-- Only authenticated users can create their own history (not public samples)
CREATE POLICY "Users can create their own AI history"
ON public.ai_generation_history
FOR INSERT
WITH CHECK (
  (auth.uid() = user_id) AND 
  (is_public_sample = false)
);

-- Step 4: Drop the old ai_edit_samples table (no longer needed)
DROP TABLE IF EXISTS public.ai_edit_samples;