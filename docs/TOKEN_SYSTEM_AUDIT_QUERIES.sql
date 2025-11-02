-- ============================================================================
-- TOKEN SYSTEM AUDIT QUERIES
-- Use these queries to monitor and debug the token deduction system
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CHECK ALL USERS WITH INCONSISTENT TOKEN BALANCES
-- Finds users who have generation history but no token deductions
-- ----------------------------------------------------------------------------
SELECT 
  p.user_id,
  p.email,
  p.ai_tokens_balance,
  p.ai_tokens_used,
  p.reserved_tokens,
  COUNT(h.id) as generation_count,
  COUNT(tal.id) as deduction_count,
  COUNT(h.id) - COUNT(tal.id) as missing_deductions
FROM profiles p
LEFT JOIN ai_generation_history h ON h.user_id = p.user_id AND h.is_public_sample = false
LEFT JOIN token_audit_log tal ON tal.user_id = p.user_id 
  AND tal.action = 'deduct' 
  AND tal.token_type = 'ai_tokens'
GROUP BY p.user_id, p.email, p.ai_tokens_balance, p.ai_tokens_used, p.reserved_tokens
HAVING COUNT(h.id) > COUNT(tal.id)
ORDER BY missing_deductions DESC;

-- ----------------------------------------------------------------------------
-- 2. FIND ORPHANED GENERATIONS (NO CORRESPONDING DEDUCTION)
-- Generations that happened without token deduction
-- ----------------------------------------------------------------------------
SELECT 
  h.id as generation_id,
  h.user_id,
  h.created_at,
  h.service_type,
  h.tokens_used,
  h.prompt,
  h.output_image_url,
  p.ai_tokens_balance as current_balance,
  p.ai_tokens_used as current_used
FROM ai_generation_history h
JOIN profiles p ON h.user_id = p.user_id
WHERE h.is_public_sample = false
  AND NOT EXISTS (
    SELECT 1 FROM token_audit_log tal
    WHERE tal.user_id = h.user_id
      AND tal.action = 'deduct'
      AND tal.token_type = 'ai_tokens'
      AND tal.created_at >= h.created_at - interval '5 minutes'
      AND tal.created_at <= h.created_at + interval '5 minutes'
  )
  AND NOT EXISTS (
    SELECT 1 FROM token_reservations tr
    WHERE tr.user_id = h.user_id
      AND tr.status = 'committed'
      AND tr.created_at >= h.created_at - interval '5 minutes'
      AND tr.created_at <= h.created_at + interval '5 minutes'
  )
ORDER BY h.created_at DESC;

-- ----------------------------------------------------------------------------
-- 3. CHECK SPECIFIC USER'S COMPLETE TOKEN HISTORY
-- Replace 'USER_ID_HERE' with actual user ID
-- ----------------------------------------------------------------------------
SELECT 
  'Current Balance' as source,
  NULL as timestamp,
  ai_tokens_balance as balance,
  ai_tokens_used as used,
  reserved_tokens as reserved,
  ai_tokens_limit as limit,
  NULL as details
FROM profiles 
WHERE user_id = 'USER_ID_HERE'

UNION ALL

SELECT 
  'Audit Log' as source,
  created_at as timestamp,
  balance_after as balance,
  NULL as used,
  NULL as reserved,
  NULL as limit,
  jsonb_build_object(
    'action', action,
    'token_type', token_type,
    'amount', amount,
    'source', source,
    'metadata', metadata
  ) as details
FROM token_audit_log
WHERE user_id = 'USER_ID_HERE'

UNION ALL

SELECT 
  'Generation History' as source,
  created_at as timestamp,
  NULL as balance,
  tokens_used as used,
  NULL as reserved,
  NULL as limit,
  jsonb_build_object(
    'service_type', service_type,
    'prompt', prompt,
    'output_url', output_image_url
  ) as details
FROM ai_generation_history
WHERE user_id = 'USER_ID_HERE'

UNION ALL

SELECT 
  'Reservation' as source,
  created_at as timestamp,
  NULL as balance,
  tokens_amount as used,
  NULL as reserved,
  NULL as limit,
  jsonb_build_object(
    'status', status,
    'service_type', service_type,
    'failure_reason', failure_reason
  ) as details
FROM token_reservations
WHERE user_id = 'USER_ID_HERE'

ORDER BY timestamp DESC NULLS FIRST;

-- ----------------------------------------------------------------------------
-- 4. CHECK EXPIRED RESERVATIONS (SHOULD BE AUTO-CLEANED)
-- ----------------------------------------------------------------------------
SELECT 
  r.*,
  p.ai_tokens_balance,
  p.reserved_tokens,
  now() - r.expires_at as overdue_duration
FROM token_reservations r
JOIN profiles p ON r.user_id = p.user_id
WHERE r.status = 'reserved'
  AND r.expires_at < now()
ORDER BY r.expires_at;

