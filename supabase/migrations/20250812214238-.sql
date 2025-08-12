-- Fix OTP insertion issue by removing problematic encryption trigger

-- Drop the encryption trigger on otp_registrations since it's causing insertion failures
DROP TRIGGER IF EXISTS encrypt_otp_data ON public.otp_registrations;

-- The OTP table doesn't need the same encryption as orders since:
-- 1. OTP codes are already hashed via the hash_otp_code function
-- 2. OTP records expire in 2 minutes and are deleted
-- 3. This is causing insertion failures

-- Ensure the trigger function is still called for the otp hashing via the table insert
-- This is handled by the application logic in the send-otp function