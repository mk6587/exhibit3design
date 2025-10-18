-- Add mock_text_prompt column to ai_demo_configs table for text input demos
ALTER TABLE public.ai_demo_configs 
ADD COLUMN IF NOT EXISTS mock_text_prompt text;