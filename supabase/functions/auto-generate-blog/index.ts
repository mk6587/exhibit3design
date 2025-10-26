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

    // Step 4: Load all 200+ topics from complete list
    const topics = [
      // A. AI Exhibition Design
      { keyword: "How AI is transforming exhibition stand design", category: "A" },
      { keyword: "Top 10 benefits of using AI in booth design", category: "A" },
      { keyword: "AI vs. traditional 3D design — what's faster and smarter?", category: "A" },
      { keyword: "How AI saves hours in trade show visualization", category: "A" },
      { keyword: "AI exhibition design workflow: from idea to render", category: "A" },
      { keyword: "Common mistakes AI tools can fix in booth layouts", category: "A" },
      { keyword: "Real-world examples of AI-powered stand design", category: "A" },
      { keyword: "How AI improves creativity for exhibition designers", category: "A" },
      { keyword: "Why every stand designer should try AI visualization tools", category: "A" },
      { keyword: "How to turn your concept sketch into a 3D AI render", category: "A" },
      
      // B. 3D Booth Design
      { keyword: "How to create realistic booth renders", category: "B" },
      { keyword: "Top 5 3D modeling software for exhibition designers", category: "B" },
      { keyword: "How to export your SketchUp booth for AI enhancement", category: "B" },
      { keyword: "3D lighting setup tips for booth realism", category: "B" },
      { keyword: "Differences between 3D renders and AI renders", category: "B" },
      { keyword: "3D modeling mistakes to avoid in trade show design", category: "B" },
      { keyword: "How to make small booths look bigger in renders", category: "B" },
      { keyword: "3D texturing tips for exhibition walls and floors", category: "B" },
      { keyword: "AI vs. CGI — which gives better booth visuals?", category: "B" },
      { keyword: "How to make exhibition booths look photorealistic", category: "B" },
      
      // C. AI Tools Tutorials
      { keyword: "How to use the Add Visitors AI tool effectively", category: "C" },
      { keyword: "Creating rotating booth videos with AI in seconds", category: "C" },
      { keyword: "Using Magic Edit to customize your exhibition visuals", category: "C" },
      { keyword: "How to make artistic sketch versions of your booth", category: "C" },
      { keyword: "Combining multiple AI tools for faster workflow", category: "C" },
      { keyword: "How to turn a static render into an AI walkthrough video", category: "C" },
      { keyword: "Add visitors that match your booth's lighting and angle", category: "C" },
      { keyword: "How AI identifies booth perspective for edits", category: "C" },
      { keyword: "Step-by-step: from upload to finished AI render", category: "C" },
      { keyword: "AI tools every exhibition designer should try", category: "C" },
      
      // D. Ready-Made Files
      { keyword: "Why ready-made booth designs save time and money", category: "D" },
      { keyword: "How to customize Exhibit3Design files for your brand", category: "D" },
      { keyword: "What's included in a booth design package (SKP, 3DS, etc.)", category: "D" },
      { keyword: "Best ways to modify booth materials and colors", category: "D" },
      { keyword: "How to import Exhibit3Design files into SketchUp", category: "D" },
      { keyword: "Real examples: transforming a ready-made booth with AI", category: "D" },
      { keyword: "How to adapt designs for small trade shows", category: "D" },
      { keyword: "The difference between economy and premium booth files", category: "D" },
      { keyword: "How ready-made designs help agencies pitch faster", category: "D" },
      { keyword: "Why contractors prefer using predesigned AI booths", category: "D" },
      
      // E. Strategy & Planning
      { keyword: "How design impacts booth visitor flow", category: "E" },
      { keyword: "The psychology behind booth layouts", category: "E" },
      { keyword: "How to design stands that attract more visitors", category: "E" },
      { keyword: "Lighting strategies for trade show booths", category: "E" },
      { keyword: "How to design small booths effectively", category: "E" },
      { keyword: "Best booth designs for technology exhibitions", category: "E" },
      { keyword: "How to plan modular exhibition stands", category: "E" },
      { keyword: "Common trade show design mistakes", category: "E" },
      { keyword: "Exhibition design tips for startups", category: "E" },
      { keyword: "How to present your booth concept to clients", category: "E" },
      
      // F. Creative Inspiration
      { keyword: "Before and after: booth transformation with AI", category: "F" },
      { keyword: "10 inspiring AI-generated booth visuals", category: "F" },
      { keyword: "How AI helps create futuristic exhibition concepts", category: "F" },
      { keyword: "AI ideas for themed booths (sports, fashion, tech)", category: "F" },
      { keyword: "How AI boosts creative exploration for designers", category: "F" },
      { keyword: "Concept to reality: visualizing booth designs with AI", category: "F" },
      { keyword: "AI design experiments — pushing the limits of exhibition art", category: "F" },
      { keyword: "AI-generated color palettes for booth design", category: "F" },
      { keyword: "Using AI to test different lighting moods", category: "F" },
      { keyword: "How AI helps predict crowd behavior in booth spaces", category: "F" },
      
      // G. Workflow Optimization
      { keyword: "Top AI tools for 3D design professionals", category: "G" },
      { keyword: "How to combine AI tools with existing 3D workflows", category: "G" },
      { keyword: "Saving time with AI-powered rendering", category: "G" },
      { keyword: "How to automate repetitive design tasks", category: "G" },
      { keyword: "File management tips for 3D designers", category: "G" },
      { keyword: "How to use Exhibit3Design AI for client revisions", category: "G" },
      { keyword: "Improving workflow between AI and CAD tools", category: "G" },
      { keyword: "How to prepare your file for AI processing", category: "G" },
      { keyword: "3D file formats explained for exhibition designers", category: "G" },
      { keyword: "How AI simplifies booth material selection", category: "G" },
      
      // H. Marketing & Presentation
      { keyword: "How to make AI visuals more client-ready", category: "H" },
      { keyword: "Creating pitch decks using AI renders", category: "H" },
      { keyword: "How AI visuals improve client communication", category: "H" },
      { keyword: "Using rotating videos in client proposals", category: "H" },
      { keyword: "How to create booth teasers for LinkedIn or Instagram", category: "H" },
      { keyword: "5 ways to impress clients using AI presentations", category: "H" },
      { keyword: "How to showcase AI visuals in your portfolio", category: "H" },
      { keyword: "Creating booth videos for social media", category: "H" },
      { keyword: "Case study: winning a client with AI-generated visuals", category: "H" },
      { keyword: "How AI helps marketing teams preview booth traffic", category: "H" },
      
      // I. Regional & Industry
      { keyword: "Popular exhibition design styles in Europe", category: "I" },
      { keyword: "Booth trends in Dubai and the UAE", category: "I" },
      { keyword: "German exhibition design aesthetics", category: "I" },
      { keyword: "Italian design influence in modern trade shows", category: "I" },
      { keyword: "How AI supports global exhibition design teams", category: "I" },
      { keyword: "Sustainable booth design trends in 2025", category: "I" },
      { keyword: "Minimalist vs. immersive exhibition layouts", category: "I" },
      { keyword: "Luxury booth design ideas for premium brands", category: "I" },
      { keyword: "Top European exhibitions and booth design insights", category: "I" },
      { keyword: "Cultural differences in exhibition stand design", category: "I" },
      
      // J. For Professionals
      { keyword: "How exhibition contractors can use AI tools", category: "J" },
      { keyword: "AI tools for freelance exhibition designers", category: "J" },
      { keyword: "Why marketing teams benefit from AI visuals", category: "J" },
      { keyword: "AI solutions for event organizers", category: "J" },
      { keyword: "How 3D artists can collaborate with Exhibit3Design", category: "J" },
      { keyword: "What architects can learn from exhibition design", category: "J" },
      { keyword: "AI tools that help freelancers scale faster", category: "J" },
      { keyword: "How to showcase AI work to attract new clients", category: "J" },
      { keyword: "The future of exhibition design careers with AI", category: "J" },
      { keyword: "How small businesses can afford professional booth visuals", category: "J" },
      
      // K. Education & Learning
      { keyword: "Best online courses for exhibition design", category: "K" },
      { keyword: "How to learn 3D visualization for trade shows", category: "K" },
      { keyword: "Understanding booth proportions and visitor flow", category: "K" },
      { keyword: "Basic principles of exhibition space design", category: "K" },
      { keyword: "How to present design ideas effectively", category: "K" },
      { keyword: "Building a portfolio with AI exhibition visuals", category: "K" },
      { keyword: "Exhibition design terms every beginner should know", category: "K" },
      { keyword: "How to price your design services competitively", category: "K" },
      { keyword: "How AI helps teach design visualization", category: "K" },
      { keyword: "Tips for mastering SketchUp for exhibition work", category: "K" },
      
      // L. Case Studies
      { keyword: "Case Study: transforming a plain booth with AI", category: "L" },
      { keyword: "How AI cut design time from 2 days to 20 minutes", category: "L" },
      { keyword: "Booth redesign before & after AI", category: "L" },
      { keyword: "Client story: selling faster with AI renders", category: "L" },
      { keyword: "How one contractor impressed clients using AI visitors", category: "L" },
      { keyword: "Behind the scenes of AI-generated booth concepts", category: "L" },
      { keyword: "AI-driven creativity for small event agencies", category: "L" },
      { keyword: "Time-saved analysis using Exhibit3Design tools", category: "L" },
      { keyword: "Comparison: manual vs. AI-enhanced rendering", category: "L" },
      { keyword: "Interview with an exhibition designer using AI", category: "L" },
      
      // M. Thought Leadership
      { keyword: "The future of AI in exhibition and event design", category: "M" },
      { keyword: "Can AI replace designers or just empower them?", category: "M" },
      { keyword: "Ethical design in AI-generated visuals", category: "M" },
      { keyword: "How AI can help achieve sustainability in events", category: "M" },
      { keyword: "Why visual storytelling matters in trade shows", category: "M" },
      { keyword: "The evolution of exhibition design tools", category: "M" },
      { keyword: "How design speed defines competitive agencies", category: "M" },
      { keyword: "The intersection of art, tech, and exhibition design", category: "M" },
      { keyword: "Predicting booth design trends for 2026", category: "M" },
      { keyword: "How AI personalizes visual design experiences", category: "M" },
      
      // N. Product Announcements
      { keyword: "Introducing the Add Visitors AI tool", category: "N" },
      { keyword: "Introducing the Magic Edit feature", category: "N" },
      { keyword: "How to generate rotating videos instantly", category: "N" },
      { keyword: "New update: faster AI rendering speeds", category: "N" },
      { keyword: "Premium plan comparison: what's new", category: "N" },
      { keyword: "Free token policy explained", category: "N" },
      { keyword: "AI sketch rendering — now available", category: "N" },
      { keyword: "How premium users can edit videos", category: "N" },
      { keyword: "Mobile-friendly updates for designers", category: "N" },
      { keyword: "Exhibit3Design Studio roadmap for next features", category: "N" },
      
      // O. SEO & Long-Tail
      { keyword: "Best AI tool for exhibition designers", category: "O" },
      { keyword: "Exhibition design software with AI integration", category: "O" },
      { keyword: "How to design trade show booths online", category: "O" },
      { keyword: "Free tools for booth designers", category: "O" },
      { keyword: "Exhibition stand design ideas 2025", category: "O" },
      { keyword: "3D trade show booth generator", category: "O" },
      { keyword: "How to create realistic booth videos online", category: "O" },
      { keyword: "Exhibition booth visualization software", category: "O" },
      { keyword: "Top digital tools for event designers", category: "O" },
      { keyword: "How AI simplifies exhibition concept design", category: "O" },
      
      // P. Multimedia / Social
      { keyword: "10-second demo: adding visitors with AI", category: "P" },
      { keyword: "Short video: turning 3D booths into rotating visuals", category: "P" },
      { keyword: "Time-lapse: booth creation in 30 seconds", category: "P" },
      { keyword: "Before & after video using Magic Edit", category: "P" },
      { keyword: "Design vs. AI Design comparison carousel", category: "P" },
      { keyword: "Tutorial reel: edit objects in one click", category: "P" },
      { keyword: "Client reaction video to AI render", category: "P" },
      { keyword: "Image post: artistic sketch transformation", category: "P" },
      { keyword: "Post: From static to spinning in seconds", category: "P" },
      { keyword: "Showcase: AI booth video demo for LinkedIn", category: "P" },
      
      // Q. Comparisons & Reviews
      { keyword: "Exhibit3Design vs. traditional design workflows", category: "Q" },
      { keyword: "Best AI design platforms compared", category: "Q" },
      { keyword: "How AI renders stack up against manual visualization", category: "Q" },
      { keyword: "Review: Exhibit3Design vs. Midjourney for architecture", category: "Q" },
      { keyword: "Why Exhibit3Design is built for exhibitions, not generic AI", category: "Q" },
      { keyword: "3D designers' feedback on AI tools", category: "Q" },
      { keyword: "Comparing booth visualization platforms", category: "Q" },
      { keyword: "Exhibit3Design performance benchmarks", category: "Q" },
      { keyword: "User testimonials and design results", category: "Q" },
      { keyword: "Review roundup: exhibition designers using AI", category: "Q" },
      
      // R. Integration & Compatibility
      { keyword: "How to integrate AI visuals into SketchUp projects", category: "R" },
      { keyword: "Exporting 3D models for AI rendering", category: "R" },
      { keyword: "Combining AI renders with Unreal Engine visuals", category: "R" },
      { keyword: "Importing Exhibit3Design files into Blender", category: "R" },
      { keyword: "Using AI outputs in PowerPoint or client decks", category: "R" },
      { keyword: "AI workflow with AutoCAD", category: "R" },
      { keyword: "Exporting rotating videos for social media", category: "R" },
      { keyword: "Combining AI renders with product animations", category: "R" },
      { keyword: "Adding branding to AI exhibition renders", category: "R" },
      { keyword: "Best file formats for cross-platform editing", category: "R" },
      
      // S. Miscellaneous / Creative
      { keyword: "Design challenges: AI vs human creativity", category: "S" },
      { keyword: "Exhibition color psychology and AI suggestions", category: "S" },
      { keyword: "How AI tools inspire new booth ideas", category: "S" },
      { keyword: "Future of AI video rendering in trade shows", category: "S" },
      { keyword: "Exploring minimalist booth design styles", category: "S" },
      { keyword: "Exhibition lighting tips for visual harmony", category: "S" },
      { keyword: "Why movement makes booth visuals stand out", category: "S" },
      { keyword: "3D perspective tricks using AI tools", category: "S" },
      { keyword: "Creating mood boards for trade show booths", category: "S" },
      { keyword: "Using AI for quick exhibition proposals", category: "S" },
      
      // T. Conversion & Education
      { keyword: "How to get started with Exhibit3Design AI tools", category: "T" },
      { keyword: "How to use your 2 free AI tokens wisely", category: "T" },
      { keyword: "Step-by-step: generating your first booth video", category: "T" },
      { keyword: "How to choose between free and premium plans", category: "T" },
      { keyword: "Why AI booth videos increase client engagement", category: "T" },
      { keyword: "How to prepare files for AI Magic Edit", category: "T" },
      { keyword: "When to use sketches vs. photorealistic renders", category: "T" },
      { keyword: "5 fastest ways to create exhibition visuals with AI", category: "T" },
      { keyword: "How to optimize your design workflow for AI tools", category: "T" },
      { keyword: "What makes Exhibit3Design different from other AI design platforms", category: "T" },
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
