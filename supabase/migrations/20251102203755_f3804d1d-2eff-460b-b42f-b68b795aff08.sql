-- Drop existing function and recreate with correct signature
DROP FUNCTION IF EXISTS public.check_application_eligibility(uuid);

-- Create function to check if user is eligible to submit career application
-- User must have used at least 1 AI token to be eligible
CREATE OR REPLACE FUNCTION public.check_application_eligibility(p_user_id uuid)
RETURNS TABLE(
  has_used_token boolean,
  used_count integer,
  remaining_tokens integer,
  eligible boolean,
  reason text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_ai_tokens_used integer;
  v_video_results_used integer;
  v_total_used integer;
  v_ai_tokens_balance integer;
  v_video_results_balance integer;
  v_total_remaining integer;
BEGIN
  -- Get user's token usage
  SELECT 
    COALESCE(ai_tokens_used, 0),
    COALESCE(video_results_used, 0),
    COALESCE(ai_tokens_balance, 0),
    COALESCE(video_results_balance, 0)
  INTO 
    v_ai_tokens_used,
    v_video_results_used,
    v_ai_tokens_balance,
    v_video_results_balance
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  -- If user profile not found, return not eligible
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      false as has_used_token,
      0 as used_count,
      0 as remaining_tokens,
      false as eligible,
      'User profile not found'::text as reason;
    RETURN;
  END IF;
  
  v_total_used := v_ai_tokens_used + v_video_results_used;
  v_total_remaining := v_ai_tokens_balance + v_video_results_balance;
  
  -- User is eligible if they have used at least 1 token (AI or video)
  IF v_total_used >= 1 THEN
    RETURN QUERY SELECT 
      true as has_used_token,
      v_total_used as used_count,
      v_total_remaining as remaining_tokens,
      true as eligible,
      'Eligible to apply'::text as reason;
  ELSE
    RETURN QUERY SELECT 
      false as has_used_token,
      v_total_used as used_count,
      v_total_remaining as remaining_tokens,
      false as eligible,
      'Must use at least 1 AI token before applying'::text as reason;
  END IF;
END;
$$;