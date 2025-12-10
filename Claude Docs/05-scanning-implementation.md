# Scanning Implementation

**Document:** QR Code and Barcode Scanning Details
**Last Updated:** December 10, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [QR Code Scanning](#qr-code-scanning)
3. [Barcode Scanning](#barcode-scanning)
4. [Scan Processing Flow](#scan-processing-flow)
5. [Weight Validation](#weight-validation)
6. [Testing and Samples](#testing-and-samples)

---

## Overview

The application supports two scanning methods:

| Method | Library | Data Format | Use Case |
|--------|---------|-------------|----------|
| QR Code | html5-qrcode | JSON object | Dynamic products (any data) |
| Barcode | @zxing/library | EAN-13/UPC-A | Static products (barcode lookup) |

### Scanning Entry Point

```typescript
// src/components/ScannerPlaceholder.tsx
// Provides two buttons that open respective scanners

<Button onClick={openBarcodeScanner}>
  <Scan /> {t("scanBarcode")}
</Button>
<Button onClick={openQRScanner}>
  <QrCode /> {t("scanQRCode")}
</Button>
```

---

## QR Code Scanning

### Library
`html5-qrcode` version 2.3.8

### Component
`src/components/QRScanner.tsx`

### Hook
`src/hooks/useQRScanner.ts`

### Parser
`src/utils/qrCodeParser.ts`

### Types
`src/types/qrcode.ts`

```typescript
export interface QRCodeProductData {
  id: string;           // Required
  name: string;         // Required
  price: number;        // Required
  category?: string;    // Optional
  weight?: number;      // Optional
  image?: string;       // Optional
  barcode?: string;     // Optional
}

export interface QRCodeScanResult {
  success: boolean;
  data?: QRCodeProductData;
  error?: string;
  rawData?: string;
}

export type QRScannerStatus = 'idle' | 'scanning' | 'success' | 'error';
```

### QR Data Format

QR codes must contain **JSON** with required fields:

```json
{
  "id": "123",
  "name": "Product Name",
  "price": 29.99,
  "category": "Fresh Produce",
  "weight": 0.5,
  "image": "https://example.com/image.jpg",
  "barcode": "6001234567890"
}
```

**Minimum required:**
```json
{"id": "1", "name": "Test Product", "price": 10.0}
```

### Parsing Logic

```typescript
// src/utils/qrCodeParser.ts
export function parseQRCodeData(qrData: string): QRCodeScanResult {
  try {
    const parsed = JSON.parse(qrData);

    // Validate required fields
    if (!parsed.id || !parsed.name || typeof parsed.price !== 'number') {
      return { success: false, error: 'Missing required fields', rawData: qrData };
    }

    // Validate price
    if (parsed.price <= 0) {
      return { success: false, error: 'Invalid price', rawData: qrData };
    }

    return {
      success: true,
      data: {
        id: String(parsed.id),
        name: String(parsed.name),
        price: Number(parsed.price),
        category: parsed.category ? String(parsed.category) : undefined,
        weight: parsed.weight ? Number(parsed.weight) : undefined,
        image: parsed.image ? String(parsed.image) : undefined,
        barcode: parsed.barcode ? String(parsed.barcode) : undefined,
      },
      rawData: qrData,
    };
  } catch (error) {
    return { success: false, error: 'Failed to parse JSON', rawData: qrData };
  }
}
```

### Scanner Implementation

```typescript
// src/components/QRScanner.tsx - Key aspects

// Camera initialization
const startScanner = async () => {
  const html5QrCode = new Html5Qrcode(qrCodeRegionId);
  const devices = await Html5Qrcode.getCameras();

  // Prefer back camera
  const backCamera = devices.find(device =>
    device.label.toLowerCase().includes('back') ||
    device.label.toLowerCase().includes('rear')
  );

  await html5QrCode.start(
    cameraId,
    { fps: 10, qrbox: { width: 250, height: 250 } },
    (decodedText) => handleScanSuccess(decodedText),
    (errorMessage) => { /* ignored */ }
  );
};

// Audio feedback
const playSuccessSound = () => {
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  // Play beep
};
```

---

## Barcode Scanning

### Library
`@zxing/library` version 0.21.3 (via `@zxing/browser`)

### Component
`src/components/BarcodeScanner.tsx`

### Hook
`src/hooks/useBarcodeScanner.ts`

### Parser
`src/utils/barcodeParser.ts`

### Types
`src/types/barcode.ts`

```typescript
export type BarcodeFormat =
  | 'EAN_13'      // 13 digits
  | 'EAN_8'       // 8 digits
  | 'UPC_A'       // 12 digits
  | 'UPC_E'       // 6 digits
  | 'CODE_128'
  | 'CODE_39'
  | 'ITF'
  | 'CODABAR'
  | 'QR_CODE';

export interface BarcodeScanResult {
  success: boolean;
  barcode?: string;
  format?: BarcodeFormat;
  error?: string;
  rawData?: string;
}

export type BarcodeScannerStatus = 'idle' | 'scanning' | 'success' | 'error';

export interface BarcodeScannerOptions {
  formats?: BarcodeFormat[];
  fps?: number;                  // Default: 10
  qrbox?: number;               // Default: 250
  audioFeedback?: boolean;      // Default: true
  preventDuplicates?: boolean;  // Default: true
  scanCooldown?: number;        // Default: 2000ms
}
```

### Validation Logic

```typescript
// src/utils/barcodeParser.ts

export function validateBarcode(barcode: string): BarcodeValidationResult {
  const cleanBarcode = barcode.trim();

  if (cleanBarcode.length === 13) {
    // EAN-13 validation
    if (!/^\d{13}$/.test(cleanBarcode)) {
      return { valid: false, message: 'EAN-13 must be 13 digits' };
    }
    if (!validateEAN13Checksum(cleanBarcode)) {
      return { valid: false, message: 'Invalid EAN-13 checksum' };
    }
    return { valid: true, format: 'EAN_13' };
  }

  if (cleanBarcode.length === 12) {
    // UPC-A validation
    // ...similar logic
    return { valid: true, format: 'UPC_A' };
  }

  // EAN-8 or other formats...
}

// EAN-13 checksum algorithm
function validateEAN13Checksum(barcode: string): boolean {
  const digits = barcode.split('').map(Number);
  const checkDigit = digits[12];

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }

  const calculatedCheckDigit = (10 - (sum % 10)) % 10;
  return checkDigit === calculatedCheckDigit;
}
```

### Product Lookup

```typescript
// src/utils/barcodeParser.ts
export function findProductByBarcode(barcode: string): Product | null {
  const cleanBarcode = barcode.trim();
  const product = products.find(p => p.barcode === cleanBarcode);
  return product || null;
}
```

### Scanner Implementation

```typescript
// src/components/BarcodeScanner.tsx - Key aspects

const startScanner = async () => {
  const codeReader = new BrowserMultiFormatReader();
  const videoInputDevices = await codeReader.listVideoInputDevices();

  // Prefer back camera
  const backCamera = videoInputDevices.find(device =>
    device.label.toLowerCase().includes('back') ||
    device.label.toLowerCase().includes('environment')
  );

  await codeReader.decodeFromVideoDevice(
    selectedDeviceId,
    videoRef.current!,
    (result, error) => {
      if (result) {
        const barcodeText = result.getText();
        // Duplicate prevention check
        if (preventDuplicates && barcodeText === lastScannedBarcode) {
          if (Date.now() - lastScanTime < scanCooldown) return;
        }
        // Process scan
        onScan({
          success: true,
          barcode: barcodeText,
          format: result.getBarcodeFormat(),
        });
      }
    }
  );
};
```

---

## Scan Processing Flow

### QR Code Flow

```
Camera captures QR code
         |
         v
html5-qrcode decodes -> raw string
         |
         v
parseQRCodeData() validates JSON
         |
         v
qrDataToProduct() converts to Product
         |
         v
useQRScanner.handleScan()
         |
         +-- Validate weight (if enabled)
         |
         v
addToCart(product)
         |
         v
toast.success("Product Added!")
         |
         v
closeScanner()
```

### Barcode Flow

```
Camera captures barcode
         |
         v
ZXing decodes -> barcode string
         |
         v
validateBarcode() checks format + checksum
         |
         v
findProductByBarcode() looks up in products[]
         |
         +-- Not found -> toast.error("Product Not Found")
         |
         v
useBarcodeScanner.handleScan()
         |
         +-- Validate weight (if enabled)
         |
         v
addToCart(product)
         |
         v
toast.success("Product Added!")
         |
         v
closeScanner()
```

---

## Weight Validation

### Configuration

Weight validation is **disabled by default** in both scanners:

```typescript
// src/components/ScannerPlaceholder.tsx

const { ... } = useQRScanner({
  validateWeightOnScan: false,  // Set to true to enable
  autoAddToCart: true,
});

const { ... } = useBarcodeScanner({
  validateWeightOnScan: false,  // Set to true to enable
  autoAddToCart: true,
});
```

### Validation Logic

```typescript
// src/utils/qrCodeParser.ts
export function validateWeight(
  qrWeight: number | undefined,
  sensorWeight: number,
  toleranceKg: number = 0.05  // 50g tolerance
): { valid: boolean; difference?: number; message?: string } {
  if (!qrWeight) {
    return { valid: true, message: 'No weight specified' };
  }

  const difference = Math.abs(sensorWeight - qrWeight);

  if (difference <= toleranceKg) {
    return { valid: true, difference, message: 'Weight matches' };
  }

  return {
    valid: false,
    difference,
    message: `Expected ${qrWeight.toFixed(2)} kg, got ${sensorWeight.toFixed(2)} kg`
  };
}
```

---

## Testing and Samples

### Sample QR Code Data

**Minimal:**
```json
{"id":"TEST001","name":"Test Product","price":10.00}
```

**Complete:**
```json
{
  "id": "PROD123",
  "name": "Premium Apples",
  "price": 25.50,
  "category": "Fresh Produce",
  "weight": 1.0,
  "barcode": "6001234567890"
}
```

### Sample Barcodes (from products.ts)

| Product | Barcode |
|---------|---------|
| Fresh Tomatoes | 6001234567890 |
| Organic Potatoes | 6001234567906 |
| Red Apples | 6001234567913 |
| Fresh Milk | 6002234567891 |
| Orange Juice | 6003234567892 |
| Pasta | 6004234567893 |
| Fresh Chicken | 6007234567896 |

### Generating Test Barcodes

```typescript
// src/utils/barcodeParser.ts
export function generateEAN13(prefix: string): string {
  let barcode = prefix.padStart(12, '0').substring(0, 12);

  const digits = barcode.split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return barcode + checkDigit;
}

// Usage
const newBarcode = generateEAN13("600999888877"); // Returns valid EAN-13
```

### Online QR Code Generators

To create test QR codes, use any QR generator with the JSON data:
- https://www.qr-code-generator.com/
- https://www.qrcode-monkey.com/

Paste the JSON directly as the QR content.
