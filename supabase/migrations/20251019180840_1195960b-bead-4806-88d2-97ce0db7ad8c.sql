-- Create token reservations table
CREATE TABLE IF NOT EXISTS public.token_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  service_type TEXT NOT NULL,
  tokens_amount INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('reserved', 'committed', 'rolled_back')),
  ai_result_url TEXT,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '10 minutes'
);

-- Create index for faster lookups
CREATE INDEX idx_token_reservations_user_id ON public.token_reservations(user_id);
CREATE INDEX idx_token_reservations_status ON public.token_reservations(status);
CREATE INDEX idx_token_reservations_expires_at ON public.token_reservations(expires_at);

-- Enable RLS
ALTER TABLE public.token_reservations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own reservations"
  ON public.token_reservations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all reservations"
  ON public.token_reservations FOR ALL
  USING (auth.role() = 'service_role');

-- Create transaction log table
CREATE TABLE IF NOT EXISTS public.token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  reservation_id UUID REFERENCES public.token_reservations(id),
  transaction_type TEXT NOT NULL,
  tokens_amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index
CREATE INDEX idx_token_transactions_user_id ON public.token_transactions(user_id);
CREATE INDEX idx_token_transactions_reservation_id ON public.token_transactions(reservation_id);

-- Enable RLS
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own transactions"
  ON public.token_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all transactions"
  ON public.token_transactions FOR ALL
  USING (auth.role() = 'service_role');

-- Add reserved_tokens column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS reserved_tokens INTEGER NOT NULL DEFAULT 0;

-- Function to clean up expired reservations
CREATE OR REPLACE FUNCTION public.cleanup_expired_reservations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Rollback expired reservations
  UPDATE public.profiles p
  SET 
    ai_tokens_balance = ai_tokens_balance + r.tokens_amount,
    reserved_tokens = reserved_tokens - r.tokens_amount,
    updated_at = now()
  FROM public.token_reservations r
  WHERE r.user_id = p.user_id
    AND r.status = 'reserved'
    AND r.expires_at < now();
  
  -- Mark them as rolled back
  UPDATE public.token_reservations
  SET 
    status = 'rolled_back',
    failure_reason = 'Reservation expired',
    updated_at = now()
  WHERE status = 'reserved'
    AND expires_at < now();
END;
$$;

-- Function to reserve tokens atomically
CREATE OR REPLACE FUNCTION public.reserve_tokens_atomic(
  p_user_id UUID,
  p_service_type TEXT,
  p_tokens_amount INTEGER
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_available_balance INTEGER;
  v_reservation_id UUID;
  v_new_balance INTEGER;
BEGIN
  -- Clean up expired reservations first
  PERFORM public.cleanup_expired_reservations();
  
  -- Get available balance (total - reserved)
  SELECT ai_tokens_balance - reserved_tokens
  INTO v_available_balance
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User profile not found',
      'status', 404
    );
  END IF;
  
  -- Check if user has enough available tokens
  IF v_available_balance < p_tokens_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient tokens',
      'status', 403,
      'availableBalance', v_available_balance,
      'required', p_tokens_amount
    );
  END IF;
  
  -- Create reservation
  INSERT INTO public.token_reservations (
    user_id,
    service_type,
    tokens_amount,
    status
  ) VALUES (
    p_user_id,
    p_service_type,
    p_tokens_amount,
    'reserved'
  )
  RETURNING id INTO v_reservation_id;
  
  -- Update reserved tokens count
  UPDATE public.profiles
  SET 
    reserved_tokens = reserved_tokens + p_tokens_amount,
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING ai_tokens_balance - reserved_tokens INTO v_new_balance;
  
  -- Log transaction
  INSERT INTO public.token_transactions (
    user_id,
    reservation_id,
    transaction_type,
    tokens_amount,
    balance_after
  ) VALUES (
    p_user_id,
    v_reservation_id,
    'reserve',
    p_tokens_amount,
    v_new_balance
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'reservationId', v_reservation_id,
    'newBalance', v_new_balance
  );
END;
$$;

-- Function to commit reservation
CREATE OR REPLACE FUNCTION public.commit_reservation_atomic(
  p_reservation_id UUID,
  p_user_id UUID,
  p_ai_result_url TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reservation RECORD;
  v_new_balance INTEGER;
BEGIN
  -- Get reservation
  SELECT * INTO v_reservation
  FROM public.token_reservations
  WHERE id = p_reservation_id
    AND user_id = p_user_id
    AND status = 'reserved';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Reservation not found or already processed',
      'status', 404
    );
  END IF;
  
  -- Commit the reservation
  UPDATE public.token_reservations
  SET 
    status = 'committed',
    ai_result_url = p_ai_result_url,
    updated_at = now()
  WHERE id = p_reservation_id;
  
  -- Deduct from balance and unreserve
  UPDATE public.profiles
  SET 
    ai_tokens_balance = ai_tokens_balance - v_reservation.tokens_amount,
    ai_tokens_used = ai_tokens_used + v_reservation.tokens_amount,
    reserved_tokens = reserved_tokens - v_reservation.tokens_amount,
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING ai_tokens_balance - reserved_tokens INTO v_new_balance;
  
  -- Log transaction
  INSERT INTO public.token_transactions (
    user_id,
    reservation_id,
    transaction_type,
    tokens_amount,
    balance_after
  ) VALUES (
    p_user_id,
    p_reservation_id,
    'commit',
    v_reservation.tokens_amount,
    v_new_balance
  );
  
  -- Store in generation history
  INSERT INTO public.ai_generation_history (
    user_id,
    service_type,
    output_image_url,
    tokens_used,
    prompt
  ) VALUES (
    p_user_id,
    v_reservation.service_type,
    p_ai_result_url,
    v_reservation.tokens_amount,
    'Generated via reservation system'
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'newBalance', v_new_balance
  );
END;
$$;

-- Function to rollback reservation
CREATE OR REPLACE FUNCTION public.rollback_reservation_atomic(
  p_reservation_id UUID,
  p_user_id UUID,
  p_reason TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reservation RECORD;
  v_new_balance INTEGER;
BEGIN
  -- Get reservation
  SELECT * INTO v_reservation
  FROM public.token_reservations
  WHERE id = p_reservation_id
    AND user_id = p_user_id
    AND status = 'reserved';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Reservation not found or already processed',
      'status', 404
    );
  END IF;
  
  -- Mark as rolled back
  UPDATE public.token_reservations
  SET 
    status = 'rolled_back',
    failure_reason = p_reason,
    updated_at = now()
  WHERE id = p_reservation_id;
  
  -- Unreserve tokens (refund)
  UPDATE public.profiles
  SET 
    reserved_tokens = reserved_tokens - v_reservation.tokens_amount,
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING ai_tokens_balance - reserved_tokens INTO v_new_balance;
  
  -- Log transaction
  INSERT INTO public.token_transactions (
    user_id,
    reservation_id,
    transaction_type,
    tokens_amount,
    balance_after
  ) VALUES (
    p_user_id,
    p_reservation_id,
    'rollback',
    v_reservation.tokens_amount,
    v_new_balance
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'newBalance', v_new_balance
  );
END;
$$;