-- ----------------------------------------------------------------------------
-- 5. CHECK ACTIVE RESERVATIONS
-- ----------------------------------------------------------------------------
SELECT 
  r.id,
  r.user_id,
  r.service_type,
  r.tokens_amount,
  r.created_at,
  r.expires_at,
  r.expires_at - now() as time_remaining,
  p.ai_tokens_balance,
  p.reserved_tokens
FROM token_reservations r
JOIN profiles p ON r.user_id = p.user_id
WHERE r.status = 'reserved'
  AND r.expires_at > now()
ORDER BY r.created_at DESC;

-- ----------------------------------------------------------------------------
-- 6. VERIFY TOKEN BALANCE INTEGRITY
-- Checks if ai_tokens_used + ai_tokens_balance = total tokens granted
-- ----------------------------------------------------------------------------
SELECT 
  p.user_id,
  p.email,
  p.ai_tokens_balance,
  p.ai_tokens_used,
  p.ai_tokens_limit,
  p.reserved_tokens,
  COALESCE(SUM(CASE WHEN tal.action = 'grant' THEN tal.amount ELSE 0 END), 0) as total_granted,
  COALESCE(SUM(CASE WHEN tal.action = 'deduct' THEN tal.amount ELSE 0 END), 0) as total_deducted,
  -- Verify formula: balance = granted - deducted
  (COALESCE(SUM(CASE WHEN tal.action = 'grant' THEN tal.amount ELSE 0 END), 0) - 
   COALESCE(SUM(CASE WHEN tal.action = 'deduct' THEN tal.amount ELSE 0 END), 0)) as calculated_balance,
  -- Check if it matches
  CASE 
    WHEN p.ai_tokens_balance = (
      COALESCE(SUM(CASE WHEN tal.action = 'grant' THEN tal.amount ELSE 0 END), 0) - 
      COALESCE(SUM(CASE WHEN tal.action = 'deduct' THEN tal.amount ELSE 0 END), 0)
    ) THEN '✓ CORRECT'
    ELSE '✗ MISMATCH'
  END as integrity_check
FROM profiles p
LEFT JOIN token_audit_log tal ON tal.user_id = p.user_id AND tal.token_type = 'ai_tokens'
GROUP BY p.user_id, p.email, p.ai_tokens_balance, p.ai_tokens_used, p.ai_tokens_limit, p.reserved_tokens
HAVING COUNT(tal.id) > 0
ORDER BY integrity_check DESC, p.created_at DESC;

-- ----------------------------------------------------------------------------
-- 7. FIND USERS WHO GENERATED WITHOUT SUBSCRIPTION
-- Users who used tokens but don't have an active subscription
-- ----------------------------------------------------------------------------
SELECT 
  p.user_id,
  p.email,
  p.ai_tokens_used,
  p.ai_tokens_balance,
  COUNT(h.id) as generation_count,
  MAX(h.created_at) as last_generation
FROM profiles p
LEFT JOIN ai_generation_history h ON h.user_id = p.user_id AND h.is_public_sample = false
LEFT JOIN user_subscriptions us ON us.user_id = p.user_id 
  AND us.status = 'active' 
  AND us.current_period_end > now()
WHERE h.id IS NOT NULL
  AND us.id IS NULL
GROUP BY p.user_id, p.email, p.ai_tokens_used, p.ai_tokens_balance
ORDER BY generation_count DESC;

-- ----------------------------------------------------------------------------
-- 8. SUBSCRIPTION TOKENS GRANTED VERIFICATION
-- Check if users received tokens when subscription was activated
-- ----------------------------------------------------------------------------
SELECT 
  us.user_id,
  p.email,
  sp.name as plan_name,
  sp.initial_ai_tokens as should_have_received,
  us.created_at as subscription_start,
  tal.created_at as token_grant_time,
  tal.amount as tokens_granted,
  CASE 
    WHEN tal.amount = sp.initial_ai_tokens THEN '✓ CORRECT'
    WHEN tal.amount IS NULL THEN '✗ NO GRANT'
    ELSE '✗ WRONG AMOUNT'
  END as grant_check
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
JOIN profiles p ON us.user_id = p.user_id
LEFT JOIN token_audit_log tal ON tal.user_id = us.user_id
  AND tal.action = 'grant'
  AND tal.source = 'subscription_activation'
  AND tal.created_at >= us.created_at - interval '1 minute'
  AND tal.created_at <= us.created_at + interval '5 minutes'
WHERE us.created_at > now() - interval '30 days'
ORDER BY us.created_at DESC;

-- ----------------------------------------------------------------------------
-- 9. DAILY TOKEN USAGE STATISTICS
-- ----------------------------------------------------------------------------
SELECT 
  DATE(tal.created_at) as date,
  COUNT(DISTINCT tal.user_id) as unique_users,
  SUM(CASE WHEN tal.action = 'deduct' THEN tal.amount ELSE 0 END) as tokens_used,
  SUM(CASE WHEN tal.action = 'grant' THEN tal.amount ELSE 0 END) as tokens_granted,
  COUNT(CASE WHEN tal.action = 'deduct' THEN 1 END) as deduction_count,
  COUNT(CASE WHEN tal.action = 'grant' THEN 1 END) as grant_count
