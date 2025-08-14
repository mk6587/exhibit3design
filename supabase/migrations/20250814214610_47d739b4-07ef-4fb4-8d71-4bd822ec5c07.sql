-- Instead of trying to decrypt hashed data, let's create a temporary storage system
-- for guest checkout data that can be transferred to user profiles

-- Create a secure temporary table for guest checkout sessions
CREATE TABLE IF NOT EXISTS public.guest_checkout_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT NOT NULL UNIQUE,
  customer_first_name TEXT,
  customer_last_name TEXT,
  customer_email TEXT,
  customer_mobile TEXT,
  customer_address TEXT,
  customer_city TEXT,
  customer_postal_code TEXT,
  customer_country TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Enable RLS on the temporary session table
ALTER TABLE public.guest_checkout_sessions ENABLE ROW LEVEL SECURITY;

-- Only service role can manage guest sessions
CREATE POLICY "Service role can manage guest sessions" 
ON public.guest_checkout_sessions 
FOR ALL 
USING (auth.role() = 'service_role');

-- Function to store guest checkout data in session
CREATE OR REPLACE FUNCTION public.store_guest_checkout_session(
  p_session_token TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_email TEXT,
  p_mobile TEXT,
  p_address TEXT,
  p_city TEXT,
  p_postal_code TEXT,
  p_country TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Clean up expired sessions first
  DELETE FROM public.guest_checkout_sessions 
  WHERE expires_at < now();
  
  -- Store the guest data temporarily (unencrypted for transfer)
  INSERT INTO public.guest_checkout_sessions (
    session_token,
    customer_first_name,
    customer_last_name,
    customer_email,
    customer_mobile,
    customer_address,
    customer_city,
    customer_postal_code,
    customer_country
  ) VALUES (
    p_session_token,
    p_first_name,
    p_last_name,
    p_email,
    p_mobile,
    p_address,
    p_city,
    p_postal_code,
    p_country
  )
  ON CONFLICT (session_token) 
  DO UPDATE SET
    customer_first_name = EXCLUDED.customer_first_name,
    customer_last_name = EXCLUDED.customer_last_name,
    customer_email = EXCLUDED.customer_email,
    customer_mobile = EXCLUDED.customer_mobile,
    customer_address = EXCLUDED.customer_address,
    customer_city = EXCLUDED.customer_city,
    customer_postal_code = EXCLUDED.customer_postal_code,
    customer_country = EXCLUDED.customer_country,
    expires_at = now() + interval '24 hours';
    
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$function$;

-- Function to transfer guest session data to user profile
CREATE OR REPLACE FUNCTION public.transfer_guest_session_to_profile(
  p_user_id UUID,
  p_session_token TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  guest_data RECORD;
BEGIN
  -- Get the guest session data
  SELECT * INTO guest_data
  FROM public.guest_checkout_sessions
  WHERE session_token = p_session_token
    AND expires_at > now()
  LIMIT 1;
  
  -- If no valid session found, return false
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update or insert the user profile with guest data
  INSERT INTO public.profiles (
    user_id,
    first_name,
    last_name,
    phone_number,
    address_line_1,
    city,
    postcode,
    country
  ) VALUES (
    p_user_id,
    guest_data.customer_first_name,
    guest_data.customer_last_name,
    guest_data.customer_mobile,
    guest_data.customer_address,
    guest_data.customer_city,
    guest_data.customer_postal_code,
    guest_data.customer_country
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
    phone_number = COALESCE(EXCLUDED.phone_number, profiles.phone_number),
    address_line_1 = COALESCE(EXCLUDED.address_line_1, profiles.address_line_1),
    city = COALESCE(EXCLUDED.city, profiles.city),
    postcode = COALESCE(EXCLUDED.postcode, profiles.postcode),
    country = COALESCE(EXCLUDED.country, profiles.country),
    updated_at = now();
  
  -- Clean up the session after successful transfer
  DELETE FROM public.guest_checkout_sessions 
  WHERE session_token = p_session_token;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$function$;

-- Function to cleanup expired guest sessions (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_guest_sessions()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.guest_checkout_sessions 
  WHERE expires_at < now();
END;
$function$;