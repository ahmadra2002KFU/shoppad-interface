# Shoppad Interface - Codebase Overview

## Project Description
Shoppad Interface is a smart shopping cart application designed to run on Android devices (including budget phones). It provides a digital shopping experience with QR code/barcode scanning, NFC-based checkout, and real-time weight validation via ESP32 sensors.

## Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite 5** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Component library (Radix UI primitives)
- **React Router DOM** - Client-side routing
- **TanStack Query** - Server state management
- **Lucide React** - Icon library

### QR/Barcode Scanning
- **html5-qrcode** - Camera-based QR/barcode scanning
- **@zxing/library** - Multi-format barcode decoding
- **qrcode.react** - QR code generation

### Other Libraries
- **date-fns** - Date utilities
- **recharts** - Charts and data visualization
- **sonner** - Toast notifications
- **zod** - Schema validation
- **react-hook-form** - Form handling

## Project Structure

```
src/
├── assets/              # Product images and static assets
├── components/          # React components
│   ├── ui/             # Shadcn UI components
│   ├── CartView.tsx    # Shopping cart display
│   ├── ProductCard.tsx # Product display card
│   ├── QRScanner.tsx   # QR code scanner
│   ├── BarcodeScanner.tsx # Barcode scanner
│   ├── ScannerPlaceholder.tsx # Scanner buttons
│   ├── NFCCheckoutDialog.tsx # NFC payment dialog
│   ├── WeightDisplay.tsx # Weight sensor display
│   ├── WeeklyOffers.tsx # Promotional offers
│   └── StoreMap.tsx    # Store navigation map
├── config/
│   └── api.ts          # API configuration for ESP32
├── contexts/
│   ├── CartContext.tsx # Shopping cart state
│   └── LanguageContext.tsx # i18n (EN/AR)
├── data/
│   └── products.ts     # Product catalog (21 products)
├── hooks/
│   ├── useQRScanner.ts # QR scanning logic
│   ├── useBarcodeScanner.ts # Barcode scanning logic
│   ├── useNFCDetection.ts # NFC card detection
│   ├── useESP32Weight.ts # Weight sensor integration
│   └── use-mobile.tsx  # Mobile detection
├── lib/
│   └── utils.ts        # Utility functions (cn)
├── pages/
│   ├── Shopping.tsx    # Main shopping page
│   ├── QRCodes.tsx     # QR code generation page
│   └── NotFound.tsx    # 404 page
├── types/
│   ├── product.ts      # Product interfaces
│   ├── qrcode.ts       # QR code data types
│   └── barcode.ts      # Barcode types
├── utils/
│   ├── qrCodeParser.ts # QR data parsing/generation
│   └── barcodeParser.ts # Barcode parsing
├── App.tsx             # Root component with providers
└── main.tsx            # Application entry point
```

## Core Features

### 1. Product Catalog
- 21 pre-configured products across 9 categories
- Categories: Fresh Produce, Dairy & Bakery, Beverages, Pantry Staples, Household, Snacks, Meat & Poultry, Clothing, Kitchen
- Products have: id, name, category, price, image, barcode (EAN-13), weight (kg)

### 2. QR Code Scanning
- Camera-based scanning using html5-qrcode
- JSON format: `{"id": "1", "name": "...", "price": 10.99, "category": "...", "weight": 0.5, "barcode": "..."}`
- Auto-add to cart on successful scan
- Weight validation support (optional)

### 3. Barcode Scanning
- EAN-13 barcode support
- Products matched by barcode field in catalog
- Camera-based detection

### 4. NFC Checkout
- Polls backend server for NFC card events
- Confirmation dialog before payment
- Success/failure handling with visual feedback

### 5. Weight Validation
- Integration with ESP32 weight sensor via HTTPS API
- Real-time weight display
- Product weight validation during scanning

### 6. Internationalization
- English and Arabic language support
- RTL layout support for Arabic
- Language toggle in header

### 7. QR Code Generation (NEW)
- `/qr-codes` page displays all product QR codes
- Grid and list view modes
- Print all QR codes functionality
- Individual QR code download (SVG)
- Search and filter by category

## API Configuration

The application connects to an ESP32 backend server:

```typescript
// src/config/api.ts
export const API_CONFIG = {
  SERVER_URL: import.meta.env.VITE_SERVER_URL || 'https://localhost:5050',
  POLL_INTERVAL: 100,  // 100ms for weight updates
  TIMEOUT: 2000,
  ENABLED: true,
};
```

### Endpoints
- `GET /weight` - Current weight reading
- `GET /status` - Server status
- `GET /nfc?unprocessed=true` - Unprocessed NFC events
- `POST /nfc/mark-processed` - Mark NFC event as processed

## State Management

### Cart Context
- Centralized cart state using React Context
- Functions: addToCart, removeFromCart, updateQuantity, clearCart
- Computed values: totalItems, totalPrice, currentWeight

### Language Context
- Current language state (en/ar)
- Translation function `t(key)`
- RTL document direction management

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Shopping | Main shopping interface |
| `/qr-codes` | QRCodes | QR code generation page |
| `*` | NotFound | 404 page |

## Environment Variables

```env
VITE_SERVER_URL=https://your-server:5050
```

## Build & Development

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Deployment

The application is configured for deployment on Vercel. Build output is in the `dist/` folder.

## Mobile Optimization Considerations

For cheap Android phones:
- Lightweight component library (Shadcn/UI)
- Efficient state management (Context + TanStack Query)
- Lazy loading potential for routes
- Touch-friendly UI with adequate touch targets
- Responsive grid layouts
- Camera-based scanning (no NFC hardware required)
