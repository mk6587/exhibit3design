-- Grant admin role to the existing user
INSERT INTO public.user_roles (user_id, role)
VALUES ('03db253e-f706-44bf-a386-9b4e5f71fcc0', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;