# State Management

**Document:** Context Providers and Data Flow
**Last Updated:** December 10, 2025

---

## Table of Contents

1. [State Management Overview](#state-management-overview)
2. [CartContext](#cartcontext)
3. [LanguageContext](#languagecontext)
4. [Custom Hooks](#custom-hooks)
5. [Data Flow Patterns](#data-flow-patterns)

---

## State Management Overview

The application uses **React Context API** for global state, with no external state management library (Redux, Zustand, etc.).

### State Categories

| Category | Solution | Location |
|----------|----------|----------|
| Shopping Cart | React Context | `src/contexts/CartContext.tsx` |
| Language/i18n | React Context | `src/contexts/LanguageContext.tsx` |
| Server State | Custom Hooks + Fetch | `src/hooks/` |
| UI State | Local useState | Individual components |
| Scanning State | Custom Hooks | `src/hooks/useQRScanner.ts`, `useBarcodeScanner.ts` |

### Provider Hierarchy

```typescript
// src/App.tsx
<QueryClientProvider>       // TanStack Query (declared but minimally used)
  <TooltipProvider>         // Radix UI
    <LanguageProvider>      // Language/translations
      <CartProvider>        // Shopping cart
        {/* Routes */}
      </CartProvider>
    </LanguageProvider>
  </TooltipProvider>
</QueryClientProvider>
```

---

## CartContext

### Location
`src/contexts/CartContext.tsx`

### Interface
```typescript
interface CartContextType {
  cart: CartItem[];                              // Current cart items
  addToCart: (product: Product) => void;         // Add or increment item
  removeFromCart: (productId: string) => void;   // Remove item completely
  updateQuantity: (productId: string, quantity: number) => void;  // Set quantity
  clearCart: () => void;                         // Empty the cart
  totalItems: number;                            // Sum of all quantities
  totalPrice: number;                            // Sum of (price * quantity)
  currentWeight: number;                         // Sum of (weight * quantity)
}
```

### Data Types
```typescript
// src/types/product.ts
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  barcode?: string;
  weight?: number;  // in kg
}

interface CartItem extends Product {
  quantity: number;
}
```

### Implementation Details

```typescript
// Adding to cart
const addToCart = (product: Product) => {
  setCart((prev) => {
    const existing = prev.find((item) => item.id === product.id);
    if (existing) {
      // Increment quantity if already in cart
      return prev.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    }
    // Add new item with quantity 1
    return [...prev, { ...product, quantity: 1 }];
  });
};

// Computed values
const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
const currentWeight = cart.reduce((sum, item) => sum + (item.weight || 0) * item.quantity, 0);
```

### Usage
```typescript
import { useCart } from "@/contexts/CartContext";

function MyComponent() {
  const { cart, addToCart, totalPrice } = useCart();
  // ...
}
```

---

## LanguageContext

### Location
`src/contexts/LanguageContext.tsx`

### Interface
```typescript
type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;           // Current language
  toggleLanguage: () => void;   // Switch between en/ar
  t: (key: string) => string;   // Get translation
}
```

### Translation Keys

The context contains inline translations for:

**English (`en`):**
- Header: smartCart, items
- Categories: all, groceries, bakery, dairy, beverages, cleaning, clothing, kitchen, snacks, meat
- Scanner: scanBarcode, scanQRCode, scanningQRCode, qrCodeScanned, barcodeScanned, etc.
- Cart: cart, emptyCart, startShopping, total, checkout
- Offers: offers, weeklyOffers, freshProduceSale, etc.
- Map: map, storeMap, clickToEnlarge
- Weight: currentWeight
- Payment: waitingForNFC, tapYourCard, paymentSuccessful, paymentFailed, etc.
- NFC Checkout: nfcCheckoutTitle, nfcCheckoutMessage, nfcDetected, etc.

**Arabic (`ar`):**
- Complete translations for all above keys
- RTL support via document.dir attribute

### RTL Implementation
```typescript
useEffect(() => {
  if (language === "ar") {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";
  } else {
    document.documentElement.dir = "ltr";
    document.documentElement.lang = "en";
  }
}, [language]);
```

### Usage
```typescript
import { useLanguage } from "@/contexts/LanguageContext";

function MyComponent() {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <div>
      <h1>{t("smartCart")}</h1>
      <button onClick={toggleLanguage}>
        {language === "en" ? "AR" : "EN"}
      </button>
    </div>
  );
}
```

---

## Custom Hooks

### useESP32Weight

**Location:** `src/hooks/useESP32Weight.ts`

**Purpose:** Poll backend server for weight sensor data

```typescript
interface UseESP32WeightOptions {
  pollInterval?: number;   // Default: 100ms from API_CONFIG
  serverUrl?: string;      // Default: from API_CONFIG
  enabled?: boolean;       // Default: true
}

interface UseESP32WeightReturn {
  weight: number | null;       // Latest weight reading
  isLoading: boolean;          // Initial load state
  isError: boolean;            // Error state
  error: string | null;        // Error message
  lastUpdated: Date | null;    // Last successful fetch
  stats: WeightStats | null;   // Aggregated statistics
  refetch: () => Promise<void>; // Manual refresh
}
```

**Data Source:** `GET /logs?limit=1` from backend server

### useNFCDetection

**Location:** `src/hooks/useNFCDetection.ts`

**Purpose:** Poll backend for NFC card detection events

```typescript
interface UseNFCDetectionOptions {
  pollInterval?: number;   // Default: 1000ms (1 second)
  serverUrl?: string;      // Default: from API_CONFIG
  enabled?: boolean;       // Default: true
  onNFCDetected?: (event: NFCEvent) => void;  // Callback on detection
}

interface UseNFCDetectionReturn {
  nfcEvent: NFCEvent | null;    // Latest unprocessed event
  isDetecting: boolean;         // Polling state
  isError: boolean;             // Error state
  error: string | null;         // Error message
  markAsProcessed: (uid: string, timestamp: string) => Promise<void>;
  refetch: () => Promise<void>; // Manual refresh
}

interface NFCEvent {
  uid: string;
  event: string;
  timestamp: string;
  deviceId?: string;
  processed: boolean;
}
```

**Data Source:** `GET /nfc?unprocessed=true&limit=1` from backend server

### useQRScanner

**Location:** `src/hooks/useQRScanner.ts`

**Purpose:** Manage QR scanner state and cart integration

```typescript
interface UseQRScannerOptions {
  validateWeightOnScan?: boolean;  // Default: false
  weightTolerance?: number;        // Default: 0.05 kg (50g)
  autoAddToCart?: boolean;         // Default: true
  defaultProductImage?: string;
}

// Returns
{
  isOpen: boolean;
  openScanner: () => void;
  closeScanner: () => void;
  handleScan: (result: QRCodeScanResult) => void;
  lastScanResult: QRCodeScanResult | null;
}
```

**Features:**
- Parses QR JSON data into Product
- Optional weight validation against sensor
- Auto-adds to cart on successful scan
- Toast notifications for success/error

### useBarcodeScanner

**Location:** `src/hooks/useBarcodeScanner.ts`

**Purpose:** Manage barcode scanner state and cart integration

```typescript
interface UseBarcodeScannerOptions {
  autoAddToCart?: boolean;         // Default: true
  validateWeightOnScan?: boolean;  // Default: false
  weightTolerance?: number;        // Default: 0.05 kg
  defaultProductImage?: string;
  sensorWeight?: number | null;    // For weight validation
}

// Returns
{
  isOpen: boolean;
  openScanner: () => void;
  closeScanner: () => void;
  handleScan: (result: BarcodeScanResult) => void;
  lastScanResult: BarcodeScanResult | null;
}
```

**Features:**
- Validates barcode format (EAN-13, UPC-A, etc.)
- Looks up product in static data by barcode
- Optional weight validation
- Auto-adds to cart

---

## Data Flow Patterns

### Product Addition Flow

```
1. User clicks "Add to Cart" or scans product
         |
         v
2. Component calls addToCart(product)
         |
         v
3. CartContext setState updates cart array
         |
         v
4. React re-renders all components using useCart()
         |
         v
5. CartView shows updated items
   ProductCard buttons are available
   Header badge shows new count
```

### Scanner to Cart Flow

```
1. User opens scanner (QR or Barcode)
         |
         v
2. Camera captures code
         |
         v
3. Library decodes (html5-qrcode or ZXing)
         |
         v
4. Parser validates data
   - QR: parseQRCodeData() -> JSON -> Product fields
   - Barcode: validateBarcode() + findProductByBarcode()
         |
         v
5. Hook calls addToCart() from CartContext
         |
         v
6. Toast notification shown
         |
         v
7. Scanner closes automatically
```

### NFC Checkout Flow

```
1. ESP32 detects NFC card
         |
         v
2. ESP32 POSTs to /nfc endpoint
         |
         v
3. Server stores event in memory (nfcEvents array)
         |
         v
4. Frontend polls GET /nfc every 1 second
         |
         v
5. useNFCDetection receives event
         |
         v
6. onNFCDetected callback in Shopping.tsx
         |
         v
7. NFCCheckoutDialog opens (if cart has items)
         |
         v
8. User confirms -> Simulated payment
         |
         v
9. On success:
   - Show success dialog
   - clearCart()
   - markAsProcessed()
```

### Weight Display Flow

```
1. ESP32 sends weight to POST /weight
         |
         v
2. Server stores in JSON file
         |
         v
3. Frontend polls GET /logs every 100ms-3s
         |
         v
4. useESP32Weight updates state
         |
         v
5. WeightDisplay component re-renders
         |
         v
6. Shows: "XX.XX kg" + status indicator
```
