-- ShopPad Smart Cart Database Schema
-- Version: 1.0.0
-- PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    preferred_payment_method VARCHAR(50) DEFAULT 'madapay',
    -- Payment options: 'madapay', 'google_pay', 'apple_pay'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    name_ar VARCHAR(200),
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    barcode VARCHAR(50) UNIQUE,
    weight DECIMAL(10, 3),
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- ============================================
-- SESSIONS TABLE (QR Code Login)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    cart_device_id VARCHAR(100),
    phone_device_id VARCHAR(100),
    qr_code TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_cart_device ON sessions(cart_device_id);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active);

-- ============================================
-- CART ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_session ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    -- Status: 'pending', 'processing', 'completed', 'failed'
    order_status VARCHAR(50) DEFAULT 'created',
    -- Status: 'created', 'processing', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(200) NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- ============================================
-- WEIGHT READINGS TABLE (Preserve existing functionality)
-- ============================================
CREATE TABLE IF NOT EXISTS weight_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    weight DECIMAL(10, 3) NOT NULL,
    device_id VARCHAR(100),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weight_readings_session ON weight_readings(session_id);
CREATE INDEX IF NOT EXISTS idx_weight_readings_recorded ON weight_readings(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_weight_readings_device ON weight_readings(device_id);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA: Sample Products
-- ============================================
INSERT INTO products (name, name_ar, category, price, barcode, weight, stock_quantity, is_active) VALUES
    ('Fresh Tomatoes', 'طماطم طازجة', 'Fresh Produce', 11.25, '1234567890123', 0.5, 100, true),
    ('Organic Potatoes', 'بطاطس عضوية', 'Fresh Produce', 13.12, '1234567890124', 1.0, 100, true),
    ('Red Apples', 'تفاح أحمر', 'Fresh Produce', 18.75, '1234567890125', 0.8, 100, true),
    ('Fresh Bananas', 'موز طازج', 'Fresh Produce', 9.50, '1234567890126', 0.6, 100, true),
    ('Fresh Carrots', 'جزر طازج', 'Fresh Produce', 8.75, '1234567890127', 0.7, 100, true),
    ('Fresh Milk', 'حليب طازج', 'Dairy & Bakery', 15.99, '2234567890123', 1.0, 100, true),
    ('Fresh Bread', 'خبز طازج', 'Dairy & Bakery', 7.50, '2234567890124', NULL, 100, true),
    ('Cheese Selection', 'تشكيلة أجبان', 'Dairy & Bakery', 32.99, '2234567890125', 0.3, 100, true),
    ('Orange Juice', 'عصير برتقال', 'Beverages', 12.50, '3234567890123', 1.0, 100, true),
    ('Pasta', 'معكرونة', 'Pantry Staples', 14.25, '4234567890123', NULL, 100, true),
    ('White Rice', 'أرز أبيض', 'Pantry Staples', 28.99, '4234567890124', 2.0, 100, true),
    ('Olive Oil', 'زيت زيتون', 'Pantry Staples', 45.00, '4234567890125', 1.0, 100, true),
    ('Cleaning Supplies', 'مواد تنظيف', 'Household', 22.50, '5234567890123', NULL, 100, true),
    ('Tissue Paper', 'مناديل ورقية', 'Household', 18.99, '5234567890124', NULL, 100, true),
    ('Soap & Shampoo', 'صابون وشامبو', 'Household', 35.75, '5234567890125', NULL, 100, true),
    ('Chips & Snacks', 'رقائق ووجبات خفيفة', 'Snacks', 16.50, '6234567890123', NULL, 100, true),
    ('Fresh Chicken', 'دجاج طازج', 'Meat & Poultry', 42.00, '7234567890123', 1.5, 100, true),
    ('Cotton T-Shirt', 'قميص قطني', 'Clothing', 75.00, '8234567890123', NULL, 100, true),
    ('Casual Pants', 'بنطال كاجوال', 'Clothing', 150.00, '8234567890124', NULL, 100, true),
    ('Cookware Set', 'طقم أواني طبخ', 'Kitchen', 299.99, '9234567890123', NULL, 100, true),
    ('Kitchen Utensils', 'أدوات مطبخ', 'Kitchen', 93.75, '9234567890124', NULL, 100, true)
ON CONFLICT (barcode) DO NOTHING;
