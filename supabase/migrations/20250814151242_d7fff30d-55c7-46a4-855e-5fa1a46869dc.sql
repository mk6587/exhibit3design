-- Check and fix video storage bucket configuration

-- First, ensure the video bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('videos', 'videos', true, 104857600, ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'application/vnd.apple.mpegurl'])
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'application/vnd.apple.mpegurl'];

-- Create RLS policies for video bucket
CREATE POLICY "Anyone can view videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can upload videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own videos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create a function to get the default video URL safely
CREATE OR REPLACE FUNCTION public.get_default_video_url()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  video_url TEXT;
BEGIN
  -- Try to get the first available video from the videos bucket
  SELECT 
    CASE 
      WHEN public_url IS NOT NULL THEN public_url
      ELSE 'https://' || (SELECT project_url FROM storage.buckets WHERE id = 'videos' LIMIT 1) || '/storage/v1/object/public/videos/' || name
    END
  INTO video_url
  FROM storage.objects 
  WHERE bucket_id = 'videos' 
    AND name LIKE '%.mp4'
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Return the video URL or a placeholder
  RETURN COALESCE(video_url, '');
END;
$$;