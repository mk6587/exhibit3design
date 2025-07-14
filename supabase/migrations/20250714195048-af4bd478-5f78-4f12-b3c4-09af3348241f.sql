-- Create user_roles table (app_role enum already exists)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policy for user_roles - admins can manage all roles
CREATE POLICY "Admins can manage all user roles" ON public.user_roles
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
);

-- Create policy for users to view their own roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());