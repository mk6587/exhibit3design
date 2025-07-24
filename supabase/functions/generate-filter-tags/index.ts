import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, longDescription, specifications, price } = await req.json();

    const prompt = `Analyze this exhibition stand product and generate appropriate filter tags. Based on the product details, determine the most accurate tags from these categories:

STAND SIZE: Small, Medium, Large, Custom Size
STAND TYPE: 1 side open, 2-sided open, 3-sided open, Island, L-shaped  
KEY FEATURES: Hanging Banner, Double-Decker, Meeting Area, Product Display, Wall Screen, Info Desk, Storage, Seating Area
STAND STYLE: Futuristic, Economy, Luxury, Minimal, Welcoming (open space), Curve style

Product Details:
Title: ${title}
Description: ${description || 'N/A'}
Long Description: ${longDescription || 'N/A'}
Specifications: ${specifications || 'N/A'}
Price: $${price}

Return ONLY a JSON object with this exact structure:
{
  "standSize": [],
  "standType": [],
  "keyFeatures": [],
  "standStyle": []
}

Fill arrays with applicable tags from the categories above. Be precise and only include tags that clearly apply based on the product details.`;

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