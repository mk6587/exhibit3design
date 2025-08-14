-- Function to transfer guest order data to user profile
CREATE OR REPLACE FUNCTION public.transfer_guest_order_data(
  p_user_id uuid,
  p_email text
)
RETURNS TABLE(
  success boolean,
  first_name text,
  last_name text,
  phone_number text,
  address_line_1 text,
  city text,
  postal_code text,
  country text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  guest_order_record record;
  encrypted_email text;
  orders_updated integer := 0;
BEGIN
  -- Encrypt the email to match stored format
  encrypted_email := public.encrypt_sensitive_data(p_email);
  
  -- Find the most recent guest order with this encrypted email
  SELECT *
  INTO guest_order_record
  FROM public.orders
  WHERE customer_email = encrypted_email 
    AND user_id IS NULL
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If no guest orders found, return false
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, null::text, null::text, null::text, null::text, null::text, null::text, null::text;
    RETURN;
  END IF;
  
  -- Update all guest orders with this email to link to authenticated user
  UPDATE public.orders 
  SET user_id = p_user_id
  WHERE customer_email = encrypted_email 
    AND user_id IS NULL;
  
  GET DIAGNOSTICS orders_updated = ROW_COUNT;
  
  -- Return decrypted customer data for profile creation
  RETURN QUERY SELECT 
    true,
    public.decrypt_sensitive_data(guest_order_record.customer_first_name),
    public.decrypt_sensitive_data(guest_order_record.customer_last_name),
    public.decrypt_sensitive_data(guest_order_record.customer_mobile),
    public.decrypt_sensitive_data(guest_order_record.customer_address),
    public.decrypt_sensitive_data(guest_order_record.customer_city),
    public.decrypt_sensitive_data(guest_order_record.customer_postal_code),
    guest_order_record.customer_country;
    
END;
$$;

-- Function to create user profile with guest order data
CREATE OR REPLACE FUNCTION public.create_profile_with_guest_data(
  p_user_id uuid,
  p_email text
)
RETURNS TABLE(profile_data json)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  guest_data record;
  new_profile record;
  location_data json;
BEGIN
  -- Try to get guest order data
  SELECT * INTO guest_data
  FROM public.transfer_guest_order_data(p_user_id, p_email)
  LIMIT 1;
  
  -- Get location data as fallback
  BEGIN
    SELECT to_json(response) INTO location_data
    FROM (
      SELECT 'Unknown' as country_name, 'Unknown' as city
    ) response;
  EXCEPTION WHEN OTHERS THEN
    location_data := '{"country_name": null, "city": null}'::json;
  END;
  
  -- Create the profile with available data
  INSERT INTO public.profiles (
    user_id,
    first_name,
    last_name,
    phone_number,
    address_line_1,
    city,
    postcode,
    country
  ) VALUES (
    p_user_id,
    CASE WHEN guest_data.success THEN guest_data.first_name ELSE NULL END,
    CASE WHEN guest_data.success THEN guest_data.last_name ELSE NULL END,
    CASE WHEN guest_data.success THEN guest_data.phone_number ELSE NULL END,
    CASE WHEN guest_data.success THEN guest_data.address_line_1 ELSE NULL END,
    CASE WHEN guest_data.success THEN guest_data.city ELSE (location_data->>'city') END,
    CASE WHEN guest_data.success THEN guest_data.postal_code ELSE NULL END,
    CASE WHEN guest_data.success THEN guest_data.country ELSE (location_data->>'country_name') END
  )
  RETURNING * INTO new_profile;
  
  -- Return the created profile as JSON
  RETURN QUERY SELECT to_json(new_profile);
END;
$$;