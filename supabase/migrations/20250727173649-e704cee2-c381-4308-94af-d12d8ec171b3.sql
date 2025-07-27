-- Remove the file_size column from products table
ALTER TABLE public.products DROP COLUMN IF EXISTS file_size;