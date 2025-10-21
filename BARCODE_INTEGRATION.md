# 📊 Barcode Scanner Integration Guide

Complete guide for the barcode scanning feature in ShopPad.

---

## 📋 **Table of Contents**

- [Overview](#overview)
- [Features](#features)
- [Barcode Format](#barcode-format)
- [Usage](#usage)
- [Technical Implementation](#technical-implementation)
- [Configuration](#configuration)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [API Reference](#api-reference)

---

## 🎯 **Overview**

The barcode scanner allows customers to scan product barcodes using their device camera to automatically add products to the shopping cart. The system supports multiple barcode formats including EAN-13, UPC-A, Code-128, and more.

### **Key Capabilities**

- ✅ Camera-based barcode scanning (desktop & mobile)
- ✅ Real-time barcode detection (10+ FPS)
- ✅ Multiple barcode format support
- ✅ Automatic product lookup and cart addition
- ✅ Visual and audio feedback
- ✅ Optional weight validation with ESP32 sensor
- ✅ Multi-language support (English & Arabic)
- ✅ Mobile-responsive design

---

## ✨ **Features**

### **1. Camera Integration**

- **Desktop:** Uses webcam for scanning
- **Mobile:** Automatically selects back camera
- **Permissions:** Requests camera access on first use
- **Preview:** Live camera feed with scanning overlay

### **2. Barcode Detection**

- **Library:** ZXing (@zxing/library)
- **Formats Supported:**
  - EAN-13 (European Article Number - 13 digits)
  - EAN-8 (European Article Number - 8 digits)
  - UPC-A (Universal Product Code - 12 digits)
  - UPC-E (Universal Product Code - 6 digits)
  - Code-128
  - Code-39
  - ITF (Interleaved 2 of 5)
  - Codabar

### **3. Product Lookup**

- Scanned barcode is validated
- Product is looked up in catalog
- If found, product is added to cart
- If not found, error message is shown

### **4. User Feedback**

- **Visual:**
  - Scanning animation
  - Success indicator (green checkmark)
  - Error indicator (red alert)
- **Audio:**
  - Beep sound on successful scan
  - Configurable (can be disabled)
- **Toast Notifications:**
  - Success: "Product Added - {name} - {price} SAR"
  - Error: "Product Not Found" or "Invalid Barcode"

### **5. Weight Validation (Optional)**

- Compare scanned product weight with ESP32 sensor reading
- Configurable tolerance (default: 50 grams)
- Prevents incorrect product scanning

---

## 📊 **Barcode Format**

### **EAN-13 Format (Primary)**

All ShopPad products use EAN-13 barcodes with valid checksums.

**Structure:**
```
6 0 0 1 2 3 4 5 6 7 8 9 0
│ └─┬─┘ └────┬────┘ └─┬─┘
│   │        │        └─ Check digit
│   │        └────────── Product code
│   └─────────────────── Company prefix
└─────────────────────── Country code (600 = South Africa, used as example)
```

**Example Barcodes:**
- Fresh Tomatoes: `6001234567890`
- Organic Potatoes: `6001234567906`
- Red Apples: `6001234567913`

See [BARCODE_SAMPLES.md](BARCODE_SAMPLES.md) for complete list.

### **Checksum Validation**

All barcodes are validated with proper EAN-13 checksums to ensure accuracy.

---

## 🚀 **Usage**

### **For Customers**

1. **Open App:** Navigate to `http://138.68.137.154:8080/`
2. **Click Button:** Tap "Scan Barcode" button
3. **Allow Camera:** Grant camera permission (first time only)
4. **Position Barcode:** Hold barcode 15-30cm from camera
5. **Wait for Beep:** Scanner will beep when barcode is detected
6. **Product Added:** Product automatically added to cart

### **For Developers**

#### **Basic Integration**

```typescript
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';

function MyComponent() {
  const { isOpen, openScanner, closeScanner, handleScan } = useBarcodeScanner({
    autoAddToCart: true,
  });

  return (
    <>
      <button onClick={openScanner}>Scan Barcode</button>
      <BarcodeScanner 
        isOpen={isOpen} 
        onClose={closeScanner} 
        onScan={handleScan} 
      />
    </>
  );
}
```

#### **With Weight Validation**

```typescript
const { isOpen, openScanner, closeScanner, handleScan } = useBarcodeScanner({
  autoAddToCart: true,
  validateWeightOnScan: true,
  weightTolerance: 0.05, // 50 grams
  sensorWeight: currentWeight, // from ESP32
});
```

---

## 🔧 **Technical Implementation**

### **Architecture**

```
User Action
    ↓
Click "Scan Barcode"
    ↓
useBarcodeScanner Hook
    ↓
BarcodeScanner Component
    ↓
ZXing Library (Camera + Detection)
    ↓
Barcode Detected
    ↓
barcodeParser.ts (Validation)
    ↓
Product Lookup (products.ts)
    ↓
Add to Cart (CartContext)
    ↓
Toast Notification
    ↓
Close Scanner
```

### **Core Components**

#### **1. BarcodeScanner Component** (`src/components/BarcodeScanner.tsx`)

- Manages camera access
- Displays live video feed
- Handles barcode detection
- Shows visual feedback
- Plays audio feedback

**Key Features:**
- Uses `@zxing/library` for barcode detection
- Automatic camera selection (back camera on mobile)
- Duplicate scan prevention
- Configurable scan cooldown
- Error handling for camera permissions

#### **2. useBarcodeScanner Hook** (`src/hooks/useBarcodeScanner.ts`)

- Manages scanner state (open/close)
- Handles scan results
- Integrates with cart
- Optional weight validation
- Toast notifications

**Options:**
```typescript
interface UseBarcodeScannerOptions {
  autoAddToCart?: boolean;          // Default: true
  validateWeightOnScan?: boolean;   // Default: false
  weightTolerance?: number;          // Default: 0.05 kg
  defaultProductImage?: string;      // Default: '/placeholder-product.jpg'
  sensorWeight?: number | null;      // From ESP32
}
```

#### **3. Barcode Parser** (`src/utils/barcodeParser.ts`)

- Validates barcode format
- Calculates and verifies checksums
- Finds products by barcode
- Formats barcodes for display

**Key Functions:**
```typescript
validateBarcode(barcode: string): BarcodeValidationResult
findProductByBarcode(barcode: string): Product | null
processBarcodeScann(barcodeText: string): BarcodeScanResult
generateEAN13(prefix: string): string
formatBarcodeForDisplay(barcode: string, format?: BarcodeFormat): string
```

#### **4. TypeScript Types** (`src/types/barcode.ts`)

- `BarcodeFormat`: Supported barcode formats
- `BarcodeScanResult`: Scan operation result
- `BarcodeScannerStatus`: Scanner state
- `BarcodeValidationResult`: Validation result
- `BarcodeScannerOptions`: Configuration options

---

## ⚙️ **Configuration**

### **Scanner Options**

```typescript
<BarcodeScanner
  isOpen={true}
  onClose={() => {}}
  onScan={(result) => {}}
  audioFeedback={true}        // Enable beep sound
  preventDuplicates={true}    // Prevent duplicate scans
  scanCooldown={2000}         // 2 seconds between scans
/>
```

### **Hook Options**

```typescript
useBarcodeScanner({
  autoAddToCart: true,              // Auto-add to cart
  validateWeightOnScan: false,      // Validate weight
  weightTolerance: 0.05,            // 50g tolerance
  defaultProductImage: '/img.jpg',  // Default image
  sensorWeight: 1.5,                // Current weight
})
```

---

## 🧪 **Testing**

### **Quick Test**

1. Print a test barcode (e.g., `6001234567890` - Fresh Tomatoes)
2. Open app and click "Scan Barcode"
3. Allow camera access
4. Scan the printed barcode
5. Verify product is added to cart

### **Test Scenarios**

See [BARCODE_TESTING_GUIDE.md](BARCODE_TESTING_GUIDE.md) for comprehensive test cases.

---

## 🐛 **Troubleshooting**

### **Camera Not Starting**

**Symptoms:**
- Black screen
- "No camera found" error
- Permission denied

**Solutions:**
1. Check browser permissions (Settings → Privacy → Camera)
2. Ensure HTTPS is enabled (camera API requires secure context)
3. Try different browser (Chrome recommended)
4. Check if camera is in use by another app
5. Restart browser

### **Barcode Not Detected**

**Symptoms:**
- Scanner running but not detecting barcode
- No beep sound

**Solutions:**
1. Ensure good lighting
2. Hold barcode steady (15-30cm from camera)
3. Use high-quality printed barcode (300 DPI minimum)
4. Ensure barcode is at least 3cm wide
5. Clean camera lens
6. Try different angle

### **Wrong Product Added**

**Symptoms:**
- Different product added than scanned

**Solutions:**
1. Verify barcode number matches product
2. Check `src/data/products.ts` for correct barcode assignment
3. Ensure barcode has valid checksum
4. Clear browser cache and reload

### **"Product Not Found" Error**

**Symptoms:**
- Barcode scans successfully but product not found

**Solutions:**
1. Verify barcode exists in `src/data/products.ts`
2. Check barcode format (must be exact match)
3. Ensure product data is loaded
4. Check browser console for errors

---

## 📚 **API Reference**

### **useBarcodeScanner Hook**

```typescript
const {
  isOpen,           // boolean - Scanner open state
  openScanner,      // () => void - Open scanner
  closeScanner,     // () => void - Close scanner
  handleScan,       // (result: BarcodeScanResult) => void - Handle scan
  lastScanResult,   // BarcodeScanResult | null - Last scan result
} = useBarcodeScanner(options);
```

### **BarcodeScanner Component**

```typescript
<BarcodeScanner
  isOpen={boolean}                    // Required - Open state
  onClose={() => void}                // Required - Close handler
  onScan={(result) => void}           // Required - Scan handler
  audioFeedback={boolean}             // Optional - Enable beep (default: true)
  preventDuplicates={boolean}         // Optional - Prevent duplicates (default: true)
  scanCooldown={number}               // Optional - Cooldown ms (default: 2000)
/>
```

### **Barcode Parser Functions**

```typescript
// Validate barcode format and checksum
validateBarcode(barcode: string): BarcodeValidationResult

// Find product by barcode
findProductByBarcode(barcode: string): Product | null

// Process scanned barcode
processBarcodeScann(barcodeText: string): BarcodeScanResult

// Generate EAN-13 with checksum
generateEAN13(prefix: string): string

// Format barcode for display
formatBarcodeForDisplay(barcode: string, format?: BarcodeFormat): string

// Get format name
getBarcodeFormatName(format?: BarcodeFormat): string
```

---

## 🔗 **Related Documentation**

- [BARCODE_SAMPLES.md](BARCODE_SAMPLES.md) - All product barcodes
- [BARCODE_TESTING_GUIDE.md](BARCODE_TESTING_GUIDE.md) - Testing guide
- [BARCODE_DEPLOYMENT.md](BARCODE_DEPLOYMENT.md) - Deployment guide
- [CHANGELOG.md](CHANGELOG.md) - Version history

---

## 📞 **Support**

For issues:
1. Check [Troubleshooting](#troubleshooting) section
2. Review browser console for errors
3. Test with sample barcodes from [BARCODE_SAMPLES.md](BARCODE_SAMPLES.md)
4. Verify camera permissions

---

**Version:** 1.5.0  
**Last Updated:** 2025-10-21  
**Status:** ✅ Production Ready

