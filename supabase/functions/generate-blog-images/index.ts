import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch blog posts without featured images
    const { data: posts, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, title, meta_description, slug')
      .eq('status', 'published')
      .is('featured_image_url', null);

    if (fetchError) throw fetchError;

    if (!posts || posts.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No posts need images', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    for (const post of posts) {
      try {
        // Generate image using Lovable AI Gateway
        const prompt = `Create a professional, modern hero cover image for a blog post about exhibition design. Title: "${post.title}". Style: Clean, corporate, high-tech exhibition booth design with 3D elements, professional lighting. 16:9 aspect ratio. Ultra high resolution.`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image-preview',
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            modalities: ['image', 'text']
          })
        });

        if (!aiResponse.ok) {
          throw new Error(`AI generation failed: ${await aiResponse.text()}`);
        }

        const aiData = await aiResponse.json();
        const imageBase64 = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!imageBase64) {
          throw new Error('No image generated');
        }

        // Extract base64 data (remove data:image/png;base64, prefix)
        const base64Data = imageBase64.split(',')[1];
        const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        // Upload to Supabase Storage
        const fileName = `blog-covers/${post.slug}-${Date.now()}.png`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(fileName, imageBuffer, {
            contentType: 'image/png',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('blog-images')
          .getPublicUrl(fileName);

        // Update blog post with image URL
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update({ featured_image_url: publicUrl })
          .eq('id', post.id);

        if (updateError) throw updateError;

        results.push({ 
          id: post.id, 
          title: post.title,
          status: 'success', 
          imageUrl: publicUrl 
        });
      } catch (error) {
        console.error(`Error generating image for post ${post.id}:`, error);
        results.push({ 
          id: post.id, 
          title: post.title,
          status: 'error', 
          error: error.message 
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Image generation complete',
        total: posts.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
