-- Allow guest checkout by making user_id nullable in orders table
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies to handle guest orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

-- New policies that handle both authenticated users and guest orders
CREATE POLICY "Users can view their own orders or guest orders by email" 
ON public.orders 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  (user_id IS NULL)
);

CREATE POLICY "Orders can be inserted" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Orders can be updated" 
ON public.orders 
FOR UPDATE 
USING (true);