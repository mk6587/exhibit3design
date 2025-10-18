-- Update existing user's token balance to match new default
SELECT correct_user_tokens(
  'c92fed4f-ed96-40df-b37a-af048519c30d'::uuid,
  2,  -- ai_tokens
  0   -- video_results (keep current)
);