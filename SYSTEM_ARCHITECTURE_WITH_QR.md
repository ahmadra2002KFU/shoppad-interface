# 🏗️ ShopPad System Architecture (with QR Scanner)

Complete system architecture including the new QR code scanner feature.

---

## 📊 **System Overview**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ShopPad Smart Shopping Cart System                   │
│                                  Version 1.4.0                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   ESP32 Sensor   │         │   Node.js Server │         │  React Frontend  │
│   (Weight Data)  │ ──────> │   (Port 5050)    │ <────── │   (Port 8080)    │
│                  │  HTTPS  │                  │  HTTPS  │                  │
└──────────────────┘         └──────────────────┘         └──────────────────┘
                                      │                             │
                                      │                             │
                                      ▼                             ▼
                             ┌──────────────────┐         ┌──────────────────┐
                             │  Data Storage    │         │  QR Code Scanner │
                             │  - JSON Files    │         │  - Camera Input  │
                             │  - Log Files     │         │  - Product Data  │
                             └──────────────────┘         └──────────────────┘
```

---

## 🔄 **Data Flow**

### **1. Weight Sensor Flow**

```
ESP32 Sensor → HX711 Load Cell → WiFi → HTTPS POST /weight → Server → JSON Storage
                                                                  ↓
                                                          Frontend Polling
                                                                  ↓
                                                          Weight Display
```

**Interval:** Every 0.1 seconds (real-time mode)

---

### **2. QR Code Scanner Flow**

```
Customer → Click "Scan QR Code" → Camera Opens → QR Code Detected
                                                        ↓
                                                  Parse JSON Data
                                                        ↓
                                                  Validate Data
                                                        ↓
                                            ┌───────────┴───────────┐
                                            │                       │
                                    Weight Validation?         No Validation
                                            │                       │
                                    Compare with Sensor             │
                                            │                       │
                                    ┌───────┴───────┐               │
                                    │               │               │
                                Match           Mismatch            │
                                    │               │               │
                                    └───────┬───────┘               │
                                            │                       │
                                            └───────────┬───────────┘
                                                        ↓
                                                  Add to Cart
                                                        ↓
                                                  Show Success
                                                        ↓
                                                  Close Scanner
```

---

## 🧩 **Component Architecture**

### **Frontend Components**

```
App.tsx
  │
  ├── LanguageProvider
  │     └── CartProvider
  │           └── QueryClientProvider
  │                 │
  │                 ├── Shopping.tsx (Main Page)
  │                 │     │
  │                 │     ├── Header
  │                 │     │     ├── Logo
  │                 │     │     ├── Cart Badge
  │                 │     │     └── Language Toggle
  │                 │     │
  │                 │     ├── ScannerPlaceholder
  │                 │     │     ├── Barcode Button
  │                 │     │     └── QR Code Button ──┐
  │                 │     │                           │
  │                 │     ├── Product Grid            │
  │                 │     │     └── ProductCard[]     │
  │                 │     │                           │
  │                 │     ├── Cart Tabs               │
  │                 │     │     ├── CartView          │
  │                 │     │     ├── WeeklyOffers      │
  │                 │     │     └── StoreMap          │
  │                 │     │                           │
  │                 │     └── WeightDisplay           │
  │                 │           └── useESP32Weight    │
  │                 │                                 │
  │                 └── QRScanner <──────────────────┘
  │                       │
  │                       ├── Camera Feed
  │                       ├── Scanning Indicator
  │                       ├── Success/Error Messages
  │                       └── Close Button
  │
  └── useQRScanner Hook
        │
        ├── Scanner State
        ├── Cart Integration
        ├── Weight Validation
        └── Toast Notifications
```

---

## 📦 **Data Models**

### **Product (Base)**

```typescript
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  barcode?: string;
  weight?: number;
}
```

### **QR Code Product Data**

```typescript
interface QRCodeProductData {
  id: string;           // Required
  name: string;         // Required
  price: number;        // Required (must be > 0)
  category?: string;    // Optional (default: "Other")
  weight?: number;      // Optional (in kg)
  image?: string;       // Optional (URL)
  barcode?: string;     // Optional
}
```

### **Cart Item**

```typescript
interface CartItem extends Product {
  quantity: number;
}
```

### **QR Scan Result**

```typescript
interface QRCodeScanResult {
  success: boolean;
  data?: QRCodeProductData;
  error?: string;
  rawData?: string;
}
```

---

## 🔌 **API Endpoints**

### **Server Endpoints**

| Method | Endpoint | Description | Used By |
|--------|----------|-------------|---------|
| POST | `/weight` | Receive weight data | ESP32 |
| GET | `/weight` | Get latest weight | Frontend |
| GET | `/logs` | Get weight logs | Frontend |
| GET | `/status` | Server status | Frontend |
| GET | `/stats` | Statistics | Frontend |

### **Frontend API Calls**

| Function | Endpoint | Interval | Purpose |
|----------|----------|----------|---------|
| `useESP32Weight` | GET `/weight` | 100ms | Real-time weight |
| `fetchLogs` | GET `/logs` | On demand | Historical data |
| `checkStatus` | GET `/status` | On mount | Server health |

---

## 🔐 **Security Architecture**

### **HTTPS Communication**

```
ESP32 ──[HTTPS]──> Server ──[HTTPS]──> Frontend
  │                   │                    │
  └─ Self-signed     └─ SSL/TLS          └─ Camera API
     Certificate        Encryption           (HTTPS required)
