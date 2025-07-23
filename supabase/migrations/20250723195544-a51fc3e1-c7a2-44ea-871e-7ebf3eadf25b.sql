-- Fix OTP expiry issue by updating the cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.otp_registrations 
  WHERE expires_at < now();
END;
$function$;

-- Update existing OTP registrations to have shorter expiry (15 minutes max)
UPDATE public.otp_registrations 
SET expires_at = LEAST(expires_at, created_at + interval '15 minutes')
WHERE expires_at > created_at + interval '15 minutes';