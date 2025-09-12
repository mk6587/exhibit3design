-- Create designers table to track users who want to sell designs
CREATE TABLE public.designers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT,
  portfolio_url TEXT,
  bio TEXT,
  specialties TEXT[], -- Array of design specialties
  commission_rate DECIMAL(5,2) DEFAULT 10.00, -- Default 10% commission
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_approved BOOLEAN NOT NULL DEFAULT false, -- Requires admin approval
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.designers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for designers table
CREATE POLICY "Users can view their own designer profile" 
ON public.designers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own designer profile" 
ON public.designers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own designer profile" 
ON public.designers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all designer profiles" 
ON public.designers 
FOR SELECT 
USING (current_user_is_admin());

CREATE POLICY "Admins can manage all designer profiles" 
ON public.designers 
FOR ALL 
USING (current_user_is_admin()) 
WITH CHECK (current_user_is_admin());

-- Create function to check if current user is a designer
CREATE OR REPLACE FUNCTION public.is_current_user_designer()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.designers 
    WHERE user_id = auth.uid() AND is_active = true AND is_approved = true
  );
$$;

-- Create function to check if a specific user is a designer
CREATE OR REPLACE FUNCTION public.is_designer(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.designers 
    WHERE user_id = user_id_param AND is_active = true AND is_approved = true
  );
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_designers_updated_at
  BEFORE UPDATE ON public.designers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance
CREATE INDEX idx_designers_user_id ON public.designers(user_id);
CREATE INDEX idx_designers_active_approved ON public.designers(is_active, is_approved);