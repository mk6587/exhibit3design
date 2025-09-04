-- Create a public video bucket for better performance
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('videos-public', 'videos-public', true, 209715200, ARRAY['video/mp4', 'video/webm', 'application/x-mpegURL', 'video/MP2T']);

-- Create RLS policies for public video access
CREATE POLICY "Public videos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'videos-public');

CREATE POLICY "Admin can upload videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'videos-public' AND auth.uid() IS NOT NULL);