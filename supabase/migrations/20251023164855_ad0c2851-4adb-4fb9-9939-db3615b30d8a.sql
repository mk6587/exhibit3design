-- Create blog_categories table
CREATE TABLE public.blog_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  featured_image_url TEXT,
  author_id UUID REFERENCES public.profiles(user_id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  readability_score INTEGER DEFAULT 0,
  quality_score INTEGER DEFAULT 0,
  word_count INTEGER DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  ctas JSONB DEFAULT '[]',
  internal_links JSONB DEFAULT '[]',
  generated_keyword TEXT,
  ai_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog_post_categories junction table
CREATE TABLE public.blog_post_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.blog_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, category_id)
);

-- Create blog_settings table
CREATE TABLE public.blog_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_title TEXT NOT NULL DEFAULT 'Exhibit3Design Academy',
  tagline TEXT DEFAULT 'Learn Exhibition Design with AI',
  posts_per_page INTEGER NOT NULL DEFAULT 12,
  auto_generate_enabled BOOLEAN NOT NULL DEFAULT false,
  generation_frequency TEXT NOT NULL DEFAULT 'weekly' CHECK (generation_frequency IN ('daily', 'weekly', 'monthly')),
  topics_source TEXT NOT NULL DEFAULT 'file',
  seo_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.blog_settings (site_title, tagline) VALUES ('Exhibit3Design Academy', 'Learn Exhibition Design with AI');

-- Enable RLS
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_categories
CREATE POLICY "Anyone can view active categories"
  ON public.blog_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON public.blog_categories FOR ALL
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

-- RLS Policies for blog_posts
CREATE POLICY "Anyone can view published posts"
  ON public.blog_posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can view all posts"
  ON public.blog_posts FOR SELECT
  USING (current_user_is_admin());

CREATE POLICY "Admins can manage posts"
  ON public.blog_posts FOR ALL
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

-- RLS Policies for blog_post_categories
CREATE POLICY "Anyone can view post categories"
  ON public.blog_post_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage post categories"
  ON public.blog_post_categories FOR ALL
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

-- RLS Policies for blog_settings
CREATE POLICY "Anyone can view blog settings"
  ON public.blog_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage blog settings"
  ON public.blog_settings FOR ALL
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

-- Create indexes for performance
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX idx_blog_categories_slug ON public.blog_categories(slug);
CREATE INDEX idx_blog_post_categories_post_id ON public.blog_post_categories(post_id);
CREATE INDEX idx_blog_post_categories_category_id ON public.blog_post_categories(category_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_categories_updated_at
  BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_settings_updated_at
  BEFORE UPDATE ON public.blog_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();