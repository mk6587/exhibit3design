-- Create a trigger to automatically generate blog post images
CREATE OR REPLACE FUNCTION trigger_generate_blog_image()
RETURNS TRIGGER AS $$
DECLARE
  v_supabase_url text;
  v_service_role_key text;
BEGIN
  -- Only proceed if:
  -- 1. Post is being published
  -- 2. No featured image exists
  -- 3. Post has a title
  IF NEW.status = 'published' 
     AND NEW.featured_image_url IS NULL 
     AND NEW.title IS NOT NULL THEN
    
    -- Get Supabase credentials from vault or environment
    v_supabase_url := current_setting('app.settings.supabase_url', true);
    v_service_role_key := current_setting('app.settings.service_role_key', true);
    
    -- Make async HTTP request to generate image
    -- Using pg_net extension
    PERFORM net.http_post(
      url := v_supabase_url || '/functions/v1/generate-blog-images',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_role_key
      ),
      body := jsonb_build_object(
        'post_id', NEW.id,
        'title', NEW.title,
        'slug', NEW.slug,
        'meta_description', NEW.meta_description
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS auto_generate_blog_image ON blog_posts;

-- Create trigger that fires after insert or update
CREATE TRIGGER auto_generate_blog_image
  AFTER INSERT OR UPDATE OF status, featured_image_url
  ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_blog_image();

-- Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;
