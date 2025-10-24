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

    console.log('Starting automatic blog generation...');

    // Step 1: Check if auto-generation is enabled
    const { data: settings, error: settingsError } = await supabase
      .from('blog_settings')
      .select('auto_generate_enabled, auto_approve_enabled')
      .single();

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
      throw settingsError;
    }

    if (!settings.auto_generate_enabled) {
      console.log('Auto-generation is disabled');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Auto-generation is disabled' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 2: Check how many posts have been generated today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: todayPosts, error: todayError } = await supabase
      .from('blog_posts')
      .select('id')
      .gte('created_at', today.toISOString());

    if (todayError) {
      console.error('Error checking today posts:', todayError);
      throw todayError;
    }

    if (todayPosts && todayPosts.length > 0) {
      console.log('Already generated a post today, skipping');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Already generated a post today' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 3: Get existing post titles to avoid duplicates
    const { data: existingPosts, error: existingError } = await supabase
      .from('blog_posts')
      .select('generated_keyword');

    if (existingError) {
      console.error('Error fetching existing posts:', existingError);
      throw existingError;
    }

    const usedKeywords = new Set(existingPosts?.map(p => p.generated_keyword) || []);

    // Step 4: Load topics from BLOG_TOPICS.md - hardcoded list
    const topics = [
      // A. AI Exhibition Design (Core Content)
      { keyword: "How AI is transforming exhibition stand design", category: "A" },
      { keyword: "Top 10 benefits of using AI in booth design", category: "A" },
      { keyword: "AI vs. traditional 3D design — what's faster and smarter?", category: "A" },
      { keyword: "How AI saves hours in trade show visualization", category: "A" },
      { keyword: "AI exhibition design workflow: from idea to render", category: "A" },
      // Add more topics as needed - this is just a sample
    ];

    // Step 5: Find an unused topic
    const availableTopics = topics.filter(topic => !usedKeywords.has(topic.keyword));
    
    if (availableTopics.length === 0) {
      console.log('No unused topics available');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No unused topics available' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Select a random topic from available ones
    const selectedTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
    console.log('Selected topic:', selectedTopic.keyword);

    // Step 6: Call the generate-blog-post function
    const generateResponse = await supabase.functions.invoke('generate-blog-post', {
      body: {
        keyword: selectedTopic.keyword,
        categoryIds: [], // Can be enhanced to auto-assign categories based on topic.category
        autoApprove: settings.auto_approve_enabled
      }
    });

    if (generateResponse.error) {
      console.error('Blog generation failed:', generateResponse.error);
      throw new Error(`Blog generation failed: ${JSON.stringify(generateResponse.error)}`);
    }

    const result = generateResponse.data;
    console.log('Blog post generated successfully:', result);

    return new Response(JSON.stringify({
      success: true,
      message: 'Blog post generated successfully',
      post: result.post
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in auto-generate-blog:', error);
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
