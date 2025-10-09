-- Insert sample AI edit examples for exhibition stands
INSERT INTO public.ai_edit_samples (title, description, before_image_url, after_image_url, prompt_used, category, is_featured, display_order) VALUES
(
  'Sketch Transformation',
  'Transform a basic sketch into a detailed 3D render with realistic materials and lighting.',
  'https://images.unsplash.com/photo-1586864387634-29aa60e5a5a0?w=800&q=80',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  'convert this photo into a detailed pencil sketch with artistic shading',
  'style_transfer',
  true,
  1
),
(
  'Color Scheme Update',
  'Instantly change the exhibition stand color scheme from blue to modern green tones.',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80',
  'change the color scheme to modern green and white with wood accents',
  'color_change',
  true,
  2
),
(
  'Lighting Enhancement',
  'Upgrade the lighting from basic to premium LED spotlighting with dramatic effects.',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  'https://images.unsplash.com/photo-1505409859467-3a796fd5798e?w=800&q=80',
  'add dramatic LED lighting with warm spotlights and ambient glow',
  'render_quality',
  false,
  3
),
(
  'Material Upgrade',
  'Transform basic materials into premium finishes with metallic and glass elements.',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
  'upgrade materials to premium metallic finishes with frosted glass panels',
  'material_update',
  true,
  4
),
(
  'Modern Style Transfer',
  'Convert traditional design into contemporary minimalist aesthetic.',
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
  'redesign in modern minimalist style with clean lines and open space',
  'style_transfer',
  false,
  5
);