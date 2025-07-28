-- Remove long_description column as content has been migrated to memo field
ALTER TABLE public.products 
DROP COLUMN long_description;