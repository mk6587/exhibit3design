-- Create subscription_orders table for subscription purchases
CREATE TABLE public.subscription_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  order_number text UNIQUE,
  
  -- Customer information (will be encrypted by trigger)
  customer_first_name text,
  customer_last_name text,
  customer_email text,
  customer_mobile text,
  customer_address text,
  customer_city text,
  customer_postal_code text,
  customer_country text,
  
  -- Payment gateway fields
  authority text,
  yekpay_reference text,
  transaction_id text,
  payment_method text,
  payment_description text,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own subscription orders"
ON public.subscription_orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscription orders"
ON public.subscription_orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscription orders"
ON public.subscription_orders
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Trigger for encrypting sensitive data
CREATE TRIGGER encrypt_subscription_order_data
  BEFORE INSERT OR UPDATE ON public.subscription_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_payment_data_trigger();

-- Trigger for updating updated_at timestamp
CREATE TRIGGER update_subscription_orders_updated_at
  BEFORE UPDATE ON public.subscription_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();