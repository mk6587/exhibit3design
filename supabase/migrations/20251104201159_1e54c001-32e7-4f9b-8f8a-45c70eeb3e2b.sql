-- Create a security definer function to fetch user profile
-- This bypasses RLS timing issues after OAuth login
CREATE OR REPLACE FUNCTION public.get_user_profile(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  email text,
  first_name text,
  last_name text,
  country text,
  city text,
  phone_number text,
  address_line_1 text,
  state_region text,
  postcode text,
  email_confirmed boolean,
  ai_tokens_used integer,
  ai_tokens_limit integer,
  ai_tokens_balance integer,
  reserved_tokens integer,
  free_tokens_claimed boolean,
  video_results_used integer,
  video_results_balance integer,
  video_results_limit integer,
  selected_files jsonb,
  is_active boolean,
  deactivated_at timestamp with time zone,
  deactivation_reason text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow users to fetch their own profile
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot fetch other users profiles';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.email,
    p.first_name,
    p.last_name,
    p.country,
    p.city,
    p.phone_number,
    p.address_line_1,
    p.state_region,
    p.postcode,
    p.email_confirmed,
    p.ai_tokens_used,
    p.ai_tokens_limit,
    p.ai_tokens_balance,
    p.reserved_tokens,
    p.free_tokens_claimed,
    p.video_results_used,
    p.video_results_balance,
    p.video_results_limit,
    p.selected_files,
    p.is_active,
    p.deactivated_at,
    p.deactivation_reason,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.user_id = p_user_id;
END;
$$;