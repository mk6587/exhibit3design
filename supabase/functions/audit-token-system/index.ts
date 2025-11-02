import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuditResult {
  status: 'healthy' | 'warning' | 'critical';
  summary: {
    totalUsers: number;
    usersWithInconsistencies: number;
    orphanedGenerations: number;
    expiredReservations: number;
  };
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    userId?: string;
    email?: string;
    details: string;
  }>;
  timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[TokenAudit] Starting token system audit...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Initialize audit result
    const auditResult: AuditResult = {
      status: 'healthy',
      summary: {
        totalUsers: 0,
        usersWithInconsistencies: 0,
        orphanedGenerations: 0,
        expiredReservations: 0,
      },
      issues: [],
      timestamp: new Date().toISOString(),
    };

    // 1. Check for orphaned generations (generations without token deduction)
    console.log('[TokenAudit] Checking for orphaned generations...');
    
    // Get recent generations
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentGenerations } = await supabase
      .from('ai_generation_history')
      .select('id, user_id, created_at, service_type, tokens_used, profiles!inner(email, ai_tokens_balance)')
      .eq('is_public_sample', false)
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false });

    if (recentGenerations) {
      for (const gen of recentGenerations) {
        const fiveMinBefore = new Date(new Date(gen.created_at).getTime() - 5 * 60 * 1000).toISOString();
        const fiveMinAfter = new Date(new Date(gen.created_at).getTime() + 5 * 60 * 1000).toISOString();

        // Check for audit log deduction
        const { data: auditDeduction } = await supabase
          .from('token_audit_log')
          .select('id')
          .eq('user_id', gen.user_id)
          .eq('action', 'deduct')
          .eq('token_type', 'ai_tokens')
          .gte('created_at', fiveMinBefore)
          .lte('created_at', fiveMinAfter)
          .limit(1);

        // Check for committed reservation
        const { data: committedReservation } = await supabase
          .from('token_reservations')
          .select('id')
          .eq('user_id', gen.user_id)
          .eq('status', 'committed')
          .gte('created_at', fiveMinBefore)
          .lte('created_at', fiveMinAfter)
          .limit(1);

        // If neither exists, it's orphaned
        if ((!auditDeduction || auditDeduction.length === 0) && 
            (!committedReservation || committedReservation.length === 0)) {
          auditResult.summary.orphanedGenerations++;
          auditResult.status = 'critical';
          
          auditResult.issues.push({
            type: 'orphaned_generation',
            severity: 'high',
            userId: gen.user_id,
            email: (gen as any).profiles?.email,
            details: `Generation at ${gen.created_at} (${gen.service_type}) has no token deduction. User balance: ${(gen as any).profiles?.ai_tokens_balance}`,
          });
        }
      }
      
      console.log(`[TokenAudit] Found ${auditResult.summary.orphanedGenerations} orphaned generations`);
    }

    // 2. Check for expired reservations that weren't cleaned up
    console.log('[TokenAudit] Checking for expired reservations...');
    const { data: expiredReservations, error: expiredError } = await supabase
      .from('token_reservations')
      .select('id, user_id, created_at, expires_at, tokens_amount, profiles!inner(email)')
      .eq('status', 'reserved')
      .lt('expires_at', new Date().toISOString());

    if (!expiredError && expiredReservations && expiredReservations.length > 0) {
      auditResult.summary.expiredReservations = expiredReservations.length;
      auditResult.status = auditResult.status === 'critical' ? 'critical' : 'warning';
      
      expiredReservations.forEach((res: any) => {
        auditResult.issues.push({
          type: 'expired_reservation',
          severity: 'medium',
          userId: res.user_id,
          email: res.profiles?.email,
          details: `Reservation ${res.id} expired at ${res.expires_at} but wasn't cleaned up. ${res.tokens_amount} tokens still reserved.`,
        });
      });
      
      console.log(`[TokenAudit] Found ${expiredReservations.length} expired reservations`);
    }

    // 3. Check for users with balance inconsistencies
    console.log('[TokenAudit] Checking for balance inconsistencies...');
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, email, ai_tokens_balance, ai_tokens_used, reserved_tokens')
      .gt('ai_tokens_used', 0);

    if (profiles) {
      auditResult.summary.totalUsers = profiles.length;

      for (const profile of profiles) {
        // Check if reserved_tokens is negative
        if (profile.reserved_tokens < 0) {
          auditResult.summary.usersWithInconsistencies++;
          auditResult.status = 'critical';
          auditResult.issues.push({
            type: 'negative_reserved_tokens',
            severity: 'high',
            userId: profile.user_id,
            email: profile.email,
            details: `User has negative reserved_tokens: ${profile.reserved_tokens}`,
          });
        }

        // Check if balance + used doesn't match expected
        const { data: grants } = await supabase
          .from('token_audit_log')
          .select('amount')
          .eq('user_id', profile.user_id)
          .eq('action', 'grant')
          .eq('token_type', 'ai_tokens');

        const { data: deductions } = await supabase
          .from('token_audit_log')
          .select('amount')
          .eq('user_id', profile.user_id)
          .eq('action', 'deduct')
          .eq('token_type', 'ai_tokens');

        if (grants && deductions) {
          const totalGranted = grants.reduce((sum, g) => sum + g.amount, 0);
          const totalDeducted = deductions.reduce((sum, d) => sum + d.amount, 0);
          const expectedBalance = totalGranted - totalDeducted;

          if (expectedBalance !== profile.ai_tokens_balance) {
            auditResult.summary.usersWithInconsistencies++;
            auditResult.status = auditResult.status === 'critical' ? 'critical' : 'warning';
            auditResult.issues.push({
              type: 'balance_mismatch',
              severity: 'medium',
              userId: profile.user_id,
              email: profile.email,
              details: `Expected balance: ${expectedBalance}, Actual balance: ${profile.ai_tokens_balance} (Granted: ${totalGranted}, Deducted: ${totalDeducted})`,
            });
          }
        }
      }
    }

    // 4. Check for double deductions
    console.log('[TokenAudit] Checking for double deductions...');
    const { data: generations } = await supabase
      .from('ai_generation_history')
      .select('id, user_id, created_at, service_type, profiles!inner(email)')
      .eq('is_public_sample', false)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (generations) {
      for (const gen of generations) {
        const { data: relatedDeductions } = await supabase
          .from('token_audit_log')
          .select('id, amount, created_at')
          .eq('user_id', gen.user_id)
          .eq('action', 'deduct')
          .eq('token_type', 'ai_tokens')
          .gte('created_at', new Date(new Date(gen.created_at).getTime() - 5 * 60 * 1000).toISOString())
          .lte('created_at', new Date(new Date(gen.created_at).getTime() + 5 * 60 * 1000).toISOString());

        if (relatedDeductions && relatedDeductions.length > 1) {
          auditResult.status = 'critical';
          auditResult.issues.push({
            type: 'double_deduction',
            severity: 'high',
            userId: gen.user_id,
            email: (gen as any).profiles?.email,
            details: `Generation at ${gen.created_at} has ${relatedDeductions.length} related deductions`,
          });
        }
      }
    }

    // Log summary
    console.log('[TokenAudit] Audit completed:', JSON.stringify(auditResult.summary, null, 2));
    
    if (auditResult.issues.length > 0) {
      console.warn('[TokenAudit] Issues found:', auditResult.issues.length);
    } else {
      console.log('[TokenAudit] No issues found - system is healthy');
    }

    return new Response(
      JSON.stringify(auditResult, null, 2),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('[TokenAudit] Error during audit:', error);
    return new Response(
      JSON.stringify({
        status: 'error',
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
