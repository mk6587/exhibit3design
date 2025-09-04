-- Create an admin record for the first existing user
-- This will link the existing Supabase auth user to an admin role
DO $$
DECLARE
    existing_user_id uuid;
BEGIN
    -- Get the first user from auth.users
    SELECT id INTO existing_user_id 
    FROM auth.users 
    WHERE email = 'mkadmin@example.com' OR email = 'mk6587@gmail.com'
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- If we found a user, create an admin record
    IF existing_user_id IS NOT NULL THEN
        INSERT INTO public.admins (
            user_id,
            username,
            email,
            is_active
        ) 
        SELECT 
            existing_user_id,
            'mkadmin',
            email,
            true
        FROM auth.users 
        WHERE id = existing_user_id
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE NOTICE 'Admin record created for user: %', existing_user_id;
    ELSE
        RAISE NOTICE 'No suitable user found to make admin';
    END IF;
END $$;