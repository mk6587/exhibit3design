import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface ApplicationSubmission {
  jobSlug: string;
  fullName: string;
  email: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  coverNote?: string;
  resumeFile: {
    name: string;
    type: string;
    size: number;
    data: string; // base64
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get JWT from authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create regular client for auth
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Parse request body
    const body: ApplicationSubmission = await req.json();
    const { jobSlug, fullName, email, linkedinUrl, portfolioUrl, coverNote, resumeFile } = body;

    console.log('Processing application for user:', user.id, 'job:', jobSlug);

    // Validate required fields
    if (!jobSlug || !fullName || !email || !resumeFile) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(resumeFile.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Only PDF and DOC/DOCX files are allowed.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate file size
    if (resumeFile.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: 'File size exceeds 10MB limit' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check token eligibility (server-side verification)
    const { data: eligibilityData, error: eligibilityError } = await supabase
      .rpc('check_application_eligibility', { p_user_id: user.id });

    if (eligibilityError) {
      console.error('Error checking eligibility:', eligibilityError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify eligibility' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!eligibilityData.eligible) {
      console.log('User not eligible:', eligibilityData.reason);
      return new Response(
        JSON.stringify({ 
          error: 'You must use at least 1 AI token before applying',
          reason: eligibilityData.reason 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Check rate limit
    const { data: rateLimitData, error: rateLimitError } = await supabase
      .rpc('check_application_rate_limit', { 
        p_user_id: user.id,
        p_job_slug: jobSlug 
      });

    if (rateLimitError) {
      console.error('Error checking rate limit:', rateLimitError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify rate limit' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!rateLimitData.allowed) {
      if (rateLimitData.has_existing_application) {
        return new Response(
          JSON.stringify({ 
            error: 'You have already applied for this position',
            reason: 'duplicate_application' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: `Maximum application attempts (${rateLimitData.max_attempts}) reached. Please try again later.`,
          reason: 'rate_limit_exceeded',
          resetTime: rateLimitData.reset_time
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      );
    }

    // Log attempt
    const { error: attemptError } = await supabaseService
      .from('application_attempts')
      .insert({
        user_id: user.id,
        job_slug: jobSlug,
      });

    if (attemptError) {
      console.error('Error logging attempt:', attemptError);
      // Continue anyway - this shouldn't block the application
    }

    // Upload resume to storage
    const fileExtension = resumeFile.name.split('.').pop() || 'pdf';
    const timestamp = Date.now();
    const fileName = `${timestamp}_${resumeFile.name}`;
    const filePath = `${user.id}/${fileName}`;

    // Decode base64 file data
    const base64Data = resumeFile.data.split(',')[1] || resumeFile.data;
    const fileBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    console.log('Uploading resume to storage:', filePath);

    const { data: uploadData, error: uploadError } = await supabaseService.storage
      .from('resumes')
      .upload(filePath, fileBuffer, {
        contentType: resumeFile.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload resume' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Get public URL (even though bucket is private, we store the path)
    const { data: { publicUrl } } = supabaseService.storage
      .from('resumes')
      .getPublicUrl(filePath);

    console.log('Resume uploaded successfully:', publicUrl);

    // Create application record
    const { data: applicationData, error: applicationError } = await supabaseService
      .from('career_applications')
      .insert({
        user_id: user.id,
        job_slug: jobSlug,
        full_name: fullName,
        email: email,
        linkedin_url: linkedinUrl || null,
        portfolio_url: portfolioUrl || null,
        cover_note: coverNote || null,
        resume_url: publicUrl,
        token_usage_snapshot: eligibilityData.used_count,
        status: 'pending',
      })
      .select()
      .single();

    if (applicationError) {
      console.error('Error creating application:', applicationError);
      
      // Clean up uploaded file
      await supabaseService.storage.from('resumes').remove([filePath]);
      
      return new Response(
        JSON.stringify({ error: 'Failed to submit application' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Application created successfully:', applicationData.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        applicationId: applicationData.id,
        message: 'Application submitted successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
