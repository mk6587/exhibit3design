-- Delete the two AI edit samples (sketch and girl examples)
DELETE FROM public.ai_edit_samples
WHERE display_order IN (1, 2);