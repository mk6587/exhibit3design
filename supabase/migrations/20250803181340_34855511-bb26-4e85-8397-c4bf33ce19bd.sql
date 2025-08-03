-- Update orders table to support YekPay integration
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS authority TEXT,
ADD COLUMN IF NOT EXISTS yekpay_reference TEXT,
ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS customer_first_name TEXT,
ADD COLUMN IF NOT EXISTS customer_last_name TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_mobile TEXT,
ADD COLUMN IF NOT EXISTS customer_address TEXT,
ADD COLUMN IF NOT EXISTS customer_postal_code TEXT,
ADD COLUMN IF NOT EXISTS customer_country TEXT,
ADD COLUMN IF NOT EXISTS customer_city TEXT,
ADD COLUMN IF NOT EXISTS payment_description TEXT;

-- Update status column to support YekPay statuses
ALTER TABLE public.orders 
ALTER COLUMN status SET DEFAULT 'pending';

-- Create index on order_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- Create index on authority for YekPay callbacks
CREATE INDEX IF NOT EXISTS idx_orders_authority ON public.orders(authority);

-- Add policy for service role to update orders (for payment callbacks)
CREATE POLICY "Service role can update orders" ON public.orders
FOR UPDATE USING (true);

-- Add policy for service role to select orders (for payment verification)
CREATE POLICY "Service role can select orders" ON public.orders
FOR SELECT USING (true);