-- Fix security warnings for database functions by setting search_path

-- Fix cleanup_expired_otps function
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.otp_registrations 
  WHERE expires_at < now() - interval '1 hour';
END;
$function$;

-- Fix has_role function  
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE 
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update OTP expiry settings to reduce expiry time (fix Auth OTP Long Expiry warning)
-- This updates any existing OTP registrations to have a shorter expiry time
UPDATE public.otp_registrations 
SET expires_at = created_at + interval '15 minutes'
WHERE expires_at > created_at + interval '15 minutes';