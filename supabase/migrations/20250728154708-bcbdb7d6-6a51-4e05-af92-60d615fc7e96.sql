-- One-time migration to copy long_description to memo field for products that don't have memo set
UPDATE public.products 
SET memo = CASE 
  WHEN memo IS NULL OR memo = '' THEN 
    -- Strip HTML tags and truncate to reasonable length for memo
    LEFT(REGEXP_REPLACE(long_description, '<[^>]*>', '', 'g'), 200)
  ELSE memo 
END
WHERE memo IS NULL OR memo = '';