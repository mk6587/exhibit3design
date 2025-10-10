-- Insert AI edit samples
INSERT INTO public.ai_edit_samples (
  title,
  description,
  before_image_url,
  after_image_url,
  prompt_used,
  category,
  display_order,
  is_featured
) VALUES
(
  'Portrait Enhancement',
  'AI-enhanced portrait with improved lighting and detail',
  'https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/1/girl-before.jpeg',
  'https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/1/girl-after.jpg',
  'Enhance portrait with professional lighting and detail',
  'image_edit',
  1,
  true
),
(
  'Sketch to Render',
  'Transform sketch into photorealistic exhibition stand',
  'https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/2/sketch-before.png',
  'https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/2/sketch-after.jpg',
  'Convert sketch to photorealistic 3D render',
  'image_generation',
  2,
  true
),
(
  'Rotating Stand Video',
  '360-degree rotating exhibition stand animation',
  'https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/3/video-rotating.jpg',
  'https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/3/video-rotating.mp4',
  'Create 360-degree rotating video animation',
  'animation',
  3,
  true
);