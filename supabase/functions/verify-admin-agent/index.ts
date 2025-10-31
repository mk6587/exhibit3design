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
 * Verify password against PBKDF2 hash
 */
async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const [iterations, salt, hash] = storedHash.split(':');
    
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const saltData = hexToUint8Array(salt);
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordData,
      'PBKDF2',
      false,
      ['deriveBits']
    );
    
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltData,
        iterations: parseInt(iterations),
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );
    
    const derivedHash = uint8ArrayToHex(new Uint8Array(derivedBits));
    return derivedHash === hash;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
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