FROM token_audit_log tal
WHERE tal.token_type = 'ai_tokens'
  AND tal.created_at > now() - interval '30 days'
GROUP BY DATE(tal.created_at)
ORDER BY date DESC;

-- ----------------------------------------------------------------------------
-- 10. DETECT DOUBLE DEDUCTIONS
-- Find cases where tokens were deducted twice for the same generation
-- ----------------------------------------------------------------------------
SELECT 
  h.user_id,
  h.created_at as generation_time,
  h.service_type,
  COUNT(tal.id) as deduction_count,
  array_agg(tal.amount) as deduction_amounts,
  array_agg(tal.created_at) as deduction_times
FROM ai_generation_history h
JOIN token_audit_log tal ON tal.user_id = h.user_id
  AND tal.action = 'deduct'
  AND tal.token_type = 'ai_tokens'
  AND tal.created_at >= h.created_at - interval '5 minutes'
  AND tal.created_at <= h.created_at + interval '5 minutes'
WHERE h.is_public_sample = false
GROUP BY h.user_id, h.created_at, h.service_type
HAVING COUNT(tal.id) > 1
ORDER BY h.created_at DESC;

-- ----------------------------------------------------------------------------
-- 11. CHECK RESERVATION CLEANUP EFFECTIVENESS
-- Verify that expired reservations are being cleaned up
-- ----------------------------------------------------------------------------
SELECT 
  'Total Reservations' as metric,
  COUNT(*) as count
FROM token_reservations

UNION ALL

SELECT 
  'Reserved (Active)' as metric,
  COUNT(*) as count
FROM token_reservations
WHERE status = 'reserved' AND expires_at > now()

UNION ALL

SELECT 
  'Reserved (Expired - SHOULD BE 0)' as metric,
  COUNT(*) as count
FROM token_reservations
WHERE status = 'reserved' AND expires_at < now()

UNION ALL

SELECT 
  'Committed' as metric,
  COUNT(*) as count
FROM token_reservations
WHERE status = 'committed'

UNION ALL

SELECT 
  'Rolled Back' as metric,
  COUNT(*) as count
FROM token_reservations
WHERE status = 'rolled_back';

-- ----------------------------------------------------------------------------
-- 12. COMPREHENSIVE USER TOKEN REPORT
-- Complete overview of a specific user's token situation
-- Usage: Replace 'mohammadk.digikala@gmail.com' with the user's email
-- ----------------------------------------------------------------------------
WITH user_info AS (
  SELECT user_id FROM profiles WHERE email = 'mohammadk.digikala@gmail.com'
)
SELECT 
  'PROFILE' as section,
  json_build_object(
    'ai_tokens_balance', p.ai_tokens_balance,
    'ai_tokens_used', p.ai_tokens_used,
    'ai_tokens_limit', p.ai_tokens_limit,
    'reserved_tokens', p.reserved_tokens,
    'available_balance', p.ai_tokens_balance - p.reserved_tokens,
    'video_results_balance', p.video_results_balance,
    'free_tokens_claimed', p.free_tokens_claimed
  ) as data
FROM profiles p
WHERE p.user_id = (SELECT user_id FROM user_info)

UNION ALL

SELECT 
  'SUBSCRIPTION' as section,
  json_build_object(
    'plan_name', sp.name,
    'status', us.status,
    'current_period_end', us.current_period_end,
    'included_ai_tokens', sp.initial_ai_tokens,
    'included_video_results', sp.video_results
  ) as data
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = (SELECT user_id FROM user_info)
  AND us.status = 'active'
  AND us.current_period_end > now()

UNION ALL

SELECT 
  'GENERATION_COUNT' as section,
  json_build_object(
    'total_generations', COUNT(*),
    'last_generation', MAX(created_at)
  ) as data
FROM ai_generation_history
WHERE user_id = (SELECT user_id FROM user_info)
  AND is_public_sample = false

UNION ALL

SELECT 
  'DEDUCTION_COUNT' as section,
  json_build_object(
    'total_deductions', COUNT(*),
    'total_amount', COALESCE(SUM(amount), 0)
  ) as data
FROM token_audit_log
WHERE user_id = (SELECT user_id FROM user_info)
  AND action = 'deduct'
  AND token_type = 'ai_tokens'

UNION ALL

SELECT 
  'RESERVATION_COUNT' as section,
  json_build_object(
    'total_reservations', COUNT(*),
    'active_reservations', COUNT(*) FILTER (WHERE status = 'reserved' AND expires_at > now()),
    'committed_reservations', COUNT(*) FILTER (WHERE status = 'committed'),
    'rolled_back_reservations', COUNT(*) FILTER (WHERE status = 'rolled_back')
  ) as data
FROM token_reservations
WHERE user_id = (SELECT user_id FROM user_info);
