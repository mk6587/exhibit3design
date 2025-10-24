-- Fix search path for trigger function
CREATE OR REPLACE FUNCTION trigger_generate_blog_image()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    
    -- Get Supabase credentials
    v_supabase_url := 'https://fipebdkvzdrljwwxccrj.supabase.co';
    v_service_role_key := current_setting('app.settings.service_role_key', true);
    
    -- Make async HTTP request to generate image
    PERFORM net.http_post(
      url := v_supabase_url || '/functions/v1/generate-blog-images',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || COALESCE(v_service_role_key, '')
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
$$;
