-- Add selected_files column to profiles table for free tier users
ALTER TABLE public.profiles 
ADD COLUMN selected_files jsonb DEFAULT '[]'::jsonb;