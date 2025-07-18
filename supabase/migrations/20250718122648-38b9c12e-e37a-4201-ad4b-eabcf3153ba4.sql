-- Configure the send-confirmation-email edge function to handle password reset emails
-- This updates the auth.config to use the edge function for password reset emails as well

-- First, let's check if we need to configure additional webhook settings
-- The edge function should handle both signup and recovery email types
-- We need to ensure the email_action_type is properly handled in the edge function

-- Note: The actual webhook configuration needs to be done in the Supabase dashboard
-- under Authentication > Settings > Email Templates
-- But we can add a comment here for reference

-- Add or update email template configuration
INSERT INTO auth.config (parameter, value) 
VALUES ('email_template_recovery', '{"subject": "Reset Your Password", "body": "Use this link to reset your password: {{ .ConfirmationURL }}"}')
ON CONFLICT (parameter) 
DO UPDATE SET value = EXCLUDED.value;