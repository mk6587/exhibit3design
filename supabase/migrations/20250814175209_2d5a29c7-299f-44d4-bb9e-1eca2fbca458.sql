-- Enhanced security for guest order tokens
-- Add token expiration and audit logging

-- Add token expiration column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Create audit log table for guest order access
CREATE TABLE IF NOT EXISTS public.guest_order_access_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  order_token TEXT NOT NULL,
  access_ip TEXT,
  access_user_agent TEXT,
  access_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  access_granted BOOLEAN NOT NULL DEFAULT false,
  failure_reason TEXT
);

-- Enable RLS on audit log table
ALTER TABLE public.guest_order_access_log ENABLE ROW LEVEL SECURITY;

-- Create policy for audit log (only service role can access)
CREATE POLICY "Service role can manage audit logs" 
ON public.guest_order_access_log 
FOR ALL 
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

-- Create enhanced token generation function with expiration
CREATE OR REPLACE FUNCTION public.generate_secure_order_token()
RETURNS TABLE(token TEXT, expires_at TIMESTAMP WITH TIME ZONE)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_token TEXT;
  token_expiry TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Generate cryptographically secure token (43 characters base64url)
  new_token := encode(gen_random_bytes(32), 'base64url');
  
  -- Set token to expire in 30 days
  token_expiry := now() + interval '30 days';
  
  RETURN QUERY SELECT new_token, token_expiry;
END;
$function$;

-- Update the existing trigger to use enhanced token generation
CREATE OR REPLACE FUNCTION public.set_order_token()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  token_data RECORD;
BEGIN
  -- Only generate token for guest orders (user_id IS NULL)
  IF NEW.user_id IS NULL AND NEW.order_token IS NULL THEN
    SELECT token, expires_at INTO token_data 
    FROM public.generate_secure_order_token();
    
    NEW.order_token = token_data.token;
    NEW.order_token_expires_at = token_data.expires_at;
  END IF;
  RETURN NEW;
END;
$function$;

-- Create rate limiting function for guest order access
CREATE OR REPLACE FUNCTION public.check_guest_order_access_rate_limit(client_ip TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  access_count INTEGER;
  ip_address TEXT;
BEGIN
  -- Use provided IP or try to get from headers (fallback for testing)
  ip_address := COALESCE(client_ip, '0.0.0.0');
  
  -- Count failed access attempts in the last 15 minutes from this IP
  SELECT COUNT(*)
  INTO access_count
  FROM public.guest_order_access_log
  WHERE access_ip = ip_address
    AND access_timestamp > now() - interval '15 minutes'
    AND access_granted = false;
  
  -- Allow access if less than 10 failed attempts
  RETURN access_count < 10;
END;
$function$;

-- Create secure guest order verification function with logging
CREATE OR REPLACE FUNCTION public.verify_guest_order_access_secure(
  order_id_param UUID, 
  order_token_param TEXT,
  client_ip TEXT DEFAULT NULL,
  user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  order_exists BOOLEAN := false;
  token_valid BOOLEAN := false;
  rate_limit_ok BOOLEAN := false;
  ip_address TEXT;
BEGIN
  -- Set default IP if not provided
  ip_address := COALESCE(client_ip, '0.0.0.0');
  
  -- Check rate limiting first
  rate_limit_ok := public.check_guest_order_access_rate_limit(ip_address);
  
  IF NOT rate_limit_ok THEN
    -- Log rate limit violation
    INSERT INTO public.guest_order_access_log (
      order_id, order_token, access_ip, access_user_agent, 
      access_granted, failure_reason
    ) VALUES (
      order_id_param, order_token_param, ip_address, user_agent,
      false, 'Rate limit exceeded'
    );
    RETURN false;
  END IF;
  
  -- Validate inputs
  IF order_id_param IS NULL OR order_token_param IS NULL OR order_token_param = '' THEN
    INSERT INTO public.guest_order_access_log (
      order_id, order_token, access_ip, access_user_agent, 
      access_granted, failure_reason
    ) VALUES (
      order_id_param, order_token_param, ip_address, user_agent,
      false, 'Invalid parameters'
    );
    RETURN false;
  END IF;

  -- Check if the order exists with valid token and hasn't expired
  SELECT EXISTS(
    SELECT 1 
    FROM public.orders 
    WHERE id = order_id_param 
      AND order_token = order_token_param 
      AND user_id IS NULL
      AND (order_token_expires_at IS NULL OR order_token_expires_at > now())
  ) INTO token_valid;
  
  -- Log the access attempt
  INSERT INTO public.guest_order_access_log (
    order_id, order_token, access_ip, access_user_agent, 
    access_granted, failure_reason
  ) VALUES (
    order_id_param, order_token_param, ip_address, user_agent,
    token_valid, CASE WHEN NOT token_valid THEN 'Invalid or expired token' ELSE NULL END
  );
  
  RETURN token_valid;
END;
$function$;

-- Update the guest order access policy to use enhanced verification
DROP POLICY IF EXISTS "Guest orders accessible with valid token" ON public.orders;

CREATE POLICY "Guest orders accessible with secure token verification" 
ON public.orders 
FOR SELECT 
USING (
  user_id IS NULL 
  AND order_token IS NOT NULL 
  AND order_token = current_setting('app.current_order_token'::text, true)
  AND (order_token_expires_at IS NULL OR order_token_expires_at > now())
);

-- Create function to clean up expired tokens and old audit logs
CREATE OR REPLACE FUNCTION public.cleanup_expired_guest_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Clear expired tokens from orders
  UPDATE public.orders 
  SET order_token = NULL, order_token_expires_at = NULL
  WHERE order_token_expires_at < now();
  
  -- Clean up old audit logs (keep for 90 days)
  DELETE FROM public.guest_order_access_log 
  WHERE access_timestamp < now() - interval '90 days';
END;
$function$;