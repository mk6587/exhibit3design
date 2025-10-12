-- ============================================
-- TOKEN SECURITY ENHANCEMENTS
-- Prevents users from exceeding token limits
-- ============================================

-- 1. Create audit log table for token changes
CREATE TABLE IF NOT EXISTS public.token_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL, -- 'grant', 'deduct', 'refund'
  token_type text NOT NULL, -- 'ai_tokens', 'video_results'
  amount integer NOT NULL,
  balance_before integer NOT NULL,
  balance_after integer NOT NULL,
  source text NOT NULL, -- 'subscription', 'purchase', 'usage', 'admin'
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on audit log
ALTER TABLE public.token_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins and the user themselves can view their audit log
CREATE POLICY "Users can view their own token audit log"
  ON public.token_audit_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all token audit logs"
  ON public.token_audit_log
  FOR SELECT
  USING (current_user_is_admin());

-- Only service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
  ON public.token_audit_log
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- 2. Create atomic token grant function (used by subscription activation)
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
SET search_path = public
AS $$
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

  -- Update tokens atomically
  UPDATE public.profiles
  SET 
    ai_tokens_balance = v_new_ai_tokens,
    ai_tokens_limit = GREATEST(ai_tokens_limit, v_new_ai_tokens),
    video_results_balance = v_new_video_results,
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
    'video_results_balance', v_new_video_results
  );
END;
$$;

-- 3. Create atomic token deduction function (prevents race conditions)
CREATE OR REPLACE FUNCTION public.deduct_tokens_atomic(
  p_user_id uuid,
  p_token_type text, -- 'ai_tokens' or 'video_results'
  p_amount integer,
  p_source text DEFAULT 'usage',
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_balance integer;
  v_new_balance integer;
  v_rows_affected integer;
BEGIN
  -- Atomic check-and-update in single query
  IF p_token_type = 'ai_tokens' THEN
    UPDATE public.profiles
    SET 
      ai_tokens_balance = ai_tokens_balance - p_amount,
      ai_tokens_used = ai_tokens_used + p_amount,
      updated_at = now()
    WHERE user_id = p_user_id
      AND ai_tokens_balance >= p_amount -- Atomic check
    RETURNING 
      ai_tokens_balance + p_amount, -- old balance
      ai_tokens_balance -- new balance
    INTO v_old_balance, v_new_balance;
  ELSIF p_token_type = 'video_results' THEN
    UPDATE public.profiles
    SET 
      video_results_balance = video_results_balance - p_amount,
      video_results_used = video_results_used + p_amount,
      updated_at = now()
    WHERE user_id = p_user_id
      AND video_results_balance >= p_amount -- Atomic check
    RETURNING 
      video_results_balance + p_amount, -- old balance
      video_results_balance -- new balance
    INTO v_old_balance, v_new_balance;
  ELSE
    RAISE EXCEPTION 'Invalid token type: %', p_token_type;
  END IF;

  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

  -- If no rows updated, insufficient balance
  IF v_rows_affected = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'insufficient_balance',
      'message', format('Insufficient %s balance', p_token_type)
    );
  END IF;

  -- Log the deduction
  INSERT INTO public.token_audit_log (
    user_id, action, token_type, amount,
    balance_before, balance_after, source, metadata
  ) VALUES (
    p_user_id, 'deduct', p_token_type, p_amount,
    v_old_balance, v_new_balance, p_source, p_metadata
  );

  RETURN jsonb_build_object(
    'success', true,
    'balance', v_new_balance
  );
END;
$$;

-- 4. Add index for audit log queries
CREATE INDEX IF NOT EXISTS idx_token_audit_log_user_created 
  ON public.token_audit_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_token_audit_log_token_type 
  ON public.token_audit_log(token_type, created_at DESC);