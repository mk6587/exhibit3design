-- Update Free Basic AI Pack features
UPDATE subscription_plans
SET features = jsonb_build_array(
  '2 free AI tokens',
  'Test AI image editing',
  'No credit card required',
  'Perfect for trying AI features'
)
WHERE name = 'Free Basic AI Pack' AND display_order = 1;