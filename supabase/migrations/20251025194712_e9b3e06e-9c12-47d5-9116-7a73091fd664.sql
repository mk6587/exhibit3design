-- Create function to send welcome email after user signup
CREATE OR REPLACE FUNCTION public.send_welcome_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_email TEXT;
  v_supabase_url TEXT := 'https://fipebdkvzdrljwwxccrj.supabase.co';
  v_anon_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpcGViZGt2emRybGp3d3hjY3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MjczMTAsImV4cCI6MjA2NzMwMzMxMH0.N_48R70OWvLsf5INnGiswao__kjUW6ybYdnPIRm0owk';
BEGIN
  -- Get user email from auth.users
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = NEW.user_id;
  
  -- Only send if we have an email
  IF v_user_email IS NOT NULL THEN
    -- Call send-email edge function asynchronously
    PERFORM net.http_post(
      url := v_supabase_url || '/functions/v1/send-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_anon_key
      ),
      body := jsonb_build_object(
        'to', v_user_email,
        'subject', 'Welcome to Exhibit3Design - Your 2 FREE AI Tokens Are Ready!',
        'template', jsonb_build_object(
          'name', 'welcome-email',
          'props', jsonb_build_object(
            'user_email', v_user_email,
            'first_name', NEW.first_name,
            'ai_studio_url', v_supabase_url
          )
        )
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to send welcome email on profile creation
DROP TRIGGER IF EXISTS trigger_send_welcome_email ON public.profiles;

CREATE TRIGGER trigger_send_welcome_email
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email();