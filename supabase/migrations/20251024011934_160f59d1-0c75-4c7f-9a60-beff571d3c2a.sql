-- Drop existing blog_settings if it exists
DROP TABLE IF EXISTS public.blog_settings CASCADE;

-- Create blog_settings table for auto-generation configuration
CREATE TABLE public.blog_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auto_generate_enabled BOOLEAN NOT NULL DEFAULT false,
  auto_approve_enabled BOOLEAN NOT NULL DEFAULT false,
  topics_source TEXT NOT NULL DEFAULT 'docs/BLOG_TOPICS.md',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.blog_settings (auto_generate_enabled, auto_approve_enabled)
VALUES (false, false);

-- Enable RLS
ALTER TABLE public.blog_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_settings
CREATE POLICY "Anyone can view blog settings" 
ON public.blog_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Only authenticated users can update blog settings" 
ON public.blog_settings 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_blog_settings_updated_at
BEFORE UPDATE ON public.blog_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();