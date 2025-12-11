# ShopPad Architecture Documentation

## System Overview

ShopPad is a smart shopping cart application designed for retail environments. It integrates:
- IoT devices (ESP32 weight sensors, NFC readers)
- Mobile phone authentication via QR codes
- Real-time cart management
- Multiple payment methods

---

## Component Architecture

### 1. Frontend Application

**Location**: `/src`

**Technology Stack**:
| Layer | Technology |
|-------|------------|
| Framework | React 18.3.1 |
| Build Tool | Vite 5.4.19 |
| Language | TypeScript 5.8.3 |
| Styling | Tailwind CSS 3.4.17 |
| UI Components | Shadcn/UI (Radix primitives) |
| State Management | TanStack Query + React Context |
| Routing | React Router DOM 6.30.1 |
| Form Handling | React Hook Form + Zod |

**Directory Structure**:
```
src/
├── assets/          # Static images
├── components/      # Reusable React components
│   ├── ui/         # Shadcn UI components
│   ├── CartView.tsx
│   ├── ProductCard.tsx
│   ├── NFCCheckoutDialog.tsx
│   └── ...
├── config/          # Configuration files
│   └── api.ts      # API endpoint configuration
├── contexts/        # React Context providers
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   └── LanguageContext.tsx
├── data/            # Static data (products)
├── hooks/           # Custom React hooks
│   ├── useNFCDetection.ts
│   ├── useESP32Weight.ts
│   └── ...
├── pages/           # Route components
│   ├── Shopping.tsx
│   ├── Login.tsx
│   ├── QRLogin.tsx
│   └── ...
├── services/        # API client
│   └── api.ts
├── types/           # TypeScript definitions
├── App.tsx          # Root component
└── main.tsx         # Entry point
```

### 2. Backend Server

**Location**: `/server`

**Technology Stack**:
| Layer | Technology |
|-------|------------|
| Runtime | Node.js 20+ |
| Framework | Express 4.18.2 |
| Database | SQLite (better-sqlite3) |
| Auth | JWT + bcrypt |
| Security | Helmet, CORS, Rate Limiting |
| Process Manager | PM2 (production) |

**Directory Structure**:
```
server/
├── database/
│   ├── index.js     # Database connection
│   ├── schema.sql   # Table definitions
│   └── seed.js      # Initial data
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Cart.js
│   ├── Transaction.js
│   ├── PaymentMethod.js
│   └── QRLoginSession.js
├── routes/
│   ├── auth.js      # Authentication endpoints
│   ├── qr-auth.js   # QR login flow
│   ├── products.js  # Product CRUD
│   ├── cart.js      # Cart operations
│   └── checkout.js  # Payment processing
├── config.js        # Server configuration
├── logger.js        # Logging utility
└── server.js        # Main server file
```

---

## Database Schema

### Tables

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  preferred_payment_id TEXT,
  nfc_uid TEXT UNIQUE,          -- Linked NFC card
  created_at TEXT,
  updated_at TEXT
);

-- Products table
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,                  -- Arabic name
  category TEXT NOT NULL,
  price REAL NOT NULL,
  barcode TEXT UNIQUE,
  weight REAL,
  image_url TEXT,
  is_active INTEGER DEFAULT 1
);

-- User carts (persistent)
CREATE TABLE user_carts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  UNIQUE(user_id, product_id)
);

-- Transactions
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  total REAL NOT NULL,
  payment_method_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  nfc_uid TEXT
);

-- Transaction items
CREATE TABLE transaction_items (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL
);

-- QR Login sessions
CREATE TABLE qr_login_sessions (
  id TEXT PRIMARY KEY,
  secret TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  user_id TEXT,
  expires_at TEXT NOT NULL
);

-- Payment methods
CREATE TABLE payment_methods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  icon TEXT,
  enabled INTEGER DEFAULT 1
);
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| GET | `/auth/me` | Get current user |
| POST | `/auth/nfc/link` | Link NFC card to user |
| DELETE | `/auth/nfc/unlink` | Unlink NFC card |
| GET | `/auth/nfc/status` | Check NFC link status |

