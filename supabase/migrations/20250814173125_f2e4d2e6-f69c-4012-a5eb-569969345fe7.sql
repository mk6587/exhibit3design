-- Fix function search path security warnings

-- Update the generate_order_token function with proper search path
CREATE OR REPLACE FUNCTION public.generate_order_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$;

-- Update the set_order_token function with proper search path
CREATE OR REPLACE FUNCTION public.set_order_token()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only generate token for guest orders (user_id IS NULL)
  IF NEW.user_id IS NULL AND NEW.order_token IS NULL THEN
    NEW.order_token = public.generate_order_token();
  END IF;
  RETURN NEW;
END;
$$;