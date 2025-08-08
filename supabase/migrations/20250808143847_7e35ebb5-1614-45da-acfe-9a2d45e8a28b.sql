-- Make password_hash nullable in otp_registrations table since OTP auth doesn't always require a password
ALTER TABLE public.otp_registrations 
ALTER COLUMN password_hash DROP NOT NULL;