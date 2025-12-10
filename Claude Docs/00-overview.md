# Shoppad Interface - Comprehensive Codebase Overview

**Analysis Date:** December 10, 2025
**Codebase Version:** Based on commit a0e929b (main branch)
**Project Type:** Smart Cart Application for Retail

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [Project Purpose](#project-purpose)
4. [Key Features](#key-features)
5. [Architecture Overview](#architecture-overview)
6. [Documentation Index](#documentation-index)

---

## Executive Summary

Shoppad Interface is a **React-based smart shopping cart application** designed to run on **low-cost Android devices** in retail environments. The application provides:

- Product browsing and catalog display
- QR code and barcode scanning for product identification
- Real-time weight sensor integration (ESP32/ESP8266)
- NFC-based payment checkout flow
- Bilingual support (English/Arabic with RTL)
- Integration with an external weight server for IoT sensor data

The codebase consists of:
- **Frontend:** React 18 + TypeScript + Vite + shadcn/ui
- **Backend Server:** Node.js Express server for ESP32 weight sensor and NFC data
- **No database:** Products are stored as static data; weight data is stored in JSON files

---

## Technology Stack

### Frontend (Primary Application)

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| TypeScript | 5.8.3 | Type safety |
| Vite | 5.4.19 | Build tool & dev server |
| Tailwind CSS | 3.4.17 | Utility-first styling |
| shadcn/ui | Latest | Component library (Radix primitives) |
| React Router DOM | 6.30.1 | Client-side routing |
| TanStack React Query | 5.83.0 | Server state management |
| html5-qrcode | 2.3.8 | QR code scanning |
| @zxing/library | 0.21.3 | Barcode scanning |
| sonner | 1.7.4 | Toast notifications |
| lucide-react | 0.462.0 | Icons |
| zod | 3.25.76 | Schema validation |

### Backend Server (ESP32 Integration)

| Technology | Version | Purpose |
|------------|---------|---------|
| Express | - | HTTP/HTTPS server |
| helmet | - | Security headers |
| cors | - | Cross-origin requests |
| morgan | - | Request logging |
| dotenv | - | Environment configuration |
| nodemon | - | Development auto-reload |

### Development Tools

| Tool | Purpose |
|------|---------|
| ESLint 9.x | Code linting |
| PostCSS | CSS processing |
| Bun | Package manager (lockfile present) |
| npm | Alternative package manager |

---

## Project Purpose

This application serves as the **customer-facing interface** for a smart shopping cart system in retail stores. Key use cases:

1. **Product Discovery:** Customers browse products by category
2. **Scanning:** Products are added via QR code or barcode scanning
3. **Weight Verification:** Optional ESP32 weight sensor validates product weight
4. **Cart Management:** Add, remove, adjust quantities
5. **NFC Checkout:** Contactless payment via NFC card detection
6. **Bilingual Support:** English and Arabic (with RTL layout)

**Target Hardware:** Cheap Android phones mounted on shopping carts

---

## Key Features

### Currently Implemented

1. **Product Catalog**
   - 21 products across 9 categories
   - Static product data with images
   - Category filtering
   - EAN-13 barcodes for each product

2. **Scanner Integration**
   - QR Code scanner (html5-qrcode library)
   - Barcode scanner (ZXing library)
   - Audio feedback on successful scan
   - Duplicate scan prevention

3. **Cart System**
   - Add/remove products
   - Quantity adjustment
   - Real-time total calculation
   - Weight tracking per item

4. **ESP32/IoT Integration**
   - Real-time weight sensor polling
   - NFC card detection for checkout
   - Backend server for data aggregation

5. **Internationalization**
   - English and Arabic languages
   - RTL support for Arabic
   - Dynamic language switching

6. **UI Features**
   - Dark mode support (CSS variables)
   - Responsive design
   - Weekly offers display
   - Store map viewer

---

## Architecture Overview

```
                    +-------------------+
                    |   Android Device  |
                    |   (Smart Cart)    |
                    +--------+----------+
                             |
                    +--------v----------+
                    |  Shoppad Frontend |
                    |   (React SPA)     |
                    +--------+----------+
                             |
            +----------------+----------------+
            |                                 |
   +--------v--------+              +---------v--------+
   |  Backend Server |              |   ESP32/ESP8266  |
   |  (Express.js)   |<------------>|  (IoT Sensors)   |
   +--------+--------+              +------------------+
            |                              |
   +--------v--------+              +------v------+
   |  JSON File      |              | Weight Sensor|
   |  (weight-data)  |              | NFC Reader   |
   +-----------------+              +-------------+
```

### Data Flow

1. **Product Addition via Scan:**
   - Camera captures QR/barcode
   - Parser validates and extracts data
   - Product looked up in static data
   - Added to React Context cart state

2. **Weight Verification:**
   - Frontend polls `/logs` endpoint every 100ms-3s
   - Server receives weight from ESP32 via `/weight` POST
   - Frontend compares expected vs actual weight

3. **NFC Checkout:**
   - ESP32 detects NFC card
   - Sends UID to server via `/nfc` POST
   - Frontend polls `/nfc` for unprocessed events
   - Checkout dialog triggered on detection

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [01-architecture.md](./01-architecture.md) | System architecture and component relationships |
| [02-frontend-structure.md](./02-frontend-structure.md) | React component organization and routing |
| [03-state-management.md](./03-state-management.md) | Context providers and data flow |
| [04-product-management.md](./04-product-management.md) | How products are stored and managed |
| [05-scanning-implementation.md](./05-scanning-implementation.md) | QR code and barcode scanning details |
| [06-api-reference.md](./06-api-reference.md) | Backend API endpoints |
| [07-esp32-integration.md](./07-esp32-integration.md) | Weight sensor and NFC integration |
| [08-deployment.md](./08-deployment.md) | Deployment configuration (Render, Vercel) |
| [09-file-structure.md](./09-file-structure.md) | Complete file tree and purposes |
| [10-dependencies.md](./10-dependencies.md) | Key dependencies and their purposes |

---

## Quick Start

### Frontend Development
```bash
npm install
npm run dev
# Opens on http://localhost:8080
```

### Backend Server (for ESP32 integration)
```bash
cd server
npm install
npm run generate-certs  # For local HTTPS
npm start
# Opens on https://localhost:5050
```

### Build for Production
```bash
npm run build
# Output in /dist folder
```

---

## Important Notes

1. **No Database:** Product data is hardcoded in `src/data/products.ts`. There is no SQLite or external database currently implemented.

2. **Payment is Simulated:** The NFC checkout flow shows success/failure dialogs but does not process real payments.

3. **Weight Validation Optional:** Weight sensor integration is disabled by default in scanner components.

4. **Currency:** All prices are in SAR (Saudi Riyal).
