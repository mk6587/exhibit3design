-- Migrate existing data and add comprehensive security measures

-- Step 1: Encrypt/hash existing sensitive data safely
UPDATE public.orders 
SET 
  customer_email = CASE 
    WHEN customer_email IS NOT NULL AND customer_email != '' 
         AND NOT (customer_email ~ '^[A-Za-z0-9+/=]*$' AND length(customer_email) = 44)
    THEN public.encrypt_sensitive_data(customer_email) 
    ELSE customer_email 
  END,
  customer_first_name = CASE 
    WHEN customer_first_name IS NOT NULL AND customer_first_name != '' 
         AND NOT (customer_first_name ~ '^[A-Za-z0-9+/=]*$' AND length(customer_first_name) = 44)
    THEN public.encrypt_sensitive_data(customer_first_name) 
    ELSE customer_first_name 
  END,
  customer_last_name = CASE 
    WHEN customer_last_name IS NOT NULL AND customer_last_name != '' 
         AND NOT (customer_last_name ~ '^[A-Za-z0-9+/=]*$' AND length(customer_last_name) = 44)
    THEN public.encrypt_sensitive_data(customer_last_name) 
    ELSE customer_last_name 
  END,
  customer_mobile = CASE 
    WHEN customer_mobile IS NOT NULL AND customer_mobile != '' 
         AND NOT (customer_mobile ~ '^[A-Za-z0-9+/=]*$' AND length(customer_mobile) = 44)
    THEN public.encrypt_sensitive_data(customer_mobile) 
    ELSE customer_mobile 
  END,
  customer_address = CASE 
    WHEN customer_address IS NOT NULL AND customer_address != '' 
         AND NOT (customer_address ~ '^[A-Za-z0-9+/=]*$' AND length(customer_address) = 44)
    THEN public.encrypt_sensitive_data(customer_address) 
    ELSE customer_address 
  END,
  customer_city = CASE 
    WHEN customer_city IS NOT NULL AND customer_city != '' 
         AND NOT (customer_city ~ '^[A-Za-z0-9+/=]*$' AND length(customer_city) = 44)
    THEN public.encrypt_sensitive_data(customer_city) 
    ELSE customer_city 
  END,
  customer_postal_code = CASE 
    WHEN customer_postal_code IS NOT NULL AND customer_postal_code != '' 
         AND NOT (customer_postal_code ~ '^[A-Za-z0-9+/=]*$' AND length(customer_postal_code) = 44)
    THEN public.encrypt_sensitive_data(customer_postal_code) 
    ELSE customer_postal_code 
  END,
  transaction_id = CASE 
    WHEN transaction_id IS NOT NULL AND transaction_id != '' 
         AND NOT (transaction_id ~ '^[A-Za-z0-9+/=]*$' AND length(transaction_id) = 44)
    THEN public.encrypt_sensitive_data(transaction_id) 
    ELSE transaction_id 
  END,
  authority = CASE 
    WHEN authority IS NOT NULL AND authority != '' 
         AND NOT (authority ~ '^[A-Za-z0-9+/=]*$' AND length(authority) = 44)
    THEN public.encrypt_sensitive_data(authority) 
    ELSE authority 
  END,
  yekpay_reference = CASE 
    WHEN yekpay_reference IS NOT NULL AND yekpay_reference != '' 
         AND NOT (yekpay_reference ~ '^[A-Za-z0-9+/=]*$' AND length(yekpay_reference) = 44)
    THEN public.encrypt_sensitive_data(yekpay_reference) 
    ELSE yekpay_reference 
  END;