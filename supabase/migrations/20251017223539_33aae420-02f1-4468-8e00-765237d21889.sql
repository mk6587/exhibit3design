-- Update the free plan name to "Free Basic AI Pack"
UPDATE subscription_plans
SET name = 'Free Basic AI Pack'
WHERE price = 0 AND is_active = true;