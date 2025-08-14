-- Fix the search path security warning
CREATE OR REPLACE FUNCTION public.get_default_video_url()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  video_url TEXT;
  supabase_url TEXT := 'https://fipebdkvzdrljwwxccrj.supabase.co';
BEGIN
  -- Try to get the first available video from the videos bucket
  SELECT 
    supabase_url || '/storage/v1/object/public/videos/' || name
  INTO video_url
  FROM storage.objects 
  WHERE bucket_id = 'videos' 
    AND name LIKE '%.mp4'
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Return the video URL or empty string if no video found
  RETURN COALESCE(video_url, '');
END;
$$;