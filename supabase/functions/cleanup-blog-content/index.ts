import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('Fetching all blog posts...');
    
    // Fetch all blog posts
    const { data: posts, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, title, content')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching posts:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${posts?.length || 0} posts to process`);

    let cleanedCount = 0;
    const cleanupResults = [];

    for (const post of posts || []) {
      const originalContent = post.content;
      
      // Clean content: remove JSON artifacts
      let cleanedContent = originalContent
        // Remove markdown JSON code blocks
        .replace(/```json[\s\S]*?```/g, '')
        // Remove JSON object wrappers at the start
        .replace(/^\s*\{\s*"content":\s*"/g, '')
        .replace(/^\s*\{\s*\"content\":\s*\"/g, '')
        // Remove JSON artifacts at the end
        .replace(/",\s*"keywords"[\s\S]*$/g, '')
        .replace(/\",\s*\"keywords\"[\s\S]*$/g, '')
        // Remove any remaining trailing JSON
        .replace(/",?\s*\}?\s*$/g, '')
        .replace(/\",?\s*\}?\s*$/g, '')
        // Trim whitespace
        .trim();

      // Check if content was actually changed
      if (cleanedContent !== originalContent && cleanedContent.length > 0) {
        console.log(`Cleaning post ${post.id}: ${post.title}`);
        console.log(`Original length: ${originalContent.length}, Cleaned length: ${cleanedContent.length}`);
        
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update({ content: cleanedContent })
          .eq('id', post.id);

        if (updateError) {
          console.error(`Error updating post ${post.id}:`, updateError);
          cleanupResults.push({
            id: post.id,
            title: post.title,
            success: false,
            error: updateError.message
          });
        } else {
          cleanedCount++;
          cleanupResults.push({
            id: post.id,
            title: post.title,
            success: true,
            originalLength: originalContent.length,
            cleanedLength: cleanedContent.length
          });
        }
      }
    }

    console.log(`Cleanup completed: ${cleanedCount} posts cleaned`);

    return new Response(JSON.stringify({
      success: true,
      totalPosts: posts?.length || 0,
      cleanedPosts: cleanedCount,
      results: cleanupResults
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in cleanup-blog-content:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
