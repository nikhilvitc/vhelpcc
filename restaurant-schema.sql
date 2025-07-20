-- =====================================================
-- RESTAURANT MANAGEMENT SCHEMA FOR VHELPCC
-- =====================================================
-- This schema focuses specifically on restaurant and food delivery functionality
-- Run this after the main schema or use it standalone for restaurant-only setup
-- Copy and paste this entire script into Supabase SQL Editor

-- =====================================================
-- 1. RESTAURANTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#f97316',
    secondary_color VARCHAR(7) DEFAULT '#fb923c',
    accent_color VARCHAR(7) DEFAULT '#ea580c',
    is_active BOOLEAN DEFAULT true,
    opening_time TIME DEFAULT '09:00:00',
    closing_time TIME DEFAULT '22:00:00',
    delivery_fee DECIMAL(10,2) DEFAULT 2.99,
    minimum_order DECIMAL(10,2) DEFAULT 10.00,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    address TEXT,
    cuisine_type VARCHAR(100),
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. RESTAURANT ADMINS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS restaurant_admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '{"manage_menu": true, "manage_orders": true, "view_analytics": true}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, restaurant_id)
);

-- =====================================================
-- 3. MENU CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS menu_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(restaurant_id, name)
);

-- =====================================================
-- 4. MENU ITEMS TABLE (ENHANCED)
-- =====================================================
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    discounted_price DECIMAL(10,2),
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    is_vegetarian BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    spice_level INTEGER DEFAULT 0 CHECK (spice_level BETWEEN 0 AND 5),
    preparation_time INTEGER DEFAULT 15,
    calories INTEGER,
    ingredients TEXT[],
    allergens TEXT[],
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. FOOD ORDERS TABLE (ENHANCED)
-- =====================================================
CREATE TABLE IF NOT EXISTS food_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    delivery_person_id UUID REFERENCES users(id) ON DELETE SET NULL,
    order_token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'refunded')),
    order_type VARCHAR(20) DEFAULT 'delivery' CHECK (order_type IN ('delivery', 'pickup')),
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    delivery_fee DECIMAL(10,2) DEFAULT 2.99,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    delivery_address TEXT,
    delivery_phone VARCHAR(20),
    customer_name VARCHAR(255),
    special_instructions TEXT,
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    actual_delivery_time TIMESTAMP WITH TIME ZONE,
    pickup_time TIMESTAMP WITH TIME ZONE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. FOOD ORDER ITEMS TABLE (ENHANCED)
-- =====================================================
CREATE TABLE IF NOT EXISTS food_order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES food_orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    special_requests TEXT,
    customizations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. ORDER STATUS HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES food_orders(id) ON DELETE CASCADE,
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. RESTAURANT REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS restaurant_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES food_orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, restaurant_id, order_id)
);

-- =====================================================
-- 9. DELIVERY ZONES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS delivery_zones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    zone_name VARCHAR(100) NOT NULL,
    postal_codes TEXT[],
    delivery_fee DECIMAL(10,2) DEFAULT 2.99,
    minimum_order DECIMAL(10,2) DEFAULT 10.00,
    estimated_delivery_time INTEGER DEFAULT 30, -- in minutes
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. RESTAURANT OPERATING HOURS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS restaurant_operating_hours (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
    opening_time TIME,
    closing_time TIME,
    is_closed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(restaurant_id, day_of_week)
);

-- =====================================================
-- 11. INDEXES FOR PERFORMANCE
-- =====================================================
-- Restaurants indexes
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_is_active ON restaurants(is_active);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine_type ON restaurants(cuisine_type);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating);

-- Restaurant admins indexes
CREATE INDEX IF NOT EXISTS idx_restaurant_admins_user_id ON restaurant_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_admins_restaurant_id ON restaurant_admins(restaurant_id);

-- Menu categories indexes
CREATE INDEX IF NOT EXISTS idx_menu_categories_restaurant_id ON menu_categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_categories_display_order ON menu_categories(display_order);

-- Menu items indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_price ON menu_items(price);
CREATE INDEX IF NOT EXISTS idx_menu_items_dietary ON menu_items(is_vegetarian, is_vegan, is_gluten_free);

-- Food orders indexes
CREATE INDEX IF NOT EXISTS idx_food_orders_user_id ON food_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_food_orders_restaurant_id ON food_orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_food_orders_delivery_person_id ON food_orders(delivery_person_id);
CREATE INDEX IF NOT EXISTS idx_food_orders_status ON food_orders(status);
CREATE INDEX IF NOT EXISTS idx_food_orders_order_token ON food_orders(order_token);
CREATE INDEX IF NOT EXISTS idx_food_orders_created_at ON food_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_food_orders_payment_status ON food_orders(payment_status);

