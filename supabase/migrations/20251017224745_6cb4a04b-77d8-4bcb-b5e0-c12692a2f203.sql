-- Add columns to control where AI samples are displayed
ALTER TABLE public.ai_samples 
ADD COLUMN show_on_homepage boolean NOT NULL DEFAULT true,
ADD COLUMN show_on_samples_page boolean NOT NULL DEFAULT true;