```

### **Data Validation**

```
QR Code Data → JSON Parse → Validate Schema → Validate Values → Accept/Reject
                    │              │                │
                    │              │                └─ Price > 0
                    │              └─ Required fields present
                    └─ Valid JSON format
```

### **Camera Permissions**

```
User Action → Request Permission → Browser Prompt → Allow/Deny
                                          │
                                          ├─ Allow → Camera Access
                                          └─ Deny → Error Message
```

---

## 📱 **Mobile vs Desktop Flow**

### **Desktop**

```
Desktop Browser
  │
  ├── Webcam Access
  │     └── Front Camera (default)
  │
  ├── Large Screen Layout
  │     ├── Product Grid (3 columns)
  │     └── Cart Sidebar
  │
  └── Mouse Interaction
        └── Click "Scan QR Code"
```

### **Mobile**

```
Mobile Browser
  │
  ├── Camera Access
  │     └── Back Camera (preferred)
  │
  ├── Responsive Layout
  │     ├── Product Grid (2 columns)
  │     └── Cart Tabs
  │
  └── Touch Interaction
        └── Tap "Scan QR Code"
```

---

## 🌍 **Multi-Language Architecture**

```
LanguageContext
  │
  ├── English (EN)
  │     ├── UI Translations
  │     ├── Error Messages
  │     └── Toast Notifications
  │
  └── Arabic (AR)
        ├── UI Translations (RTL)
        ├── Error Messages
        └── Toast Notifications
```

**Language Toggle:** Instant switch without page reload

---

## 🔄 **State Management**

### **Global State (Context)**

```
App
  │
  ├── LanguageContext
  │     └── language, toggleLanguage, t()
  │
  └── CartContext
        ├── cart: CartItem[]
        ├── addToCart()
        ├── removeFromCart()
        ├── updateQuantity()
        ├── clearCart()
        ├── totalItems
        ├── totalPrice
        └── currentWeight
```

### **Local State (Hooks)**

```
useQRScanner
  ├── isOpen: boolean
  ├── lastScanResult: QRCodeScanResult | null
  ├── openScanner()
  ├── closeScanner()
  └── handleScan()

useESP32Weight
  ├── weight: number | null
  ├── isLoading: boolean
  ├── isError: boolean
  ├── error: string | null
  ├── lastUpdated: Date | null
  └── refetch()
```

---

## 🎨 **UI Component Hierarchy**

```
Shopping Page
  │
  ├── Header
  │     ├── Logo + Title
  │     ├── Cart Badge (totalItems)
  │     └── Language Toggle
  │
  ├── Scanner Section
  │     ├── Barcode Button (placeholder)
  │     └── QR Code Button (functional)
  │           └── Opens QRScanner Modal
  │
  ├── Category Filters
  │     └── Button[] (All, Fresh Produce, Dairy, etc.)
  │
  ├── Product Grid
  │     └── ProductCard[]
  │           ├── Image
  │           ├── Name
  │           ├── Price
  │           └── Add Button
  │
  ├── Cart Tabs
  │     ├── Cart Tab
  │     │     └── CartView
  │     │           ├── CartItem[]
  │     │           ├── Total
  │     │           └── Checkout Button
  │     │
  │     ├── Offers Tab
  │     │     └── WeeklyOffers
  │     │
  │     └── Map Tab
  │           └── StoreMap
  │
  └── Weight Display (Fixed Bottom-Right)
        ├── Live Badge
        ├── Current Weight
        ├── Last Updated
        └── Cart Estimate
```

---

## 🚀 **Deployment Architecture**

### **DigitalOcean Droplet**

```
Droplet (138.68.137.154)
  │
  ├── Frontend (Port 8080)
  │     ├── Vite Dev Server
  │     └── React App
  │
  ├── Backend (Port 5050)
  │     ├── Node.js Server
  │     └── HTTPS Endpoints
  │
  └── PM2 Process Manager
        ├── shoppad-frontend
        └── shoppad-server
```

### **File Structure on Server**

```
/WanasishShop/shoppad-interface/
  │
  ├── src/                    # Frontend source
  ├── server/                 # Backend source
  ├── dist/                   # Built frontend
  ├── node_modules/           # Dependencies
  └── package.json            # Config
```

---

## 📊 **Performance Metrics**

| Component | Metric | Value |
|-----------|--------|-------|
| **QR Scanner** | Scan Speed | < 1 second |
| **QR Scanner** | Detection Rate | 10 FPS |
| **QR Scanner** | Camera Startup | 1-2 seconds |
| **Weight Sensor** | Update Interval | 100ms |
| **Frontend** | Poll Interval | 100ms |
| **Build** | Bundle Size | 707 KB |
| **Build** | Build Time | ~7 seconds |

---

## ✅ **System Capabilities**

### **Current Features**
- ✅ Real-time weight monitoring (100ms updates)
- ✅ QR code product scanning
- ✅ Automatic cart management
- ✅ Weight validation (optional)
- ✅ Multi-language support (EN/AR)
- ✅ Mobile responsive design
- ✅ Secure HTTPS communication
- ✅ Data persistence
- ✅ Error handling
- ✅ Toast notifications

### **Future Enhancements**
- 🔮 Barcode scanning
- 🔮 Batch QR scanning
- 🔮 Scan history
- 🔮 Product preview
- 🔮 WebSocket for real-time updates
- 🔮 Offline mode
- 🔮 PWA support

---

**System Version:** 1.4.0  
**Last Updated:** 2025-10-21  
**Status:** ✅ Production Ready

