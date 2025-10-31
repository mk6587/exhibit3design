import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// Hash password using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verify the caller is a super admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if caller is super admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .rpc('has_super_admin_role', { p_user_id: user.id })

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: 'Access denied: Super Admin privileges required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { username, email, password, role } = await req.json()

    // Validate inputs
    if (!username || !email || !password || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (username.length < 3 || username.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Username must be between 3 and 50 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!['super_admin', 'content_creator', 'operator'].includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Invalid role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if email or username already exists in admin_agents
    const { data: existingAgent } = await supabaseAdmin
      .from('admin_agents')
      .select('email, username')
      .or(`email.eq.${email},username.eq.${username}`)
      .single()

    if (existingAgent) {
      const field = existingAgent.email === email ? 'email' : 'username'
      return new Response(
        JSON.stringify({ error: `This ${field} is already registered in the system` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Hash the password
    const passwordHash = await hashPassword(password)

    // Create admin agent
    const { data: newAgent, error: createAgentError } = await supabaseAdmin
      .from('admin_agents')
      .insert({
        username,
        email,
        password_hash: passwordHash,
        is_active: true
      })
      .select()
      .single()

    if (createAgentError) {
      console.error('Error creating admin agent:', createAgentError)
      return new Response(
        JSON.stringify({ error: createAgentError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!newAgent) {
      throw new Error('Admin agent creation failed')
    }

    try {
      // Insert into admins table
      const { error: adminError } = await supabaseAdmin
        .from('admins')
        .insert({
          admin_agent_id: newAgent.id,
          username,
          email,
          is_active: true
        })

      if (adminError) {
        // Rollback: delete the admin agent
        await supabaseAdmin.from('admin_agents').delete().eq('id', newAgent.id)
        throw adminError
      }

      // Insert role
      const { error: roleInsertError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          admin_agent_id: newAgent.id,
          role
        })

      if (roleInsertError) {
        // Rollback: delete admin and admin agent
        await supabaseAdmin.from('admins').delete().eq('admin_agent_id', newAgent.id)
        await supabaseAdmin.from('admin_agents').delete().eq('id', newAgent.id)
        throw roleInsertError
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Admin agent created successfully',
          agentId: newAgent.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (error) {
      console.error('Error in admin creation:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})