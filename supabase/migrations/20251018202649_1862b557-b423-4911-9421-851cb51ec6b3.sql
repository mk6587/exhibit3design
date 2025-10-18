-- Add admin policy to view all AI generation history
CREATE POLICY "Admins can view all AI generation history"
ON public.ai_generation_history
FOR SELECT
TO authenticated
USING (current_user_is_admin());