### QR Login Flow
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/qr/session` | Create QR session (cart tablet) |
| GET | `/auth/qr/status/:id` | Poll session status |
| GET | `/auth/qr/info/:id` | Get session info (phone) |
| POST | `/auth/qr/authorize` | Authorize session |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List all products |
| GET | `/products/:id` | Get product by ID |
| GET | `/products/barcode/:barcode` | Get by barcode |
| GET | `/products/categories` | Get categories |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cart` | Get user's cart |
| POST | `/cart` | Add item to cart |
| PUT | `/cart/:productId` | Update quantity |
| DELETE | `/cart/:productId` | Remove item |
| DELETE | `/cart` | Clear cart |
| POST | `/cart/sync` | Sync local cart |

### Checkout
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/checkout/payment-methods` | Get payment methods |
| POST | `/checkout` | Process checkout |
| GET | `/checkout/history` | Transaction history |
| GET | `/checkout/history/:id` | Transaction details |

### IoT (ESP32)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/weight` | Receive weight data |
| POST | `/nfc` | Receive NFC detection |
| POST | `/nfc/payment` | NFC auto-payment |
| GET | `/nfc` | Get NFC events (polling) |
| POST | `/nfc/mark-processed` | Mark event processed |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/status` | Health check |
| GET | `/logs` | Weight readings |
| GET | `/stats` | Statistics |

---

## Authentication Flow

### Standard Login
```
User -> POST /auth/login -> JWT Token -> Stored in localStorage
```

### QR Code Login (Cart Tablet)
```
1. Cart Tablet: POST /auth/qr/session -> QR Code + Secret
2. Cart Tablet: Display QR Code
3. User Phone: Scan QR Code
4. User Phone: GET /auth/qr/info/:sessionId -> Session info
5. User Phone: POST /auth/qr/authorize (with Auth token)
6. Cart Tablet: Polling GET /auth/qr/status/:sessionId
7. Cart Tablet: Receives JWT token when authorized
```

### NFC Auto-Payment
```
1. ESP32: POST /nfc/payment { nfc_uid: "..." }
2. Server: Find user by NFC UID
3. Server: Check cart has items
4. Server: Process payment
5. Server: Clear cart
6. Server: Return result to ESP32
7. Frontend: Poll /nfc for payment events
```

---

## Data Flow

### Adding Product to Cart
```
Frontend (scan/click)
    |
    v
CartContext.addToCart()
    |
    +-> localStorage (always)
    |
    +-> API POST /cart (if authenticated)
         |
         v
    Server validates
         |
         v
    Database INSERT/UPDATE
```

### Real-time Weight Updates
```
ESP32 Weight Sensor
    |
    v
POST /weight { weight: 1.234 }
    |
    v
Server stores in JSON file
    |
    v
Frontend polls /logs?limit=1
    |
    v
useESP32Weight hook updates state
```

---

## Security Measures

### Backend
- **Helmet**: Security headers
- **CORS**: Origin whitelisting
- **Rate Limiting**: 1000 requests/minute
- **JWT**: Token authentication (7-day expiry)
- **bcrypt**: Password hashing (salt rounds: 10)
- **Input Validation**: All endpoints validated

### Frontend
- **Token Storage**: localStorage (consider httpOnly cookies)
- **HTTPS**: Required in production
- **XSS Prevention**: React's built-in escaping

---

## Environment Variables

### Frontend (.env)
```env
VITE_SERVER_URL=https://your-backend.com
```

### Backend (.env)
```env
NODE_ENV=production
PORT=5050
HOST=0.0.0.0
USE_HTTPS=false

# Database
DATABASE_PATH=/app/data/shoppad.db

# Security
JWT_SECRET=your-secure-secret
JWT_EXPIRES_IN=7d
RATE_LIMIT_MAX_REQUESTS=1000

# CORS
ALLOWED_ORIGINS=https://your-frontend.com

# Logging
LOG_RETENTION_DAYS=30
```

---

## Key Features

### 1. Bilingual Support (EN/AR)
- `LanguageContext` manages language state
- RTL support for Arabic
- Translations in context

### 2. Offline Support
- Cart stored in localStorage
- Syncs when connection restored
- Graceful degradation

### 3. QR Code Scanning
- Product barcode scanning
- QR login authentication
- Uses `@zxing/library`

### 4. IoT Integration
- ESP32 weight sensor data
- NFC card detection
- Real-time polling (100ms for weight, 1s for NFC)

### 5. Multiple Payment Methods
- Credit Card (simulated)
- Cash
- NFC Card (auto-payment)
- Electronic Wallet
