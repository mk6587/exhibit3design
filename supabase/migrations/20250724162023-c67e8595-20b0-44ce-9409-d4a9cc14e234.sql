-- Create the admin user in auth.users table if it doesn't exist
-- This will insert the user with the specified email and password

DO $$
BEGIN
  -- Check if the user already exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'mkadmin@example.com'
  ) THEN
    -- Insert the admin user into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_sent_at,
      confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      '0fa02067-4627-44b2-80b9-81fb00803e4e', -- This matches the user_id in admins table
      'authenticated',
      'authenticated',
      'mkadmin@example.com',
      crypt('Admin123!', gen_salt('bf')), -- Hash the password
      now(),
      now(),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{}',
      false
    );

    -- Also insert into auth.identities
    INSERT INTO auth.identities (
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      'mkadmin@example.com',
      '0fa02067-4627-44b2-80b9-81fb00803e4e',
      format('{"sub":"%s","email":"%s"}', '0fa02067-4627-44b2-80b9-81fb00803e4e', 'mkadmin@example.com')::jsonb,
      'email',
      now(),
      now(),
      now()
    );
  END IF;
END $$;