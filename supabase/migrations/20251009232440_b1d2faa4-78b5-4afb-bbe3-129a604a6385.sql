-- Update AI edit samples with real before/after images
UPDATE public.ai_edit_samples
SET 
  before_image_url = 'https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/2/sketch-before.png',
  after_image_url = 'https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/2/sketch-after.jpg'
WHERE display_order = 1;

UPDATE public.ai_edit_samples
SET 
  before_image_url = 'https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/1/girl-before.jpeg',
  after_image_url = 'https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/1/girl-after.jpg',
  title = 'Style & Color Transformation',
  description = 'Transform portraits with AI-powered style and color adjustments for professional results.',
  prompt_used = 'enhance portrait with professional lighting and vibrant colors'
WHERE display_order = 2;

UPDATE public.ai_edit_samples
SET 
  before_image_url = 'https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/3/video-rotating.jpg',
  after_image_url = 'https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/ai-studio/before-after/3/video-rotating.mp4',
  title = 'Image to Video Animation',
  description = 'Convert static images into dynamic rotating video animations with AI.',
  prompt_used = 'create smooth 360 degree rotation animation',
  category = 'animation'
WHERE display_order = 3;