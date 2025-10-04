-- Create a security definer function to check admin status
-- This bypasses RLS and allows users to check their own admin status
CREATE OR REPLACE FUNCTION public.check_user_admin_status(check_user_id uuid)
RETURNS TABLE(is_admin boolean, is_active boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXISTS (
      SELECT 1 
      FROM public.user_roles ur
      JOIN public.admins a ON ur.user_id = a.user_id
      WHERE ur.user_id = check_user_id
        AND ur.role = 'admin'
        AND a.is_active = true
    ) as is_admin,
    COALESCE(
      (SELECT a.is_active FROM public.admins a WHERE a.user_id = check_user_id),
      false
    ) as is_active;
END;
$$;