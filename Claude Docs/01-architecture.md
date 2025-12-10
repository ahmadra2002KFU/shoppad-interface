# System Architecture

**Document:** Architecture and Component Relationships
**Last Updated:** December 10, 2025

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Server Architecture](#backend-server-architecture)
4. [Data Flow Diagrams](#data-flow-diagrams)
5. [Integration Points](#integration-points)

---

## High-Level Architecture

### System Components

```
+------------------------------------------------------------------+
|                         SMART CART SYSTEM                        |
+------------------------------------------------------------------+
|                                                                  |
|   +------------------+      +------------------+                  |
|   |   Android Phone  |      |  ESP32/ESP8266   |                  |
|   |   (Cart Device)  |      |  (IoT Module)    |                  |
|   +--------+---------+      +--------+---------+                  |
|            |                         |                           |
|            v                         v                           |
|   +------------------+      +------------------+                  |
|   | Shoppad Frontend |<---->|  Backend Server  |                  |
|   | (React SPA)      |      |  (Express.js)    |                  |
|   +--------+---------+      +--------+---------+                  |
|            |                         |                           |
|            v                         v                           |
|   +------------------+      +------------------+                  |
|   | Browser Storage  |      | JSON File Store  |                  |
|   | (In-Memory)      |      | (weight-data.json)|                 |
|   +------------------+      +------------------+                  |
|                                                                  |
+------------------------------------------------------------------+
```

### Technology Layers

| Layer | Technology | Location |
|-------|------------|----------|
| Presentation | React + shadcn/ui | `src/` |
| State Management | React Context | `src/contexts/` |
| Data Fetching | Custom Hooks + Fetch | `src/hooks/` |
| Business Logic | TypeScript Utils | `src/utils/` |
| Backend API | Express.js | `server/` |
| Data Storage | JSON Files | `server/data/` |
| IoT Integration | ESP32 HTTP Requests | External |

---

## Frontend Architecture

### React Application Structure

```
App.tsx (Root)
    |
    +-- QueryClientProvider (TanStack Query)
    |       |
    +-------+-- TooltipProvider (Radix)
                |
                +-- LanguageProvider (i18n Context)
                    |
                    +-- CartProvider (Cart Context)
                        |
                        +-- Toaster (shadcn)
                        +-- Sonner (Notifications)
                        +-- BrowserRouter
                            |
                            +-- Routes
                                |
                                +-- "/" -> Shopping (Main Page)
                                +-- "*" -> NotFound (404)
```

### Component Hierarchy

```
Shopping.tsx (Main Page)
    |
    +-- Header
    |   +-- Logo + Title
    |   +-- Item Count Badge
    |   +-- Language Toggle Button
    |
    +-- Main Content (Grid Layout)
    |   |
    |   +-- Left Column (Products)
    |   |   +-- ScannerPlaceholder
    |   |   |   +-- BarcodeScanner (Dialog)
    |   |   |   +-- QRScanner (Overlay)
    |   |   +-- Category Filter Buttons
    |   |   +-- ProductCard[] (Grid)
    |   |
    |   +-- Right Column (Tabs)
    |       +-- CartView
    |       +-- WeeklyOffers
    |       +-- StoreMap
    |
    +-- WeightDisplay (Fixed Position)
    |
    +-- NFCCheckoutDialog (Conditional)
```

### State Flow

```
User Action
    |
    v
Component (onClick, onScan)
    |
    v
Context Method (addToCart, updateQuantity)
    |
    v
useState Setter
    |
    v
Re-render (React reconciliation)
    |
    v
UI Update
```

---

## Backend Server Architecture

### Express Server Structure

```
server.js (Entry Point)
    |
    +-- Middleware Stack
    |   +-- helmet (Security Headers)
    |   +-- cors (Cross-Origin)
    |   +-- rateLimit (Request Throttling)
    |   +-- morgan (Logging)
    |   +-- bodyParser (JSON/URL parsing)
    |
    +-- Route Handlers
    |   +-- GET  /status        - Health Check
    |   +-- POST /weight        - Receive ESP32 Weight
    |   +-- GET  /logs          - Get Recent Readings
    |   +-- GET  /stats         - Get Statistics
    |   +-- POST /nfc           - Receive NFC Event
    |   +-- GET  /nfc           - Poll NFC Events
    |   +-- POST /nfc/mark-processed
    |   +-- GET  /log-files     - List Logs
    |
    +-- Error Handlers
    |   +-- 404 Handler
    |   +-- Global Error Handler
    |
    +-- Server Initialization
        +-- HTTPS (Local Dev)
        +-- HTTP (Production - Platform SSL)
```

### Configuration Management

```javascript
// config.js structure
config = {
  server: { port, host, env, externalUrl },
  ssl: { keyPath, certPath },
  logging: { retentionDays, directory, format },
  security: { rateLimitWindowMs, rateLimitMaxRequests },
  cors: { allowedOrigins: [] },
  data: { file, maxEntries },
  validation: { minWeight, maxWeight, precision }
}
```

---

## Data Flow Diagrams

### 1. Product Addition via Barcode Scan

```
[Camera] -> [BarcodeScanner Component]
                |
                v
        [ZXing Library decodes]
                |
                v
        [useBarcodeScanner hook]
                |
                v
        [barcodeParser.ts validates]
                |
                v
        [findProductByBarcode(barcode)]
                |
                v
        [products.ts data lookup]
                |
                v
        [addToCart(product)]
                |
                v
        [CartContext state update]
                |
                v
        [CartView re-renders]
```

### 2. NFC Checkout Flow

```
[ESP32 NFC Reader] --POST /nfc--> [Backend Server]
                                      |
                                      v
                              [nfcEvents array]
                                      |
                                      v
[Frontend] <--polling GET /nfc-- [Backend]
      |
      v
[useNFCDetection hook]
      |
      v
[Shopping.tsx onNFCDetected]
      |
      v
[NFCCheckoutDialog opens]
      |
      +-- User confirms --> [Simulated Payment]
      |                           |
      |                     +-----+-----+
      |                     |           |
      |                 [Success]   [Failure]
      |                     |           |
      |               [Clear Cart]  [Retry]
      |
      +-- User cancels --> [Mark as processed]
```

### 3. Weight Sensor Integration

```
[Load Cell] -> [HX711 Amplifier] -> [ESP32]
                                       |
                                POST /weight
                                       |
                                       v
                              [Backend Server]
                                       |
                                       v
                              [logger.saveWeightData()]
                                       |
                                       v
                              [weight-data.json]
                                       |
                              GET /logs?limit=1
                                       |
                                       v
[Frontend] <--useESP32Weight hook--+
      |
      v
[WeightDisplay component]
      |
      v
[Display: XX.XX kg]
```

---

## Integration Points

### Frontend to Backend API

| Frontend Component | API Endpoint | Method | Purpose |
|--------------------|--------------|--------|---------|
| `useESP32Weight` | `/logs?limit=1` | GET | Get latest weight |
| `useESP32Weight` | `/stats` | GET | Get weight statistics |
| `useNFCDetection` | `/nfc?unprocessed=true&limit=1` | GET | Poll for NFC events |
| `useNFCDetection` | `/nfc/mark-processed` | POST | Mark event processed |

### Backend to ESP32

| ESP32 Action | API Endpoint | Method | Payload |
|--------------|--------------|--------|---------|
| Send Weight | `/weight` | POST | `{ weight: number }` |
| Send NFC Event | `/nfc` | POST | `{ nfc_uid: string, event?: string }` |

### Configuration Endpoints

```
Frontend API Config: src/config/api.ts
  - SERVER_URL: Environment variable VITE_SERVER_URL or https://localhost:5050
  - POLL_INTERVAL: 100ms (weight), 1000ms (NFC)
  - TIMEOUT: 2000ms
  - ENABLED: true
```

---

## Security Considerations

### Frontend
- No authentication implemented
- CORS configured for specific origins
- Input validation on scan data

### Backend
- Helmet for security headers
- Rate limiting (1000 requests/minute)
- CORS whitelist
- Input validation for weight data
- HTTPS in development (self-signed)
- HTTP in production (platform SSL termination)

### Not Implemented
- User authentication
- Session management
- Payment processing
- Data encryption at rest
