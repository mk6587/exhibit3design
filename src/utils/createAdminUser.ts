import { supabase } from '@/integrations/supabase/client';

export const createAdminUser = async (username: string, email: string, password: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-admin-user', {
      body: {
        username,
        email,
        password
      }
    });

    if (error) {
      console.error('Error creating admin user:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Failed to create admin user' };
  }
};
