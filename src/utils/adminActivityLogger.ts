import { supabase } from "@/integrations/supabase/client";

interface LogAdminActionParams {
  actionType: string;
  resourceType?: string;
  resourceId?: string;
  actionDetails?: Record<string, any>;
}

/**
 * Log an admin action to the admin_activity_log table
 * This should be called after any significant admin action
 */
export async function logAdminAction({
  actionType,
  resourceType,
  resourceId,
  actionDetails = {}
}: LogAdminActionParams): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('Cannot log admin action: No authenticated user');
      return;
    }

    // Get user agent and IP (IP will be null on client side, that's OK)
    const userAgent = navigator.userAgent;

    await supabase.from('admin_activity_log').insert({
      admin_user_id: user.id,
      action_type: actionType,
      resource_type: resourceType,
      resource_id: resourceId,
      action_details: actionDetails,
      user_agent: userAgent,
    });
  } catch (error) {
    // Don't throw - logging should never break the app
    console.error('Failed to log admin action:', error);
  }
}

/**
 * Common action types for consistency
 */
export const AdminActionTypes = {
  // Authentication
  LOGIN: 'login',
  LOGOUT: 'logout',
  
  // CRUD operations
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  
  // Role management
  ROLE_CHANGE: 'role_change',
  
  // User management
  USER_ACTIVATE: 'user_activate',
  USER_DEACTIVATE: 'user_deactivate',
  TOKEN_ADJUST: 'token_adjust',
  
  // Content management
  PRODUCT_CREATE: 'product_create',
  PRODUCT_UPDATE: 'product_update',
  PRODUCT_DELETE: 'product_delete',
  
  // Blog management
  BLOG_POST_CREATE: 'blog_post_create',
  BLOG_POST_UPDATE: 'blog_post_update',
  BLOG_POST_DELETE: 'blog_post_delete',
  BLOG_POST_PUBLISH: 'blog_post_publish',
} as const;
