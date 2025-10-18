-- Create table for AI demo configurations
CREATE TABLE public.ai_demo_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_key TEXT NOT NULL UNIQUE,
  service_name TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('image', 'video')),
  mock_input_url TEXT NOT NULL,
  mock_output_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_demo_configs ENABLE ROW LEVEL SECURITY;

-- Anyone can view active demo configs
CREATE POLICY "Anyone can view active demo configs"
ON public.ai_demo_configs
FOR SELECT
USING (is_active = true);

-- Only admins can manage demo configs
CREATE POLICY "Only admins can manage demo configs"
ON public.ai_demo_configs
FOR ALL
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

-- Insert default configurations for all services
INSERT INTO public.ai_demo_configs (service_key, service_name, service_type, mock_input_url, mock_output_url, display_order) VALUES
('adding_visitors', 'Adding Visitors', 'image', '/lovable-uploads/c64f9532-61fc-4214-88d8-ecfd68194905.png', '/lovable-uploads/edab25b4-dc8b-45d0-a426-ad59d120c4e2.png', 1),
('image_magic_edit', 'Image Magic Edit', 'image', '/lovable-uploads/c64f9532-61fc-4214-88d8-ecfd68194905.png', '/lovable-uploads/0506236c-c7c8-420c-9bd1-d00f4d4dec3d.png', 2),
('image_artistic_mode', 'Image Artistic Mode', 'image', '/lovable-uploads/c64f9532-61fc-4214-88d8-ecfd68194905.png', '/lovable-uploads/edab25b4-dc8b-45d0-a426-ad59d120c4e2.png', 3),
('text_to_image', 'Text to Image', 'image', '/lovable-uploads/c64f9532-61fc-4214-88d8-ecfd68194905.png', '/lovable-uploads/0506236c-c7c8-420c-9bd1-d00f4d4dec3d.png', 4),
('text_image_to_video', 'Text or Image to Video', 'video', '/lovable-uploads/c64f9532-61fc-4214-88d8-ecfd68194905.png', '/lovable-uploads/edab25b4-dc8b-45d0-a426-ad59d120c4e2.png', 5),
('rotating_stand_video', 'Rotating a Stand Video', 'video', '/lovable-uploads/c64f9532-61fc-4214-88d8-ecfd68194905.png', '/lovable-uploads/0506236c-c7c8-420c-9bd1-d00f4d4dec3d.png', 6),
('visitors_walkthrough_video', 'Visitors Walkthrough Video', 'video', '/lovable-uploads/c64f9532-61fc-4214-88d8-ecfd68194905.png', '/lovable-uploads/edab25b4-dc8b-45d0-a426-ad59d120c4e2.png', 7);

-- Create trigger to update updated_at
CREATE TRIGGER update_ai_demo_configs_updated_at
BEFORE UPDATE ON public.ai_demo_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();