-- Update subscription plans to match new pricing structure

-- First, deactivate all existing plans
UPDATE public.subscription_plans 
SET is_active = false;

-- Insert the new Free AI Trial plan (free tier)
INSERT INTO public.subscription_plans (
  name,
  price,
  billing_period,
  description,
  features,
  initial_ai_tokens,
  video_results,
  max_files,
  file_access_tier,
  display_order,
  is_featured,
  is_active
) VALUES (
  'Free AI Trial',
  0,
  'monthly',
  'Try AI tools before subscribing',
  jsonb_build_array(
    '1 sample file access',
    '5 free AI tokens',
    'Try before you subscribe',
    'Basic AI features'
  ),
  5,  -- 5 AI tokens
  0,  -- 0 video results
  1,  -- 1 sample file
  'sample',
  1,
  false,
  true
);

-- Insert the Starter AI Pack
INSERT INTO public.subscription_plans (
  name,
  price,
  billing_period,
  description,
  features,
  initial_ai_tokens,
  video_results,
  max_files,
  file_access_tier,
  display_order,
  is_featured,
  is_active
) VALUES (
  'Starter AI Pack',
  9.90,
  'monthly',
  'For fast creative tasks',
  jsonb_build_array(
    '2 editable design files',
    '15 AI image edits per month',
    '1 video result per month',
    'Basic file access'
  ),
  15,  -- 15 AI tokens
  1,   -- 1 video result
  2,   -- 2 files
  'basic',
  2,
  false,
  true
);

-- Insert the Pro AI Pack (Best Value)
INSERT INTO public.subscription_plans (
  name,
  price,
  billing_period,
  description,
  features,
  initial_ai_tokens,
  video_results,
  max_files,
  file_access_tier,
  display_order,
  is_featured,
  is_active
) VALUES (
  'Pro AI Pack',
  12.90,
  'monthly',
  'Ideal for freelancers & studios',
  jsonb_build_array(
    '3 design files',
    '20 AI image edits per month',
    '3 video results per month',
    'Standard file access',
    'Best value for money'
  ),
  20,  -- 20 AI tokens
  3,   -- 3 video results
  3,   -- 3 files
  'standard',
  3,
  true,  -- Mark as featured
  true
);

-- Insert the Studio AI Pack
INSERT INTO public.subscription_plans (
  name,
  price,
  billing_period,
  description,
  features,
  initial_ai_tokens,
  video_results,
  max_files,
  file_access_tier,
  display_order,
  is_featured,
  is_active
) VALUES (
  'Studio AI Pack',
  15.90,
  'monthly',
  'Designed for agencies',
  jsonb_build_array(
    '3 premium design files',
    '30 AI image edits per month',
    '5 video results per month',
    'Premium file access',
    'Priority support'
  ),
  30,  -- 30 AI tokens
  5,   -- 5 video results
  3,   -- 3 premium files
  'premium',
  4,
  false,
  true
);