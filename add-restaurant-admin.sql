-- =====================================================
-- ADD RESTAURANT ADMIN - QUICK SETUP SCRIPT
-- =====================================================
-- This script helps you quickly add a restaurant admin user
-- 
-- IMPORTANT: You must first create the user in Supabase Auth Dashboard
-- Then replace the placeholders below with actual values

-- =====================================================
-- STEP 1: Create user in Supabase Auth Dashboard first!
-- =====================================================
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User"
-- 3. Enter email and password
-- 4. Set email confirmation to "Auto Confirm"
-- 5. Copy the generated user ID

-- =====================================================
-- STEP 2: Run this SQL script with your values
-- =====================================================

-- Replace these placeholders with actual values:
-- 'YOUR_SUPABASE_AUTH_USER_ID' - The ID from Supabase Auth
-- 'admin@yourrestaurant.com' - The admin's email
-- 'Admin' - First name
-- 'User' - Last name
-- '+1234567890' - Phone number
-- 'Restaurant Address' - Address
-- 'restaurant-slug' - The slug of the restaurant (e.g., 'starbucks', 'pizza-hut')

-- Insert user profile
INSERT INTO users (id, email, first_name, last_name, phone, address, role) 
VALUES (
    'YOUR_SUPABASE_AUTH_USER_ID',  -- Replace with actual Supabase Auth user ID
    'admin@yourrestaurant.com',    -- Replace with actual email
    'Admin',                       -- Replace with first name
    'User',                        -- Replace with last name
    '+1234567890',                 -- Replace with phone number
    'Restaurant Address',          -- Replace with address
    'restaurant_admin'             -- Keep this as is
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Link user to restaurant
INSERT INTO restaurant_admins (user_id, restaurant_id)
SELECT 
    'YOUR_SUPABASE_AUTH_USER_ID',  -- Replace with actual Supabase Auth user ID
    r.id
FROM restaurants r 
WHERE r.slug = 'restaurant-slug'   -- Replace with actual restaurant slug
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify the admin was created successfully

SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.role,
    r.name as restaurant_name,
    r.slug as restaurant_slug,
    ra.created_at as linked_at
FROM users u
JOIN restaurant_admins ra ON u.id = ra.user_id
JOIN restaurants r ON ra.restaurant_id = r.id
WHERE u.id = 'YOUR_SUPABASE_AUTH_USER_ID';  -- Replace with actual user ID

-- =====================================================
-- AVAILABLE RESTAURANTS
-- =====================================================
-- Run this query to see available restaurants and their slugs

SELECT 
    id,
    name,
    slug,
    description,
    is_active
FROM restaurants 
WHERE is_active = true
ORDER BY name;

-- =====================================================
-- EXAMPLE: Adding admin for Starbucks
-- =====================================================
-- Here's a complete example for adding a Starbucks admin:

/*
-- 1. First create user in Supabase Auth with email: starbucks.manager@example.com
-- 2. Copy the generated user ID (e.g., 'a1b2c3d4-e5f6-7890-abcd-ef1234567890')
-- 3. Run this SQL:

INSERT INTO users (id, email, first_name, last_name, phone, address, role) 
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'starbucks.manager@example.com',
    'Sarah',
    'Johnson',
    '+1555123456',
    '123 Coffee Street, Seattle, WA',
    'restaurant_admin'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    role = EXCLUDED.role,
    updated_at = NOW();

INSERT INTO restaurant_admins (user_id, restaurant_id)
SELECT 
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    r.id
FROM restaurants r 
WHERE r.slug = 'starbucks'
ON CONFLICT (user_id, restaurant_id) DO NOTHING;
*/

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================

-- If you need to remove an admin:
-- DELETE FROM restaurant_admins WHERE user_id = 'YOUR_USER_ID';
-- DELETE FROM users WHERE id = 'YOUR_USER_ID';

-- If you need to change which restaurant an admin manages:
-- UPDATE restaurant_admins 
-- SET restaurant_id = (SELECT id FROM restaurants WHERE slug = 'new-restaurant-slug')
-- WHERE user_id = 'YOUR_USER_ID';

-- If you need to check all restaurant admins:
-- SELECT 
--     u.email,
--     u.first_name || ' ' || u.last_name as full_name,
--     r.name as restaurant_name
-- FROM users u
-- JOIN restaurant_admins ra ON u.id = ra.user_id
-- JOIN restaurants r ON ra.restaurant_id = r.id
-- WHERE u.role = 'restaurant_admin'
-- ORDER BY r.name, u.first_name;
