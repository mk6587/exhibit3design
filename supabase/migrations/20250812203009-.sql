-- Fix critical security vulnerability: Remove overly permissive RLS policy on orders table
-- The current "Service role can select orders" policy with "true" condition makes all orders publicly readable
-- This exposes sensitive customer data including emails, phones, names, and addresses

-- Drop the problematic public read policy that allows anyone to view all orders
DROP POLICY IF EXISTS "Service role can select orders" ON public.orders;

-- Keep the secure policies:
-- 1. "Users can view their own orders" - allows users to see only their orders
-- 2. "Only authenticated users can create orders" - prevents anonymous order creation  
-- 3. "Service role can update orders" - allows payment processing to update order status

-- Verify the remaining policies are secure:
-- The "Users can view their own orders" policy uses (auth.uid() = user_id) which is secure
-- The "Only authenticated users can create orders" policy uses (auth.uid() = user_id) which is secure
-- The "Service role can update orders" policy is needed for payment processing but doesn't allow reads

-- Add a comment to document the security fix
COMMENT ON TABLE public.orders IS 'Orders table with secure RLS policies - users can only access their own orders';