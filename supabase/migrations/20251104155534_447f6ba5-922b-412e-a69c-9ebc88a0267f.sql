-- Fix existing users with incorrect token limits
UPDATE public.profiles 
SET ai_tokens_limit = GREATEST(ai_tokens_limit, ai_tokens_balance)
WHERE ai_tokens_balance > ai_tokens_limit;

-- The grant_tokens_atomic function already handles this correctly with:
-- ai_tokens_limit = GREATEST(ai_tokens_limit, v_new_ai_tokens)
-- But let's verify video_results_limit is also tracked

-- Add video_results_limit column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'video_results_limit'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN video_results_limit INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Update existing video results limits to match balance
UPDATE public.profiles 
SET video_results_limit = GREATEST(video_results_limit, video_results_balance)
WHERE video_results_balance > video_results_limit;

-- Update grant_tokens_atomic to also update video_results_limit
CREATE OR REPLACE FUNCTION public.grant_tokens_atomic(
  p_user_id uuid, 
  p_ai_tokens integer, 
  p_video_results integer, 
  p_source text, 
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_old_ai_tokens integer;
  v_old_video_results integer;
  v_new_ai_tokens integer;
  v_new_video_results integer;
BEGIN
  -- Get current balances
  SELECT ai_tokens_balance, video_results_balance
  INTO v_old_ai_tokens, v_old_video_results
  FROM public.profiles
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Calculate new balances
  v_new_ai_tokens := v_old_ai_tokens + p_ai_tokens;
  v_new_video_results := v_old_video_results + p_video_results;

  -- Update tokens atomically AND update limits
  UPDATE public.profiles
  SET 
    ai_tokens_balance = v_new_ai_tokens,
    ai_tokens_limit = GREATEST(ai_tokens_limit, v_new_ai_tokens),
    video_results_balance = v_new_video_results,
    video_results_limit = GREATEST(video_results_limit, v_new_video_results),
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Log AI tokens if changed
  IF p_ai_tokens != 0 THEN
    INSERT INTO public.token_audit_log (
      user_id, action, token_type, amount, 
      balance_before, balance_after, source, metadata
    ) VALUES (
      p_user_id, 'grant', 'ai_tokens', p_ai_tokens,
      v_old_ai_tokens, v_new_ai_tokens, p_source, p_metadata
    );
  END IF;

  -- Log video results if changed
  IF p_video_results != 0 THEN
    INSERT INTO public.token_audit_log (
      user_id, action, token_type, amount,
      balance_before, balance_after, source, metadata
    ) VALUES (
      p_user_id, 'grant', 'video_results', p_video_results,
      v_old_video_results, v_new_video_results, p_source, p_metadata
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'ai_tokens_balance', v_new_ai_tokens,
    'ai_tokens_limit', GREATEST((SELECT ai_tokens_limit FROM public.profiles WHERE user_id = p_user_id), v_new_ai_tokens),
    'video_results_balance', v_new_video_results,
    'video_results_limit', GREATEST((SELECT video_results_limit FROM public.profiles WHERE user_id = p_user_id), v_new_video_results)
  );
END;
$function$;