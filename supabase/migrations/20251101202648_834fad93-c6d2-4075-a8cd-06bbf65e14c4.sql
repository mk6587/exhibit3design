-- Create career_applications table
CREATE TABLE IF NOT EXISTS public.career_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_slug TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  linkedin_url TEXT,
  portfolio_url TEXT,
  cover_note TEXT,
  resume_url TEXT NOT NULL,
  token_usage_snapshot INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, job_slug)
);

-- Create application_attempts table for rate limiting
CREATE TABLE IF NOT EXISTS public.application_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_slug TEXT NOT NULL,
  attempt_time TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index for faster rate limit queries
CREATE INDEX IF NOT EXISTS idx_application_attempts_user_time 
  ON public.application_attempts(user_id, attempt_time DESC);

-- Create rate limit check function
CREATE OR REPLACE FUNCTION public.check_application_rate_limit(
  p_user_id UUID,
  p_job_slug TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempts_count INTEGER;
  v_has_active_application BOOLEAN;
BEGIN
  -- Count attempts in last 24 hours
  SELECT COUNT(*)
  INTO v_attempts_count
  FROM public.application_attempts
  WHERE user_id = p_user_id
    AND job_slug = p_job_slug
    AND attempt_time > now() - interval '24 hours';
  
  -- Check if user already has an application for this job
  SELECT EXISTS(
    SELECT 1
    FROM public.career_applications
    WHERE user_id = p_user_id
      AND job_slug = p_job_slug
  ) INTO v_has_active_application;
  
  RETURN jsonb_build_object(
    'allowed', (v_attempts_count < 3 AND NOT v_has_active_application),
    'attempts_count', v_attempts_count,
    'max_attempts', 3,
    'has_existing_application', v_has_active_application,
    'reset_time', now() + interval '24 hours'
  );
END;
$$;

-- Create function to check application eligibility
CREATE OR REPLACE FUNCTION public.check_application_eligibility(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tokens_used INTEGER;
  v_tokens_balance INTEGER;
BEGIN
  -- Get user's token usage from profiles
  SELECT 
    COALESCE(ai_tokens_used, 0),
    COALESCE(ai_tokens_balance, 0)
  INTO v_tokens_used, v_tokens_balance
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'eligible', false,
      'reason', 'profile_not_found',
      'has_used_token', false,
      'used_count', 0
    );
  END IF;
  
  RETURN jsonb_build_object(
    'eligible', (v_tokens_used >= 1),
    'has_used_token', (v_tokens_used >= 1),
    'used_count', v_tokens_used,
    'remaining_tokens', v_tokens_balance,
    'reason', CASE 
      WHEN v_tokens_used >= 1 THEN 'eligible'
      ELSE 'insufficient_token_usage'
    END
  );
END;
$$;

-- Enable RLS on career_applications
ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can insert their own applications
CREATE POLICY "Users can create their own applications"
  ON public.career_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can view their own applications
CREATE POLICY "Users can view their own applications"
  ON public.career_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Admins can view all applications
CREATE POLICY "Admins can view all applications"
  ON public.career_applications
  FOR SELECT
  TO authenticated
  USING (public.current_user_is_admin());

-- RLS Policy: Admins can update all applications
CREATE POLICY "Admins can update applications"
  ON public.career_applications
  FOR UPDATE
  TO authenticated
  USING (public.current_user_is_admin())
  WITH CHECK (public.current_user_is_admin());

-- Enable RLS on application_attempts
ALTER TABLE public.application_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Service role can manage attempts (for edge functions)
CREATE POLICY "Service role can manage attempts"
  ON public.application_attempts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create resumes storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Users can upload their own resumes
CREATE POLICY "Users can upload their own resumes"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'resumes' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- RLS Policy: Users can view their own resumes
CREATE POLICY "Users can view their own resumes"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'resumes' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- RLS Policy: Admins can view all resumes
CREATE POLICY "Admins can view all resumes"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'resumes' 
    AND public.current_user_is_admin()
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_career_applications_updated_at
  BEFORE UPDATE ON public.career_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();