-- Fix critical privacy issue: Remove policy allowing anyone to view guest orders

-- Drop the dangerous policy that allows anyone to view guest orders
DROP POLICY IF EXISTS "Users can view their own orders or guest orders by email" ON public.orders;

-- Create secure policies for order viewing
-- Authenticated users can only view their own orders
CREATE POLICY "Authenticated users can view their own orders" 
ON public.orders 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Service role can view all orders (needed for admin functions and payment processing)
CREATE POLICY "Service role can view all orders" 
ON public.orders 
FOR SELECT 
TO service_role
USING (true);

-- Add a secure order token column for guest order access
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_token text UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_token ON public.orders(order_token) WHERE order_token IS NOT NULL;

-- Function to generate secure order tokens
CREATE OR REPLACE FUNCTION public.generate_order_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$;

-- Trigger to automatically generate order tokens for guest orders
CREATE OR REPLACE FUNCTION public.set_order_token()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only generate token for guest orders (user_id IS NULL)
  IF NEW.user_id IS NULL AND NEW.order_token IS NULL THEN
    NEW.order_token = public.generate_order_token();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for new orders
DROP TRIGGER IF EXISTS trigger_set_order_token ON public.orders;
CREATE TRIGGER trigger_set_order_token
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_order_token();

-- Generate tokens for existing guest orders that don't have them
UPDATE public.orders 
SET order_token = public.generate_order_token()
WHERE user_id IS NULL AND order_token IS NULL;