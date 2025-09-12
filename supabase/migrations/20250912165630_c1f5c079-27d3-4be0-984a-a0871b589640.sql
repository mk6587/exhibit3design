-- Create table for SSO tokens
CREATE TABLE IF NOT EXISTS public.sso_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  redirect_url TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sso_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for SSO tokens (service role only for security)
CREATE POLICY "Service role can manage SSO tokens" 
ON public.sso_tokens 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create index for better performance
CREATE INDEX idx_sso_tokens_token ON public.sso_tokens(token);
CREATE INDEX idx_sso_tokens_expires ON public.sso_tokens(expires_at);

-- Function to cleanup expired SSO tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_sso_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.sso_tokens 
  WHERE expires_at < now() OR used = true;
END;
$$;