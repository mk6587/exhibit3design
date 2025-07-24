import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

console.log('Generate filter tags function started');

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Function called with method:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Parsing request body...');
    const { title, description, longDescription, specifications, price } = await req.json();
    console.log('Request data:', { title, description: description?.substring(0, 50) + '...', price });
    
    console.log('Anthropic API key available:', !!anthropicApiKey);

    const prompt = `CRITICAL: You must ONLY select tags from the predefined categories below. DO NOT create new tags or variations. Only match the product to existing tags from these exact lists:

STAND SIZE (choose ONLY from these): Small, Medium, Large, Custom Size
STAND TYPE (choose ONLY from these): 1 side open, 2-sided open, 3-sided open, Island, L-shaped  
KEY FEATURES (choose ONLY from these): Hanging Banner, Double-Decker, Meeting Area, Product Display, Wall Screen, Info Desk, Storage, Seating Area
STAND STYLE (choose ONLY from these): Futuristic, Economy, Luxury, Minimal, Welcoming (open space), Curve style

Analyze this exhibition stand product and determine which of the above predefined tags apply. You must ONLY use the exact tag names listed above - no variations, no new tags, no modifications.

Product Details:
Title: ${title}
Description: ${description || 'N/A'}
Long Description: ${longDescription || 'N/A'}
Specifications: ${specifications || 'N/A'}
Price: $${price}

IMPORTANT RULES:
1. ONLY select tags from the exact lists provided above
2. Use the EXACT spelling and capitalization shown
3. If a product doesn't clearly match a tag, don't include it
4. Be conservative - only include tags you're confident about
5. Return ONLY the JSON object with no additional text

Return ONLY this JSON structure:
{
  "standSize": [],
  "standType": [],
  "keyFeatures": [],
  "standStyle": []
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        system: 'You are an expert in exhibition stands and trade show displays. Analyze product details and return accurate filter tags in the exact JSON format requested. Return ONLY valid JSON, no additional text or formatting.'
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text.trim();
    
    // Parse the JSON response
    const filterTags = JSON.parse(content);
    
    // Generate prefixed filter tags
    const tags: string[] = [];
    filterTags.standSize?.forEach((size: string) => tags.push(`filter:size:${size}`));
    filterTags.standType?.forEach((type: string) => tags.push(`filter:type:${type}`));
    filterTags.keyFeatures?.forEach((feature: string) => tags.push(`filter:feature:${feature}`));
    filterTags.standStyle?.forEach((style: string) => tags.push(`filter:style:${style}`));

    return new Response(JSON.stringify({ 
      filterTags,
      generatedTags: tags 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-filter-tags function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      filterTags: { standSize: [], standType: [], keyFeatures: [], standStyle: [] },
      generatedTags: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});