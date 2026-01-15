-- Insert TEMP_USER_ID into auth.users for development
-- This allows the single-user development app to work with foreign key constraints
-- In production, this would be replaced with actual authenticated users

INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'dev@localhost',
  'unused', -- Not used since this is a dev-only user
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  false,
  'authenticated'
)
ON CONFLICT (id) DO NOTHING; -- Skip if already exists
