-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  billing_period TEXT NOT NULL DEFAULT 'monthly',
  initial_ai_tokens INTEGER NOT NULL DEFAULT 0,
  video_seconds INTEGER NOT NULL DEFAULT 0,
  file_access_tier TEXT NOT NULL,
  max_files INTEGER NOT NULL DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ai_edit_samples table
CREATE TABLE IF NOT EXISTS public.ai_edit_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  before_image_url TEXT NOT NULL,
  after_image_url TEXT NOT NULL,
  prompt_used TEXT,
  category TEXT NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Modify products table - add subscription tier fields
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS subscription_tier_required TEXT,
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS max_subscription_tier TEXT;

-- Modify profiles table - update token tracking
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS ai_tokens_balance INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS free_tokens_claimed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS video_seconds_used INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_seconds_balance INTEGER DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_edit_samples ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read, admin write)
CREATE POLICY "Anyone can view active subscription plans"
ON public.subscription_plans
FOR SELECT
USING (is_active = true);

CREATE POLICY "Only admins can manage subscription plans"
ON public.subscription_plans
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- RLS Policies for user_subscriptions (users see their own, admins see all)
CREATE POLICY "Users can view their own subscriptions"
ON public.user_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
ON public.user_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
ON public.user_subscriptions
FOR SELECT
USING (current_user_is_admin());

CREATE POLICY "Admins can manage all subscriptions"
ON public.user_subscriptions
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- RLS Policies for ai_edit_samples (public read, admin write)
CREATE POLICY "Anyone can view AI edit samples"
ON public.ai_edit_samples
FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage AI edit samples"
ON public.ai_edit_samples
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Database function: Get user's current token balance
CREATE OR REPLACE FUNCTION public.get_user_token_balance(p_user_id UUID)
RETURNS TABLE(
  ai_tokens INTEGER,
  video_seconds INTEGER,
  free_tokens_claimed BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(p.ai_tokens_balance, 0) as ai_tokens,
    COALESCE(p.video_seconds_balance, 0) as video_seconds,
    COALESCE(p.free_tokens_claimed, false) as free_tokens_claimed
  FROM public.profiles p
  WHERE p.user_id = p_user_id;
END;
$$;

-- Database function: Deduct AI tokens
CREATE OR REPLACE FUNCTION public.deduct_ai_tokens(p_user_id UUID, p_amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT ai_tokens_balance INTO current_balance
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  -- Check if user has enough tokens
  IF current_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct tokens
  UPDATE public.profiles
  SET 
    ai_tokens_balance = ai_tokens_balance - p_amount,
    ai_tokens_used = ai_tokens_used + p_amount,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$;

-- Database function: Deduct video seconds
CREATE OR REPLACE FUNCTION public.deduct_video_seconds(p_user_id UUID, p_seconds INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT video_seconds_balance INTO current_balance
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  -- Check if user has enough seconds
  IF current_balance < p_seconds THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct seconds
  UPDATE public.profiles
  SET 
    video_seconds_balance = video_seconds_balance - p_seconds,
    video_seconds_used = video_seconds_used + p_seconds,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$;

-- Database function: Grant 5 free tokens (one-time)
CREATE OR REPLACE FUNCTION public.grant_free_tokens(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  already_claimed BOOLEAN;
BEGIN
  -- Check if user already claimed free tokens
  SELECT free_tokens_claimed INTO already_claimed
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  IF already_claimed THEN
    RETURN FALSE;
  END IF;
  
  -- Grant 5 free tokens
  UPDATE public.profiles
  SET 
    ai_tokens_balance = ai_tokens_balance + 5,
    free_tokens_claimed = true,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$;

-- Database function: Check if user can access a file
CREATE OR REPLACE FUNCTION public.check_file_access(p_user_id UUID, p_product_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  required_tier TEXT;
  user_tier TEXT;
BEGIN
  -- Get the required tier for the product
  SELECT subscription_tier_required INTO required_tier
  FROM public.products
  WHERE id = p_product_id;
  
  -- If no tier required (legacy product), allow access
  IF required_tier IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Get user's current subscription tier
  SELECT sp.file_access_tier INTO user_tier
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
    AND us.status = 'active'
    AND us.current_period_end > now()
  ORDER BY sp.display_order DESC
  LIMIT 1;
  
  -- If user has no subscription, deny access
  IF user_tier IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check tier hierarchy: sample < basic < standard < premium
  RETURN CASE
    WHEN required_tier = 'sample' THEN TRUE
    WHEN required_tier = 'basic' THEN user_tier IN ('basic', 'standard', 'premium')
    WHEN required_tier = 'standard' THEN user_tier IN ('standard', 'premium')
    WHEN required_tier = 'premium' THEN user_tier = 'premium'
    ELSE FALSE
  END;
END;
$$;

-- Database function: Get user's active subscription
CREATE OR REPLACE FUNCTION public.get_active_subscription(p_user_id UUID)
RETURNS TABLE(
  subscription_id UUID,
  plan_id UUID,
  plan_name TEXT,
  plan_price NUMERIC,
  file_access_tier TEXT,
  ai_tokens_included INTEGER,
  video_seconds_included INTEGER,
  status TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.id as subscription_id,
    sp.id as plan_id,
    sp.name as plan_name,
    sp.price as plan_price,
    sp.file_access_tier,
    sp.initial_ai_tokens as ai_tokens_included,
    sp.video_seconds as video_seconds_included,
    us.status,
    us.current_period_end
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
    AND us.status = 'active'
    AND us.current_period_end > now()
  ORDER BY sp.display_order DESC
  LIMIT 1;
END;
$$;

-- Insert seed data for subscription plans
INSERT INTO public.subscription_plans (name, description, price, billing_period, initial_ai_tokens, video_seconds, file_access_tier, max_files, features, is_active, is_featured, display_order)
VALUES
  (
    'Free AI Trial',
    'Try AI editing before subscribing',
    0.00,
    'one_time',
    5,
    0,
    'sample',
    1,
    '["1 sample stand file", "5 free AI tokens", "Basic image editing", "Community support"]'::jsonb,
    true,
    false,
    1
  ),
  (
    'Starter AI Pack',
    'Ideal for quick creative tasks',
    9.90,
    'monthly',
    15,
    0,
    'basic',
    2,
    '["2 editable files", "15 AI image edits", "All file formats (SKP, 3DS, PDF)", "Commercial license", "Email support"]'::jsonb,
    true,
    false,
    2
  ),
  (
    'Pro AI Pack',
    'Best for freelancers & studios',
    12.90,
    'monthly',
    20,
    5,
    'standard',
    3,
    '["3 editable files", "20 AI image edits", "5 seconds AI video", "All file formats", "Commercial license", "Priority support", "New designs monthly"]'::jsonb,
    true,
    true,
    3
  ),
  (
    'Studio AI Pack',
    'For agencies & full presentations',
    15.90,
    'monthly',
    30,
    10,
    'premium',
    3,
    '["3 premium files", "30 AI image edits", "10 seconds AI video", "All file formats", "Commercial license", "Priority support", "New designs monthly", "Custom requests"]'::jsonb,
    true,
    false,
    4
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_period_end ON public.user_subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_products_subscription_tier ON public.products(subscription_tier_required);
CREATE INDEX IF NOT EXISTS idx_ai_edit_samples_category ON public.ai_edit_samples(category);
CREATE INDEX IF NOT EXISTS idx_ai_edit_samples_featured ON public.ai_edit_samples(is_featured);