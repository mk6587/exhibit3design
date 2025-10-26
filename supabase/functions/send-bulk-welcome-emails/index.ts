import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailResult {
  email: string;
  success: boolean;
  error?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📧 Starting bulk welcome email sending...');

    // Initialize Supabase client with service role key for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all users from auth.users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch users', details: usersError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Found ${users.users.length} users to send emails to`);

    const results: EmailResult[] = [];

    // Send welcome email to each user
    for (const user of users.users) {
      if (!user.email) {
        console.log(`⚠️ Skipping user ${user.id} - no email address`);
        continue;
      }

      console.log(`📤 Sending welcome email to ${user.email}`);

      try {
        // Get user profile for first name
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('user_id', user.id)
          .single();

        // Call send-email function
        const { error: emailError } = await supabase.functions.invoke('send-email', {
          body: {
            to: user.email,
            subject: 'Welcome to Exhibit3Design - Your 2 FREE AI Tokens Are Ready!',
            template: {
              name: 'welcome-email',
              props: {
                user_email: user.email,
                first_name: profile?.first_name || null,
                ai_studio_url: 'https://fipebdkvzdrljwwxccrj.supabase.co'
              }
            }
          }
        });

        if (emailError) {
          console.error(`❌ Failed to send email to ${user.email}:`, emailError);
          results.push({ email: user.email, success: false, error: emailError.message });
        } else {
          console.log(`✅ Successfully sent email to ${user.email}`);
          results.push({ email: user.email, success: true });
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error: any) {
        console.error(`❌ Error sending email to ${user.email}:`, error);
        results.push({ email: user.email, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`✅ Bulk email sending complete: ${successCount} successful, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        total: results.length,
        successful: successCount,
        failed: failureCount,
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Unexpected error in bulk email sending:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
