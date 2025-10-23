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
    const { keyword, categoryIds } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('Generating blog post for keyword:', keyword);

    // Step 1: Generate article content with improved readability prompt
    const contentPrompt = `You are an expert content writer for Exhibit3Design, a company specializing in exhibition stand design and AI-powered design tools.

Write a comprehensive, SEO-optimized blog post about: "${keyword}"

Requirements:
1. Title: Engaging, keyword-focused, 50-60 characters
2. Meta Description: Compelling, 150-160 characters with CTA
3. Word Count: 1500-2000 words
4. Structure:
   - Introduction (200 words) - Hook the reader
   - 3-4 main H2 sections (400-500 words each)
   - Each H2 should have 2-3 H3 subsections
   - Conclusion (150 words) with final CTA
5. Content Quality:
   - Use keyword naturally (1-2% density)
   - Include long-tail variations
   - Add statistics and insights
   - Use bullet points and numbered lists extensively
   - Professional but engaging tone
6. Readability (Target: 75-80+ score):
   - Keep sentences SHORT (15-20 words max)
   - Use simple, everyday vocabulary
   - Write in active voice
   - Break content into short paragraphs (3-4 sentences)
   - Use transition words (however, therefore, meanwhile)
   - Avoid jargon and complex terminology
   - Use subheadings frequently for easy scanning
7. CTAs (Call-to-Actions): Place 3 CTAs strategically
   - After introduction: "Try AI Studio for Free"
   - Mid-article: "Browse Our Products"
   - End of article: "View Pricing Plans"
8. Internal Links: Suggest 6-8 relevant internal links
   - /products
   - /ai-samples
   - /pricing
   - /about
   - /contact
   - Related blog topics

Format the response as JSON:
{
  "title": "...",
  "metaDescription": "...",
  "content": "... (full HTML with h2, h3, p, ul, ol tags)",
  "keywords": ["primary", "secondary", "tertiary"],
  "internalLinks": [
    {"text": "link text", "url": "/path", "placement": "after paragraph X"},
    ...
  ],
  "ctas": [
    {"text": "CTA text", "url": "/path", "placement": "after section X"},
    ...
  ],
  "wordCount": 1500,
  "readabilityScore": 75
}`;

    console.log('Calling AI for content generation...');
    const contentResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: contentPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!contentResponse.ok) {
      const errorText = await contentResponse.text();
      console.error('AI content generation error:', contentResponse.status, errorText);
      throw new Error(`AI generation failed: ${errorText}`);
    }

    const contentData = await contentResponse.json();
    const contentText = contentData.choices[0].message.content;
    
    console.log('Content generated, parsing JSON...');
    
    // Extract JSON from the response
    let articleData;
    try {
      const jsonMatch = contentText.match(/```json\n([\s\S]*?)\n```/) || contentText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : contentText;
      articleData = JSON.parse(jsonString);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', e);
      articleData = {
        title: `${keyword} - Expert Guide`,
        metaDescription: `Learn everything about ${keyword}. Expert tips and insights from Exhibit3Design.`,
        content: contentText,
        keywords: [keyword],
        internalLinks: [],
        ctas: [],
        wordCount: contentText.split(' ').length,
        readabilityScore: 60
      };
    }

    console.log('Generating featured image...');

    // Step 2: Generate featured image
    const imagePrompt = `Create a professional, high-quality featured image for a blog post about "${keyword}".

The image should be:
- Modern and sleek exhibition stand design
- Professional color scheme (blues, whites, grays)
- Clean and minimalist aesthetic
- Suitable for a business blog header
- 1536x1024 aspect ratio (landscape)
- No text overlay

Style: Photorealistic, modern, professional, clean lines`;

    const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: imagePrompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    let featuredImageUrl = null;
    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      const base64Image = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (base64Image) {
        console.log('Featured image generated, uploading to storage...');
        
        // Upload image to Supabase storage
        const imageBuffer = Uint8Array.from(atob(base64Image.split(',')[1]), c => c.charCodeAt(0));
        const fileName = `blog/${Date.now()}-${keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, imageBuffer, {
            contentType: 'image/png',
            cacheControl: '3600'
          });

        if (uploadError) {
          console.error('Image upload error:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(fileName);
          featuredImageUrl = publicUrl;
          console.log('Image uploaded successfully:', featuredImageUrl);
        }
      }
    } else {
      console.error('Image generation failed:', await imageResponse.text());
    }

    // Step 3: Generate slug from title
    const slug = articleData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Step 4: Calculate quality score
    const qualityScore = calculateQualityScore({
      ...articleData,
      featuredImage: featuredImageUrl
    });

    // Step 5: Save to database
    console.log('Saving blog post to database...');
    const { data: postData, error: postError } = await supabase
      .from('blog_posts')
      .insert({
        title: articleData.title,
        slug,
        content: articleData.content,
        meta_description: articleData.metaDescription,
        keywords: articleData.keywords,
        featured_image_url: featuredImageUrl,
        status: 'draft',
        readability_score: articleData.readabilityScore || 0,
        quality_score: qualityScore,
        word_count: articleData.wordCount || 0,
        ctas: articleData.ctas || [],
        internal_links: articleData.internalLinks || [],
        generated_keyword: keyword,
        ai_metadata: {
          generatedAt: new Date().toISOString(),
          model: 'google/gemini-2.5-flash',
        }
      })
      .select()
      .single();

    if (postError) {
      console.error('Error saving blog post:', postError);
      throw postError;
    }

    console.log('Blog post saved with ID:', postData.id);

    // Step 6: Assign categories if provided
    if (categoryIds && categoryIds.length > 0) {
      console.log('Assigning categories:', categoryIds);
      const categoryInserts = categoryIds.map((categoryId: string) => ({
        post_id: postData.id,
        category_id: categoryId
      }));

      const { error: categoryError } = await supabase
        .from('blog_post_categories')
        .insert(categoryInserts);

      if (categoryError) {
        console.error('Error assigning categories:', categoryError);
      }
    }

    console.log('Blog post generation completed successfully');

    return new Response(JSON.stringify({
      success: true,
      post: {
        id: postData.id,
        title: postData.title,
        slug: postData.slug,
        qualityScore,
        readabilityScore: articleData.readabilityScore,
        wordCount: articleData.wordCount,
        featuredImageUrl
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-blog-post:', error);
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

function calculateQualityScore(article: any): number {
  let score = 100;
  
  // Word count check (1500-2500 is ideal)
  if (article.wordCount < 1500) score -= 10;
  if (article.wordCount < 1000) score -= 20;
  if (article.wordCount > 3000) score -= 5;
  
  // Meta description length check
  if (article.metaDescription.length < 150 || article.metaDescription.length > 160) score -= 5;
  
  // Title length check
  if (article.title.length < 50 || article.title.length > 70) score -= 5;
  
  // Internal links check
  if (article.internalLinks.length < 5) score -= 10;
  if (article.internalLinks.length < 3) score -= 10;
  
  // CTAs check
  if (article.ctas.length < 3) score -= 10;
  
  // Keywords check
  if (!article.keywords || article.keywords.length < 3) score -= 5;
  
  // Featured image check
  if (!article.featuredImage) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}
