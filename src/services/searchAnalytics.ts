import { supabase } from "@/integrations/supabase/client";

interface SearchQuery {
  query: string;
  results_count: number;
  user_id?: string;
}

export const trackSearchQuery = async ({ query, results_count, user_id }: SearchQuery) => {
  // Only track non-empty queries
  if (!query.trim()) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase
      .from('search_queries')
      .insert({
        query: query.trim(),
        results_count,
        user_id: user_id || user?.id || null,
        ip_address: null, // Can't get IP on client side
        user_agent: navigator.userAgent
      });
  } catch (error) {
    console.error('Failed to track search query:', error);
  }
};