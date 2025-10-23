-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to trigger auto blog generation
CREATE OR REPLACE FUNCTION public.trigger_auto_blog_generation()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  supabase_url TEXT := 'https://fipebdkvzdrljwwxccrj.supabase.co';
  anon_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpcGViZGt2emRybGp3d3hjY3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MjczMTAsImV4cCI6MjA2NzMwMzMxMH0.N_48R70OWvLsf5INnGiswao__kjUW6ybYdnPIRm0owk';
BEGIN
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/auto-generate-blog',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key
    ),
    body := jsonb_build_object('timestamp', now())
  );
END;
$$;

-- Schedule daily blog generation at 9 AM UTC
-- This will run every day at 9:00 AM
SELECT cron.schedule(
  'auto-generate-blog-daily',
  '0 9 * * *', -- Every day at 9 AM
  $$SELECT public.trigger_auto_blog_generation();$$
);

-- Create a table to track generation history
CREATE TABLE IF NOT EXISTS public.blog_generation_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'skipped')),
  keyword TEXT,
  post_id UUID REFERENCES public.blog_posts(id),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on blog_generation_log
ALTER TABLE public.blog_generation_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view generation logs
CREATE POLICY "Admins can view generation logs"
  ON public.blog_generation_log FOR SELECT
  USING (current_user_is_admin());

-- Service role can insert logs
CREATE POLICY "Service role can insert generation logs"
  ON public.blog_generation_log FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Create index for performance
CREATE INDEX idx_blog_generation_log_created_at ON public.blog_generation_log(created_at DESC);
CREATE INDEX idx_blog_generation_log_status ON public.blog_generation_log(status);