-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Schedule daily blog generation at 9 AM UTC
SELECT cron.schedule(
  'daily-blog-generation',
  '0 9 * * *', -- Every day at 9 AM UTC
  $$
  SELECT
    net.http_post(
      url:='https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/auto-generate-blog',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpcGViZGt2emRybGp3d3hjY3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MjczMTAsImV4cCI6MjA2NzMwMzMxMH0.N_48R70OWvLsf5INnGiswao__kjUW6ybYdnPIRm0owk"}'::jsonb,
      body:=concat('{"timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);