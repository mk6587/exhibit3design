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

    // Create user in auth.users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for admin users
    })

    if (authError) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Failed to create user', details: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!authUser.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Add user to admins table
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('admins')
      .insert({
        user_id: authUser.user.id,
        username,
        email,
        is_active: true
      })
      .select()
      .single()

    if (adminError) {
      console.error('Admin table error:', adminError)
      // Cleanup: delete the auth user if admin creation failed
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      
      return new Response(
        JSON.stringify({ error: 'Failed to create admin record', details: adminError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Add admin role to user_roles table
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authUser.user.id,
        role: 'admin'
      })

    if (roleError) {
      console.error('User roles table error:', roleError)
      // Cleanup: delete admin record and auth user if role creation failed
      await supabaseAdmin.from('admins').delete().eq('user_id', authUser.user.id)
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      
      return new Response(
        JSON.stringify({ error: 'Failed to create admin role', details: roleError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin user created successfully with admin role',
        admin: {
          id: adminData.id,
          username: adminData.username,
          email: adminData.email,
          role: 'admin'
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