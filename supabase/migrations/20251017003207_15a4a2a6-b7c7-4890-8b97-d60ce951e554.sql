-- Create ai_samples table for managing showcase samples in admin panel
CREATE TABLE public.ai_samples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  mode_label TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  before_image_url TEXT,
  after_image_url TEXT,
  before_video_url TEXT,
  after_video_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  external_link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_samples ENABLE ROW LEVEL SECURITY;

-- Public can view active samples
CREATE POLICY "Anyone can view active AI samples"
  ON public.ai_samples
  FOR SELECT
  USING (is_active = true);

-- Only admins can manage AI samples
CREATE POLICY "Only admins can manage AI samples"
  ON public.ai_samples
  FOR ALL
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_ai_samples_updated_at
  BEFORE UPDATE ON public.ai_samples
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default samples
INSERT INTO public.ai_samples (name, mode_label, type, before_image_url, after_image_url, sort_order, is_active) VALUES
  ('Sketch Mode Sample', 'Sketch Mode', 'image', 
   'https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/2/sketch-before.png',
   'https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/2/sketch-after.jpg?v=2',
   1, true),
  ('Video Generation Sample', 'Video Generation', 'video',
   'https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/3/video-rotating.jpg',
   NULL,
   2, true),
  ('360° Walkthrough Sample', 'Visitors Walkthrough Video', 'video',
   'https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/4/walkthrough-before.png',
   NULL,
   3, true),
  ('Artistic Render Sample', 'Artistic Render', 'image',
   'https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/1/girl-before.jpeg?v=2',
   'https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/1/girl-after.jpg?v=2',
   4, true);

-- Update video samples with after video URLs
UPDATE public.ai_samples 
SET after_video_url = 'https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/3/video-rotating.mp4'
WHERE mode_label = 'Video Generation';

UPDATE public.ai_samples 
SET after_video_url = 'https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/4/walkthrough-video-after.mp4'
WHERE mode_label = 'Visitors Walkthrough Video';