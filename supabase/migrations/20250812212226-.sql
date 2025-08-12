-- Encrypt existing orders data and add additional security measures
-- Step 1: Safely encrypt existing order data

-- Create a function to migrate existing data safely
CREATE OR REPLACE FUNCTION public.encrypt_existing_orders()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  order_record RECORD;
  encrypted_count INTEGER := 0;
BEGIN
  -- Temporarily disable the encryption trigger to avoid double encryption
  ALTER TABLE public.orders DISABLE TRIGGER encrypt_payment_data;
  
  -- Loop through all orders and encrypt sensitive fields
  FOR order_record IN 
    SELECT * FROM public.orders 
    WHERE customer_email IS NOT NULL 
      AND length(customer_email) > 0 
      AND customer_email NOT LIKE '%==%' -- Skip already encrypted data (base64 ends with =)
  LOOP
    UPDATE public.orders 
    SET 
      customer_email = CASE 
        WHEN customer_email IS NOT NULL AND customer_email != '' AND customer_email NOT LIKE '%==%'
        THEN public.encrypt_sensitive_data(customer_email) 
        ELSE customer_email 
      END,
      customer_first_name = CASE 
        WHEN customer_first_name IS NOT NULL AND customer_first_name != '' AND customer_first_name NOT LIKE '%==%'
        THEN public.encrypt_sensitive_data(customer_first_name) 
        ELSE customer_first_name 
      END,
      customer_last_name = CASE 
        WHEN customer_last_name IS NOT NULL AND customer_last_name != '' AND customer_last_name NOT LIKE '%==%'
        THEN public.encrypt_sensitive_data(customer_last_name) 
        ELSE customer_last_name 
      END,
      customer_mobile = CASE 
        WHEN customer_mobile IS NOT NULL AND customer_mobile != '' AND customer_mobile NOT LIKE '%==%'
        THEN public.encrypt_sensitive_data(customer_mobile) 
        ELSE customer_mobile 
      END,
      customer_address = CASE 
        WHEN customer_address IS NOT NULL AND customer_address != '' AND customer_address NOT LIKE '%==%'
        THEN public.encrypt_sensitive_data(customer_address) 
        ELSE customer_address 
      END,
      customer_city = CASE 
        WHEN customer_city IS NOT NULL AND customer_city != '' AND customer_city NOT LIKE '%==%'
        THEN public.encrypt_sensitive_data(customer_city) 
        ELSE customer_city 
      END,
      customer_postal_code = CASE 
        WHEN customer_postal_code IS NOT NULL AND customer_postal_code != '' AND customer_postal_code NOT LIKE '%==%'
        THEN public.encrypt_sensitive_data(customer_postal_code) 
        ELSE customer_postal_code 
      END,
      transaction_id = CASE 
        WHEN transaction_id IS NOT NULL AND transaction_id != '' AND transaction_id NOT LIKE '%==%'
        THEN public.encrypt_sensitive_data(transaction_id) 
        ELSE transaction_id 
      END,
      authority = CASE 
        WHEN authority IS NOT NULL AND authority != '' AND authority NOT LIKE '%==%'
        THEN public.encrypt_sensitive_data(authority) 
        ELSE authority 
      END,
      yekpay_reference = CASE 
        WHEN yekpay_reference IS NOT NULL AND yekpay_reference != '' AND yekpay_reference NOT LIKE '%==%'
        THEN public.encrypt_sensitive_data(yekpay_reference) 
        ELSE yekpay_reference 
      END,
      payment_description = CASE 
        WHEN payment_description IS NOT NULL AND payment_description != '' AND payment_description NOT LIKE '%==%'
        THEN public.encrypt_sensitive_data(payment_description) 
        ELSE payment_description 
      END
    WHERE id = order_record.id;
    
    encrypted_count := encrypted_count + 1;
  END LOOP;
  
  -- Re-enable the encryption trigger
  ALTER TABLE public.orders ENABLE TRIGGER encrypt_payment_data;
  
  RETURN 'Successfully encrypted ' || encrypted_count || ' order records';
END;
$$;

-- Execute the migration
SELECT public.encrypt_existing_orders();