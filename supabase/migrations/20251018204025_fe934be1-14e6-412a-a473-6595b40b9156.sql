-- Update basic/free plan to have 2 AI tokens and 0 sample files
UPDATE subscription_plans
SET 
  initial_ai_tokens = 2,
  max_files = 0,
  updated_at = now()
WHERE name ILIKE '%free%' OR name ILIKE '%basic%' OR display_order = 0;