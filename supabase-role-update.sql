-- =====================================================
-- UPDATE USER ROLES CONSTRAINT IN SUPABASE
-- =====================================================
-- Run this SQL script in your Supabase SQL Editor to add the new vendor roles

-- First, drop the existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add the new constraint with vendor roles
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('customer', 'admin', 'delivery', 'phone_vendor', 'laptop_vendor'));

-- Verify the constraint was added
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'users'::regclass 
AND conname = 'users_role_check';

-- Optional: Create some test vendor users
-- Uncomment and modify these if you want to create test accounts

/*
-- Create a phone vendor user (replace with actual auth user ID)
INSERT INTO users (id, email, first_name, last_name, role) 
VALUES (
  'phone-vendor-uuid-here', 
  'phone.vendor@example.com', 
  'Phone', 
  'Vendor', 
  'phone_vendor'
) ON CONFLICT (id) DO UPDATE SET role = 'phone_vendor';

-- Create a laptop vendor user (replace with actual auth user ID)
INSERT INTO users (id, email, first_name, last_name, role) 
VALUES (
  'laptop-vendor-uuid-here', 
  'laptop.vendor@example.com', 
  'Laptop', 
  'Vendor', 
  'laptop_vendor'
) ON CONFLICT (id) DO UPDATE SET role = 'laptop_vendor';
*/

-- Show all current users and their roles
SELECT id, email, first_name, last_name, role, created_at 
FROM users 
ORDER BY created_at DESC;
