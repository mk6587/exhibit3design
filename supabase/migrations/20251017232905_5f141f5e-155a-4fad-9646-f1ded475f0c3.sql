-- Create table for tracking login attempts
CREATE TABLE IF NOT EXISTS public.admin_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  attempt_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_admin_login_attempts_email ON public.admin_login_attempts(email, attempt_time DESC);
CREATE INDEX idx_admin_login_attempts_ip ON public.admin_login_attempts(ip_address, attempt_time DESC);

-- Enable RLS
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;

-- Only service role can manage login attempts
CREATE POLICY "Service role can manage login attempts"
ON public.admin_login_attempts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create table for whitelisted IPs
CREATE TABLE IF NOT EXISTS public.admin_ip_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_ip_whitelist ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage IP whitelist
CREATE POLICY "Admins can view IP whitelist"
ON public.admin_ip_whitelist
FOR SELECT
TO authenticated
USING (public.current_user_is_admin());

CREATE POLICY "Admins can manage IP whitelist"
ON public.admin_ip_whitelist
FOR ALL
TO authenticated
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

-- Insert the user's IP address
INSERT INTO public.admin_ip_whitelist (ip_address, description, is_active)
VALUES ('45.139.227.130', 'Primary admin IP', true)
ON CONFLICT (ip_address) DO NOTHING;

-- Function to check rate limiting (max 5 attempts in 15 minutes)
CREATE OR REPLACE FUNCTION public.check_admin_rate_limit(
  p_email TEXT,
  p_ip_address TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email_attempts INTEGER;
  v_ip_attempts INTEGER;
  v_lockout_until TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check failed attempts by email in last 15 minutes
  SELECT COUNT(*)
  INTO v_email_attempts
  FROM public.admin_login_attempts
  WHERE email = p_email
    AND success = false
    AND attempt_time > now() - interval '15 minutes';
    
  -- Check failed attempts by IP in last 15 minutes
  SELECT COUNT(*)
  INTO v_ip_attempts
  FROM public.admin_login_attempts
  WHERE ip_address = p_ip_address
    AND success = false
    AND attempt_time > now() - interval '15 minutes';
  
  -- If too many attempts, calculate lockout time
  IF v_email_attempts >= 5 OR v_ip_attempts >= 10 THEN
    SELECT attempt_time + interval '15 minutes'
    INTO v_lockout_until
    FROM public.admin_login_attempts
    WHERE (email = p_email OR ip_address = p_ip_address)
      AND success = false
      AND attempt_time > now() - interval '15 minutes'
    ORDER BY attempt_time DESC
    LIMIT 1;
    
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'rate_limit_exceeded',
      'lockout_until', v_lockout_until,
      'email_attempts', v_email_attempts,
      'ip_attempts', v_ip_attempts
    );
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'email_attempts', v_email_attempts,
    'ip_attempts', v_ip_attempts
  );
END;
$$;

-- Function to check IP whitelist
CREATE OR REPLACE FUNCTION public.check_admin_ip_whitelist(p_ip_address TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_ip_whitelist
    WHERE ip_address = p_ip_address
      AND is_active = true
  );
END;
$$;

-- Function to log login attempt
CREATE OR REPLACE FUNCTION public.log_admin_login_attempt(
  p_email TEXT,
  p_ip_address TEXT,
  p_success BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_login_attempts (email, ip_address, success)
  VALUES (p_email, p_ip_address, p_success);
  
  -- Clean up old attempts (older than 24 hours)
  DELETE FROM public.admin_login_attempts
  WHERE attempt_time < now() - interval '24 hours';
END;
$$;