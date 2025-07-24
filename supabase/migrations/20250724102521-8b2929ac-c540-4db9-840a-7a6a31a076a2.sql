-- Create a dedicated admin table separate from user roles
CREATE TABLE public.admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create policies for admin table
CREATE POLICY "Only admins can view admin records" 
ON public.admins 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admins a 
    WHERE a.user_id = auth.uid() AND a.is_active = true
  )
);

CREATE POLICY "Only admins can insert admin records" 
ON public.admins 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admins a 
    WHERE a.user_id = auth.uid() AND a.is_active = true
  )
);

CREATE POLICY "Only admins can update admin records" 
ON public.admins 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.admins a 
    WHERE a.user_id = auth.uid() AND a.is_active = true
  )
);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = $1 AND is_active = true
  );
$$;

-- Create function to check current user is admin
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT public.is_admin(auth.uid());
$$;

-- Create trigger for updating timestamp
CREATE TRIGGER update_admins_updated_at
BEFORE UPDATE ON public.admins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_admins_user_id ON public.admins(user_id);
CREATE INDEX idx_admins_username ON public.admins(username);
CREATE INDEX idx_admins_email ON public.admins(email);
CREATE INDEX idx_admins_active ON public.admins(is_active);