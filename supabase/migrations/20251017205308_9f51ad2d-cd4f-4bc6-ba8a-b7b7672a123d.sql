-- Create file requests table
CREATE TABLE public.file_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id bigint NOT NULL,
  product_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'uploaded', 'completed')),
  requested_at timestamp with time zone NOT NULL DEFAULT now(),
  uploaded_file_url text,
  uploaded_at timestamp with time zone,
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.file_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own file requests
CREATE POLICY "Users can view their own file requests"
ON public.file_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own file requests
CREATE POLICY "Users can create their own file requests"
ON public.file_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all file requests
CREATE POLICY "Admins can view all file requests"
ON public.file_requests
FOR SELECT
USING (current_user_is_admin());

-- Admins can update all file requests
CREATE POLICY "Admins can update all file requests"
ON public.file_requests
FOR UPDATE
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Create index for faster queries
CREATE INDEX idx_file_requests_user_id ON public.file_requests(user_id);
CREATE INDEX idx_file_requests_status ON public.file_requests(status);

-- Add trigger for updated_at
CREATE TRIGGER update_file_requests_updated_at
BEFORE UPDATE ON public.file_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();