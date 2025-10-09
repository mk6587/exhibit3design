import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, prompt, duration, userId } = await req.json();

    if (!imageUrl || !prompt || !duration || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: imageUrl, prompt, duration, userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // TODO: Add video seconds deduction logic here
    // Check if user has enough video seconds
    // Deduct requested duration from user's video_seconds_balance

    const RUNWARE_API_KEY = Deno.env.get('RUNWARE_API_KEY');
    if (!RUNWARE_API_KEY) {
      console.error('RUNWARE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Making request to Runware API for video generation (${duration}s)`);
    
    // Call Runware API for video generation using Kling 2.5 Turbo Pro
    const runwareResponse = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          taskType: 'authentication',
          apiKey: RUNWARE_API_KEY,
        },
        {
          taskType: 'videoInference',
          taskUUID: crypto.randomUUID(),
          positivePrompt: prompt,
          model: 'kling-turbo-pro', // Kling 2.5 Turbo Pro
          inputImage: imageUrl,
          duration: duration,
          outputFormat: 'MP4',
        }
      ])
    });

    if (!runwareResponse.ok) {
      const errorText = await runwareResponse.text();
      console.error('Runware API error:', runwareResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Video generation failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await runwareResponse.json();
    console.log('Runware API response:', JSON.stringify(result));

    // Extract video URL from response
    const videoUrl = result.data?.[0]?.videoURL || result.data?.[0]?.imageURL;
    
    if (!videoUrl) {
      return new Response(
        JSON.stringify({ error: 'No video URL in response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        videoUrl: videoUrl,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in runware-video-generation:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});