-- Admin function to fix user token balances
CREATE OR REPLACE FUNCTION public.admin_fix_user_tokens(
  p_user_id uuid,
  p_ai_tokens_balance integer,
  p_ai_tokens_limit integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    ai_tokens_balance = p_ai_tokens_balance,
    ai_tokens_limit = p_ai_tokens_limit,
    updated_at = now()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User tokens updated successfully'
  );
END;
$$;

-- Fix the specific user's tokens
SELECT admin_fix_user_tokens(
  '57706c7d-4724-4924-9cc6-c858e7e52171'::uuid,
  1, -- balance: they used 1, so 2-1=1 remaining
  2  -- limit: correct default
);