-- ShopPad PostgreSQL Schema for Vercel Postgres
-- Run this in Vercel's SQL console to initialize the database

-- Payment methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  icon TEXT,
  enabled BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  preferred_payment_id TEXT REFERENCES payment_methods(id),
  nfc_uid TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  barcode TEXT UNIQUE,
  weight DECIMAL(10,3),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User carts
CREATE TABLE IF NOT EXISTS user_carts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  total DECIMAL(10,2) NOT NULL,
  payment_method_id TEXT NOT NULL REFERENCES payment_methods(id),
  status TEXT NOT NULL DEFAULT 'pending',
  nfc_uid TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Transaction items
CREATE TABLE IF NOT EXISTS transaction_items (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL
);

-- QR Login sessions
CREATE TABLE IF NOT EXISTS qr_login_sessions (
  id TEXT PRIMARY KEY,
  secret TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  device_info TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  authorized_at TIMESTAMP,
  used_at TIMESTAMP
);

-- NFC Events (replaces in-memory storage)
CREATE TABLE IF NOT EXISTS nfc_events (
  id SERIAL PRIMARY KEY,
  uid TEXT NOT NULL,
  event TEXT NOT NULL DEFAULT 'nfc_detected',
  device_id TEXT,
  processed BOOLEAN DEFAULT false,
  transaction_id TEXT,
  user_name TEXT,
  total DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_nfc_uid ON users(nfc_uid);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_user_carts_user ON user_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_qr_sessions_status ON qr_login_sessions(status);
CREATE INDEX IF NOT EXISTS idx_qr_sessions_expires ON qr_login_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_nfc_events_processed ON nfc_events(processed);
CREATE INDEX IF NOT EXISTS idx_nfc_events_created ON nfc_events(created_at);