-- Food order items indexes
CREATE INDEX IF NOT EXISTS idx_food_order_items_order_id ON food_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_food_order_items_menu_item_id ON food_order_items(menu_item_id);

-- Order status history indexes
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at);

-- Restaurant reviews indexes
CREATE INDEX IF NOT EXISTS idx_restaurant_reviews_restaurant_id ON restaurant_reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_reviews_user_id ON restaurant_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_reviews_rating ON restaurant_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_restaurant_reviews_is_visible ON restaurant_reviews(is_visible);

-- Delivery zones indexes
CREATE INDEX IF NOT EXISTS idx_delivery_zones_restaurant_id ON delivery_zones(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_delivery_zones_is_active ON delivery_zones(is_active);

-- Restaurant operating hours indexes
CREATE INDEX IF NOT EXISTS idx_restaurant_operating_hours_restaurant_id ON restaurant_operating_hours(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_operating_hours_day_of_week ON restaurant_operating_hours(day_of_week);

-- =====================================================
-- 12. FUNCTIONS AND TRIGGERS
-- =====================================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to log order status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_status_history (
            order_id, old_status, new_status, changed_by, notes
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            NEW.user_id, -- This could be improved to track who actually changed it
            'Status changed from ' || COALESCE(OLD.status, 'null') || ' to ' || NEW.status
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update restaurant rating
CREATE OR REPLACE FUNCTION update_restaurant_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE restaurants
    SET
        rating = (
            SELECT ROUND(AVG(rating)::numeric, 2)
            FROM restaurant_reviews
            WHERE restaurant_id = NEW.restaurant_id
            AND is_visible = true
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM restaurant_reviews
            WHERE restaurant_id = NEW.restaurant_id
            AND is_visible = true
        )
    WHERE id = NEW.restaurant_id;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at columns
CREATE TRIGGER update_restaurants_updated_at
    BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurant_admins_updated_at
    BEFORE UPDATE ON restaurant_admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_categories_updated_at
    BEFORE UPDATE ON menu_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_orders_updated_at
    BEFORE UPDATE ON food_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurant_reviews_updated_at
    BEFORE UPDATE ON restaurant_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_zones_updated_at
    BEFORE UPDATE ON delivery_zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to log order status changes
CREATE TRIGGER log_order_status_change_trigger
    AFTER UPDATE ON food_orders FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- Trigger to update restaurant rating when review is added/updated
CREATE TRIGGER update_restaurant_rating_trigger
    AFTER INSERT OR UPDATE ON restaurant_reviews FOR EACH ROW EXECUTE FUNCTION update_restaurant_rating();

-- =====================================================
-- 13. INSERT DEFAULT RESTAURANT DATA
-- =====================================================
-- Insert default restaurants with enhanced data
INSERT INTO restaurants (name, slug, description, primary_color, secondary_color, accent_color, cuisine_type, contact_phone, contact_email) VALUES
('Starbucks', 'starbucks', 'Premium coffee and beverages with a cozy atmosphere', '#00704A', '#1E3932', '#00A862', 'Coffee & Beverages', '+1-555-COFFEE', 'contact@starbucks.local'),
('Pizza Hut', 'pizza-hut', 'Authentic Italian pizza and pasta dishes', '#E31837', '#C41E3A', '#B71C1C', 'Italian', '+1-555-PIZZA1', 'orders@pizzahut.local'),
('Subway', 'subway', 'Fresh sandwiches and healthy meal options', '#FFCC00', '#FDD835', '#F57F17', 'Sandwiches', '+1-555-SUBWAY', 'info@subway.local'),
('Baskin Robbins', 'baskin-robbins', 'Premium ice cream and frozen desserts', '#E91E63', '#F06292', '#C2185B', 'Desserts', '+1-555-ICECREAM', 'sweet@baskinrobbins.local'),
('McDonald''s', 'mcdonalds', 'Classic fast food favorites and quick meals', '#FFC72C', '#FFCA28', '#FF8F00', 'Fast Food', '+1-555-MCDEES', 'service@mcdonalds.local'),
('Olive Garden', 'olive-garden', 'Fine Italian dining with family-style portions', '#4CAF50', '#66BB6A', '#388E3C', 'Fine Dining', '+1-555-OLIVE1', 'reservations@olivegarden.local')
ON CONFLICT (slug) DO NOTHING;

-- Insert menu categories for each restaurant
INSERT INTO menu_categories (restaurant_id, name, description, display_order)
SELECT r.id, category_name, category_desc, category_order
FROM restaurants r
CROSS JOIN (
    VALUES
        ('Coffee', 'Hot and cold coffee beverages', 1),
        ('Tea', 'Premium tea selections', 2),
        ('Pastries', 'Fresh baked goods and snacks', 3),
        ('Cold Drinks', 'Refreshing cold beverages', 4)
) AS categories(category_name, category_desc, category_order)
WHERE r.slug = 'starbucks'
ON CONFLICT (restaurant_id, name) DO NOTHING;

INSERT INTO menu_categories (restaurant_id, name, description, display_order)
SELECT r.id, category_name, category_desc, category_order
FROM restaurants r
CROSS JOIN (
    VALUES
        ('Pizza', 'Hand-tossed and thin crust pizzas', 1),
        ('Pasta', 'Italian pasta dishes', 2),
        ('Appetizers', 'Starters and sides', 3),
        ('Desserts', 'Sweet treats', 4)
) AS categories(category_name, category_desc, category_order)
WHERE r.slug = 'pizza-hut'
ON CONFLICT (restaurant_id, name) DO NOTHING;

-- Insert operating hours for all restaurants (Monday-Sunday)
INSERT INTO restaurant_operating_hours (restaurant_id, day_of_week, opening_time, closing_time)
SELECT r.id, dow, '09:00:00'::TIME, '22:00:00'::TIME
FROM restaurants r
CROSS JOIN generate_series(0, 6) AS dow
ON CONFLICT (restaurant_id, day_of_week) DO NOTHING;

-- =====================================================
-- 14. GRANT PERMISSIONS
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Restaurant tables permissions
GRANT SELECT ON restaurants TO anon, authenticated;
GRANT INSERT, UPDATE ON restaurants TO authenticated;

GRANT SELECT ON restaurant_admins TO authenticated;
GRANT INSERT, UPDATE ON restaurant_admins TO authenticated;

GRANT SELECT ON menu_categories TO anon, authenticated;
GRANT INSERT, UPDATE ON menu_categories TO authenticated;

GRANT SELECT ON menu_items TO anon, authenticated;
GRANT INSERT, UPDATE ON menu_items TO authenticated;

GRANT SELECT, INSERT, UPDATE ON food_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE ON food_order_items TO authenticated;
GRANT SELECT ON order_status_history TO authenticated;
GRANT INSERT ON order_status_history TO authenticated;

GRANT SELECT ON restaurant_reviews TO anon, authenticated;
GRANT INSERT, UPDATE ON restaurant_reviews TO authenticated;

GRANT SELECT ON delivery_zones TO anon, authenticated;
GRANT INSERT, UPDATE ON delivery_zones TO authenticated;

GRANT SELECT ON restaurant_operating_hours TO anon, authenticated;
GRANT INSERT, UPDATE ON restaurant_operating_hours TO authenticated;

-- =====================================================
-- 15. VALIDATION CONSTRAINTS
-- =====================================================
-- Restaurant constraints
ALTER TABLE restaurants ADD CONSTRAINT check_restaurant_name_not_empty
    CHECK (LENGTH(TRIM(name)) > 0);

ALTER TABLE restaurants ADD CONSTRAINT check_restaurant_slug_format
    CHECK (slug ~ '^[a-z0-9-]+$');

ALTER TABLE restaurants ADD CONSTRAINT check_delivery_fee_non_negative
    CHECK (delivery_fee >= 0);

ALTER TABLE restaurants ADD CONSTRAINT check_minimum_order_positive
    CHECK (minimum_order > 0);

-- Menu item constraints
ALTER TABLE menu_items ADD CONSTRAINT check_menu_item_price_positive
    CHECK (price > 0);

ALTER TABLE menu_items ADD CONSTRAINT check_discounted_price_valid
    CHECK (discounted_price IS NULL OR (discounted_price > 0 AND discounted_price < price));

-- Food order constraints
ALTER TABLE food_orders ADD CONSTRAINT check_total_amount_positive
    CHECK (total_amount > 0);

ALTER TABLE food_orders ADD CONSTRAINT check_subtotal_positive
    CHECK (subtotal > 0);

-- Order item constraints
ALTER TABLE food_order_items ADD CONSTRAINT check_quantity_positive
    CHECK (quantity > 0);

ALTER TABLE food_order_items ADD CONSTRAINT check_unit_price_positive
    CHECK (unit_price > 0);

-- =====================================================
-- RESTAURANT SCHEMA CREATION COMPLETE
-- =====================================================
-- This comprehensive restaurant schema includes:
-- 1. Enhanced restaurant management with detailed information
-- 2. Flexible menu categorization system
-- 3. Advanced order management with status tracking
-- 4. Customer review and rating system
-- 5. Delivery zone management
-- 6. Operating hours management
-- 7. Performance optimized indexes
-- 8. Audit trails and history tracking
-- 9. Data validation constraints
-- 10. Proper permissions for all operations
-- =====================================================

SELECT 'Restaurant schema created successfully!' as status;
