import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { username, email, password } = await req.json()

    if (!username || !email || !password) {
      return new Response(
        JSON.stringify({ error: 'Username, email, and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user already exists in auth
    let authUser;
    
    // First try to get existing user by email
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers.users?.find(user => user.email === email);
    
    if (existingUser) {
      // User already exists, use existing user
      authUser = existingUser;
      console.log('Using existing auth user:', existingUser.id);
    } else {
      // Create new user in auth.users
      const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email for admin users
      });

      if (authError) {
        console.error('Auth error:', authError);
        return new Response(
          JSON.stringify({ error: 'Failed to create user', details: authError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!newAuthUser.user) {
        return new Response(
          JSON.stringify({ error: 'Failed to create user' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      authUser = newAuthUser.user;
    }

    // Check if admin record already exists
    const { data: existingAdmin } = await supabaseAdmin
      .from('admins')
      .select('id')
      .eq('user_id', authUser.id)
      .single();

    if (existingAdmin) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Admin user already exists',
          admin: {
            id: existingAdmin.id,
            username,
            email
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add user to admins table
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('admins')
      .insert({
        user_id: authUser.id,
        username,
        email,
        is_active: true
      })
      .select()
      .single()

    if (adminError) {
      console.error('Admin table error:', adminError)
      
      // Only cleanup if we created a new user
      if (!existingUsers.users?.find(user => user.email === email)) {
        await supabaseAdmin.auth.admin.deleteUser(authUser.id)
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to create admin record', details: adminError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin user created successfully',
        admin: {
          id: adminData.id,
          username: adminData.username,
          email: adminData.email
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})