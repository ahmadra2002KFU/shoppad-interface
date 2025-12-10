-- Shoppad Smart Cart Database Schema
-- SQLite Database

-- Payment methods table (referenced by users)
CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  icon TEXT,
  enabled INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  preferred_payment_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (preferred_payment_id) REFERENCES payment_methods(id)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  barcode TEXT UNIQUE,
  weight REAL,
  image_url TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- User carts (persistent shopping carts)
CREATE TABLE IF NOT EXISTS user_carts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(user_id, product_id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  total REAL NOT NULL,
  payment_method_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  nfc_uid TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
);

-- Transaction items (line items for each transaction)
CREATE TABLE IF NOT EXISTS transaction_items (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- QR Login Sessions table
-- Stores temporary sessions for QR code-based authentication
CREATE TABLE IF NOT EXISTS qr_login_sessions (
  id TEXT PRIMARY KEY,                              -- UUID session identifier (in QR code)
  secret TEXT NOT NULL,                             -- Secret for polling (prevents enumeration)
  status TEXT NOT NULL DEFAULT 'pending',           -- pending | authorized | expired | used
  user_id TEXT,                                     -- User who authorized (null until authorized)
  device_info TEXT,                                 -- Cart/tablet identifier (optional)
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,                         -- Session expiration (5 minutes)
  authorized_at TEXT,                               -- When user confirmed authorization
  used_at TEXT,                                     -- When cart retrieved the token
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_user_carts_user ON user_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_qr_sessions_status ON qr_login_sessions(status);
CREATE INDEX IF NOT EXISTS idx_qr_sessions_expires ON qr_login_sessions(expires_at);
