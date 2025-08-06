-- Create search_queries table to track user searches
CREATE TABLE public.search_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert search queries (for tracking)
CREATE POLICY "Anyone can insert search queries" 
ON public.search_queries 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view search queries
CREATE POLICY "Admins can view search queries" 
ON public.search_queries 
FOR SELECT 
USING (public.current_user_is_admin());

-- Create indexes for performance
CREATE INDEX idx_search_queries_created_at ON public.search_queries(created_at DESC);
CREATE INDEX idx_search_queries_query ON public.search_queries(query);
CREATE INDEX idx_search_queries_user_id ON public.search_queries(user_id);