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
    const { context, contentType, currentContent } = await req.json();

    let prompt = '';
    
    switch (contentType) {
      case 'description':
        prompt = `Generate a professional HTML product description for an exhibition stand product. Use the context provided to create engaging, detailed content that highlights key features and benefits.

Context: ${context}
Current content (for reference): ${currentContent || 'None'}

Requirements:
- Write in HTML format with proper tags (p, ul, li, h4, etc.)
- Focus on benefits and features that matter to trade show exhibitors
- Include specific details about functionality, design, and impact
- Use professional, marketing-friendly language
- Make it engaging and persuasive
- Highlight unique selling points

Generate only the HTML content, no additional text or explanations.`;
        break;
        
      case 'specification':
        prompt = `Generate detailed technical specifications in HTML format for an exhibition stand product based on the provided context.

Context: ${context}
Current content (for reference): ${currentContent || 'None'}

Requirements:
- Write in HTML format with proper structure (h4, ul, li tags)
- Include technical details like dimensions, materials, setup requirements
- Focus on practical specifications that buyers need to know
- Be specific and accurate based on the context provided
- Include categories like Structure, Dimensions, Materials, Setup, Power requirements
- Use professional technical language

Generate only the HTML content, no additional text or explanations.`;
        break;
        
      case 'basic-info':
        prompt = `Generate a concise, compelling product summary for an exhibition stand product based on the provided context.

Context: ${context}
Current content (for reference): ${currentContent || 'None'}

Requirements:
- Write 2-3 sentences maximum
- Focus on the key value proposition and target audience
- Highlight what makes this product special
- Use professional, engaging language
- No HTML tags needed - plain text only
- Make it suitable for product listings and quick overviews

Generate only the text content, no additional formatting or explanations.`;
        break;
        
      default:
        throw new Error('Invalid content type');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        system: 'You are an expert content writer specializing in exhibition stands and trade show displays. Generate high-quality, professional content that helps businesses showcase their products effectively.'
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.content[0].text.trim();

    return new Response(JSON.stringify({ 
      generatedContent 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      generatedContent: ''
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});