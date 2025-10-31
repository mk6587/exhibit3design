import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateAgentRequest {
  agentId: string;
  username?: string;
  email?: string;
  password?: string;
  role?: string;
  isActive?: boolean;
}

/**
 * Hash password using PBKDF2 (matches create-admin-agent)
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordData = encoder.encode(password);
  
  const key = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    256
  );
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const saltArray = Array.from(salt);
  
  const combined = [...saltArray, ...hashArray];
  return combined.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authenticate the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check if user has super admin role
    const { data: roleCheck, error: roleError } = await supabaseAdmin.rpc('has_super_admin_role', {
      _user_id: user.id
    });

    if (roleError || !roleCheck) {
      return new Response(
        JSON.stringify({ success: false, error: 'Super admin privileges required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    const { agentId, username, email, password, role, isActive } = await req.json() as UpdateAgentRequest;

    console.log('Updating admin agent:', agentId);

    // Prepare update data for admin_agents
    const agentUpdate: any = {
      updated_at: new Date().toISOString()
    };

    if (username !== undefined) agentUpdate.username = username;
    if (email !== undefined) agentUpdate.email = email;
    if (password) {
      agentUpdate.password_hash = await hashPassword(password);
    }
    if (isActive !== undefined) agentUpdate.is_active = isActive;

    // Update admin_agents table
    const { error: agentUpdateError } = await supabaseAdmin
      .from('admin_agents')
      .update(agentUpdate)
      .eq('id', agentId);

    if (agentUpdateError) {
      console.error('Error updating admin agent:', agentUpdateError);
      return new Response(
        JSON.stringify({ success: false, error: agentUpdateError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Update admins table
    const adminsUpdate: any = {
      updated_at: new Date().toISOString()
    };
    if (username !== undefined) adminsUpdate.username = username;
    if (email !== undefined) adminsUpdate.email = email;
    if (isActive !== undefined) adminsUpdate.is_active = isActive;

    const { error: adminsUpdateError } = await supabaseAdmin
      .from('admins')
      .update(adminsUpdate)
      .eq('admin_agent_id', agentId);

    if (adminsUpdateError) {
      console.error('Error updating admins table:', adminsUpdateError);
    }

    // Update role if changed
    if (role !== undefined) {
      const { error: roleUpdateError } = await supabaseAdmin
        .from('user_roles')
        .update({ role })
        .eq('admin_agent_id', agentId);

      if (roleUpdateError) {
        console.error('Error updating role:', roleUpdateError);
      }
    }

    console.log('Admin agent updated successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Admin agent updated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in update-admin-agent:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
