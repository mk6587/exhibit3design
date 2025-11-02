-- Add second portfolio URL field to career_applications table
ALTER TABLE public.career_applications 
ADD COLUMN portfolio_url_2 text;

COMMENT ON COLUMN public.career_applications.portfolio_url_2 IS 'Additional portfolio URL for applicants';