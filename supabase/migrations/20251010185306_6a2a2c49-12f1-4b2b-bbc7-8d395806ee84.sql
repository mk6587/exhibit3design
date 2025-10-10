-- Remove unused tables and related functions

-- Drop functions related to designers table
DROP FUNCTION IF EXISTS public.is_current_user_designer();
DROP FUNCTION IF EXISTS public.is_designer(uuid);

-- Drop functions related to guest checkout sessions
DROP FUNCTION IF EXISTS public.store_guest_checkout_session(text, text, text, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS public.transfer_guest_session_to_profile(uuid, text);
DROP FUNCTION IF EXISTS public.cleanup_expired_guest_sessions();

-- Drop functions related to guest order access log
DROP FUNCTION IF EXISTS public.check_guest_order_access_rate_limit(text);
DROP FUNCTION IF EXISTS public.verify_guest_order_access_secure(uuid, text, text, text);

-- Drop function related to guest tokens (used by orders table)
-- Note: We're keeping this function as it might be used by the orders table
-- DROP FUNCTION IF EXISTS public.cleanup_expired_guest_tokens();

-- Drop function related to sso_tokens
DROP FUNCTION IF EXISTS public.cleanup_expired_sso_tokens();

-- Drop the unused tables
DROP TABLE IF EXISTS public.designers CASCADE;
DROP TABLE IF EXISTS public.guest_checkout_sessions CASCADE;
DROP TABLE IF EXISTS public.guest_order_access_log CASCADE;
DROP TABLE IF EXISTS public.sso_tokens CASCADE;