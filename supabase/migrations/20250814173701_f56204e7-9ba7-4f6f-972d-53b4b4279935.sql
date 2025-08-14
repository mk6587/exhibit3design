-- Fix guest order access security issue by implementing secure token-based access

-- Create a secure function to retrieve guest orders by token
CREATE OR REPLACE FUNCTION public.get_guest_order_by_token(order_token_param text)
RETURNS TABLE(
  id uuid,
  order_number text,
  status text,
  amount numeric,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  product_id bigint,
  customer_first_name text,
  customer_last_name text,
  customer_email text,
  customer_mobile text,
  customer_address text,
  customer_city text,
  customer_postal_code text,
  customer_country text,
  payment_method text,
  payment_description text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Validate input
  IF order_token_param IS NULL OR order_token_param = '' THEN
    RAISE EXCEPTION 'Order token is required';
  END IF;

  -- Return order data only if token matches and it's a guest order
  RETURN QUERY
  SELECT 
    o.id,
    o.order_number,
    o.status,
    o.amount,
    o.created_at,
    o.updated_at,
    o.product_id,
    o.customer_first_name,
    o.customer_last_name,
    o.customer_email,
    o.customer_mobile,
    o.customer_address,
    o.customer_city,
    o.customer_postal_code,
    o.customer_country,
    o.payment_method,
    o.payment_description
  FROM public.orders o
  WHERE o.order_token = order_token_param 
    AND o.user_id IS NULL; -- Only guest orders
END;
$$;

-- Grant execute permission to anonymous users for the function
GRANT EXECUTE ON FUNCTION public.get_guest_order_by_token(text) TO anon;

-- Create a secure function to verify guest order access (for order details page)
CREATE OR REPLACE FUNCTION public.verify_guest_order_access(order_id_param uuid, order_token_param text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Validate inputs
  IF order_id_param IS NULL OR order_token_param IS NULL OR order_token_param = '' THEN
    RETURN false;
  END IF;

  -- Check if the order exists with the correct token and is a guest order
  RETURN EXISTS(
    SELECT 1 
    FROM public.orders 
    WHERE id = order_id_param 
      AND order_token = order_token_param 
      AND user_id IS NULL
  );
END;
$$;

-- Grant execute permission to anonymous users for the verification function
GRANT EXECUTE ON FUNCTION public.verify_guest_order_access(uuid, text) TO anon;

-- Add a secure SELECT policy for guest orders using RLS with session variables
-- This policy allows anonymous users to view orders when they set the correct session variable
CREATE POLICY "Anonymous users can view guest orders with valid token" 
ON public.orders 
FOR SELECT 
TO anon
USING (
  user_id IS NULL 
  AND order_token IS NOT NULL
  AND order_token = current_setting('app.current_order_token', true)
);

-- Create helper function to set order token in session (for secure access)
CREATE OR REPLACE FUNCTION public.set_order_token_session(token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Validate token format (should be base64url encoded, ~43 characters)
  IF token IS NULL OR length(token) < 20 OR length(token) > 100 THEN
    RAISE EXCEPTION 'Invalid token format';
  END IF;
  
  -- Set the session variable
  PERFORM set_config('app.current_order_token', token, true);
END;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.set_order_token_session(text) TO anon;