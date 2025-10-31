import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyRequest {
  email: string;
  password: string;
}

/**
 * Verify password against PBKDF2 hash (matches create-admin-agent format)
 * Format: salt (16 bytes) + hash (32 bytes) as hex string
 */
async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const combined = storedHash.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || [];
    
    const salt = new Uint8Array(combined.slice(0, 16));
    const storedHashBytes = combined.slice(16);
    
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
    
    // Constant-time comparison
    return hashArray.length === storedHashBytes.length &&
      hashArray.every((byte, i) => byte === storedHashBytes[i]);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, password } = await req.json() as VerifyRequest;
    
    console.log('Verifying admin agent:', email);

    // Check if agent exists
    const { data: agent, error: agentError } = await supabase
      .from('admin_agents')
      .select('id, email, username, password_hash, is_active')
      .eq('email', email)
      .single();

    if (agentError || !agent) {
      console.log('Admin agent not found');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid credentials'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check if agent is active
    if (!agent.is_active) {
      console.log('Admin agent is not active');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Account is deactivated'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, agent.password_hash);
    
    if (!isValidPassword) {
      console.log('Invalid password for admin agent');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid credentials'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Get admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('admin_agent_id', agent.id)
      .single();

    // Update last login
    await supabase
      .from('admin_agents')
      .update({ last_login: new Date().toISOString() })
      .eq('id', agent.id);

    console.log('Admin agent verified successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        agent: {
          id: agent.id,
          email: agent.email,
          username: agent.username,
          role: roleData?.role || null
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in verify-admin-agent:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
