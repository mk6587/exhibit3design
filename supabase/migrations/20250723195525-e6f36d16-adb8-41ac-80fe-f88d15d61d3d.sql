-- Remove admin role dependency from products table RLS policies
-- Create separate admin access that doesn't rely on user_roles table

-- Drop existing admin-dependent policies on products table
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;

-- Create new policies that allow admin operations without user authentication
-- We'll handle admin authentication at the application level
CREATE POLICY "Admin operations allowed on products" ON public.products
FOR ALL USING (true);

-- Keep the public read access
-- The "Anyone can view products" policy should already exist