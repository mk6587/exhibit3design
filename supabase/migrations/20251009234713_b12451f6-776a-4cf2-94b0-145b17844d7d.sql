-- Create table for AI generation history
CREATE TABLE public.ai_generation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  service_type TEXT NOT NULL, -- 'image_generation', 'image_edit', 'style_transfer', etc.
  input_image_url TEXT,
  output_image_url TEXT NOT NULL,
  tokens_used INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_generation_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own AI generation history
CREATE POLICY "Users can view their own AI history"
ON public.ai_generation_history
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own AI generation history
CREATE POLICY "Users can create their own AI history"
ON public.ai_generation_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_ai_history_user_id ON public.ai_generation_history(user_id);
CREATE INDEX idx_ai_history_created_at ON public.ai_generation_history(created_at DESC);