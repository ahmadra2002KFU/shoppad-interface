# Frontend Structure

**Document:** React Component Organization and Routing
**Last Updated:** December 10, 2025

---

## Table of Contents

1. [Application Entry Point](#application-entry-point)
2. [Routing Configuration](#routing-configuration)
3. [Component Organization](#component-organization)
4. [UI Component Library](#ui-component-library)
5. [Styling System](#styling-system)

---

## Application Entry Point

### main.tsx
```typescript
// Location: src/main.tsx
// Purpose: React DOM render root

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

### App.tsx Provider Stack
```typescript
// Location: src/App.tsx
// Provider hierarchy (outer to inner):

1. QueryClientProvider    // TanStack Query for server state
2. TooltipProvider        // Radix UI tooltips
3. LanguageProvider       // Custom i18n context
4. CartProvider           // Shopping cart state
5. Toaster + Sonner       // Notification systems
6. BrowserRouter          // React Router
7. Routes                 // Route definitions
```

---

## Routing Configuration

### Current Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Shopping` | Main shopping interface |
| `*` | `NotFound` | 404 fallback page |

### Route Implementation
```typescript
// src/App.tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Shopping />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

### Pages Directory
```
src/pages/
  +-- Shopping.tsx     # Main page (195 lines)
  +-- NotFound.tsx     # 404 page
```

---

## Component Organization

### Directory Structure
```
src/components/
  |
  +-- ui/              # shadcn/ui components (51 files)
  |   +-- accordion.tsx
  |   +-- alert-dialog.tsx
  |   +-- alert.tsx
  |   +-- button.tsx
  |   +-- card.tsx
  |   +-- dialog.tsx
  |   +-- ... (45 more)
  |
  +-- BarcodeScanner.tsx      # Camera barcode scanner
  +-- CartView.tsx            # Shopping cart display
  +-- NFCCheckoutDialog.tsx   # NFC payment dialogs
  +-- ProductCard.tsx         # Product display card
  +-- QRScanner.tsx           # Camera QR code scanner
  +-- ScannerPlaceholder.tsx  # Scanner buttons container
  +-- StoreMap.tsx            # Store layout viewer
  +-- WeeklyOffers.tsx        # Promotions display
  +-- WeightDisplay.tsx       # ESP32 weight readout
```

### Component Details

#### Shopping.tsx (Main Page)
```typescript
// Location: src/pages/Shopping.tsx
// Purpose: Primary shopping interface

State:
  - selectedCategory: string | null
  - showCheckoutDialog: boolean
  - showSuccessDialog: boolean
  - showFailureDialog: boolean
  - currentNFCEvent: { uid, timestamp } | null

Hooks Used:
  - useCart() - Cart context
  - useLanguage() - i18n context
  - useNFCDetection() - NFC polling

Layout:
  - Header (sticky)
  - Two-column grid (products | cart/offers/map)
  - Fixed WeightDisplay (bottom-right)
  - NFCCheckoutDialog (conditional overlay)
```

#### ProductCard.tsx
```typescript
// Location: src/components/ProductCard.tsx
// Purpose: Display single product with add-to-cart

Props:
  - product: Product

Features:
  - Product image with hover scale
  - Name, category, price display
  - Add to Cart button
  - Toast notification on add
```

#### CartView.tsx
```typescript
// Location: src/components/CartView.tsx
// Purpose: Shopping cart display and checkout

Features:
  - Item list with images
  - Quantity controls (+/-)
  - Remove item button
  - Total calculation
  - Checkout button
  - NFC payment dialogs (local version)

Note: Has duplicate NFC dialogs - main version is in Shopping.tsx
```

#### ScannerPlaceholder.tsx
```typescript
// Location: src/components/ScannerPlaceholder.tsx
// Purpose: Container for scanner buttons

Integrates:
  - useQRScanner() hook
  - useBarcodeScanner() hook
  - QRScanner component
  - BarcodeScanner component

UI: Two buttons - "Scan Barcode" and "Scan QR Code"
```

#### QRScanner.tsx
```typescript
// Location: src/components/QRScanner.tsx
// Purpose: Camera-based QR code scanner

Library: html5-qrcode
Props:
  - isOpen: boolean
  - onClose: () => void
  - onScan: (result: QRCodeScanResult) => void

Features:
  - Camera selection (prefers back camera)
  - Scanning status display
  - Audio feedback on scan
  - Auto-close on success
  - Error handling
```

#### BarcodeScanner.tsx
```typescript
// Location: src/components/BarcodeScanner.tsx
// Purpose: Camera-based barcode scanner

Library: @zxing/library (BrowserMultiFormatReader)
Props:
  - isOpen: boolean
  - onClose: () => void
  - onScan: (result: BarcodeScanResult) => void
  - audioFeedback?: boolean (default: true)
  - preventDuplicates?: boolean (default: true)
  - scanCooldown?: number (default: 2000ms)

Features:
  - Multi-format barcode support
  - Animated scanning overlay
  - Corner markers visual
  - Duplicate prevention
  - Camera selection
```

#### WeightDisplay.tsx
```typescript
// Location: src/components/WeightDisplay.tsx
// Purpose: Real-time weight sensor display

Props:
  - calculatedWeight?: number (optional cart weight)

Features:
  - Live/Offline status indicator
  - Real-time weight display (kg)
  - Last updated timestamp
  - Cart estimate comparison
  - Retry button on error
  - Fixed position (bottom-right)
```

#### NFCCheckoutDialog.tsx
```typescript
// Location: src/components/NFCCheckoutDialog.tsx
// Purpose: NFC payment flow dialogs

Props:
  - isOpen: boolean
  - onConfirm: () => void
  - onCancel: () => void
  - showSuccess?: boolean
  - showFailure?: boolean
  - onSuccessClose?: () => void
  - onFailureClose?: () => void

Renders (conditionally):
  1. Checkout confirmation dialog
  2. Payment success dialog
  3. Payment failure dialog
```

---

## UI Component Library

### shadcn/ui Components Used

Located in `src/components/ui/`, these are Radix UI primitive wrappers styled with Tailwind:

| Component | Usage in App |
|-----------|--------------|
| `Button` | All buttons |
| `Card` | Product cards, cart, offers |
| `Dialog` | Scanner modals, NFC dialogs |
| `Badge` | Item count, status indicators |
| `Tabs` | Cart/Offers/Map tabs |
| `Alert` | Scanner status messages |
| `Sheet` | (Available but unused) |
| `Toaster` | Toast notifications |

### Component Configuration
```json
// components.json
{
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

## Styling System

### Tailwind Configuration

```typescript
// tailwind.config.ts highlights

// Dark mode via class
darkMode: ["class"]

// Container settings
container: {
  center: true,
  padding: "2rem",
  screens: { "2xl": "1400px" }
}

// Custom colors (CSS variables)
colors: {
  primary, secondary, destructive,
  muted, accent, popover, card, border
}

// Custom animations
animation: {
  "accordion-down": "accordion-down 0.2s ease-out",
  "accordion-up": "accordion-up 0.2s ease-out"
}
```

### CSS Variables (Theme)

```css
/* src/index.css - Light theme */
:root {
  --background: 210 40% 98%;
  --foreground: 220 20% 15%;
  --primary: 185 84% 42%;        /* Teal/cyan */
  --secondary: 210 30% 95%;
  --accent: 32 95% 58%;           /* Orange */
  --destructive: 0 84% 60%;       /* Red */
  --border: 214 25% 88%;
  --radius: 0.75rem;
}

/* Dark theme */
.dark {
  --background: 220 25% 10%;
  --foreground: 210 30% 95%;
  --primary: 185 84% 48%;
  /* ... */
}
```

### RTL Support

```typescript
// src/contexts/LanguageContext.tsx
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

---

## Path Aliases

Configured in `tsconfig.json` for clean imports:

```typescript
// @/* maps to ./src/*
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@/types/product";
```
