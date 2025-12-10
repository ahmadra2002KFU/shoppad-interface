# QR Code System Documentation

## Overview

The Shoppad Interface uses JSON-formatted QR codes to encode product information. When scanned, products are automatically added to the shopping cart.

## QR Code Format

### JSON Structure

```json
{
  "id": "1",
  "name": "Fresh Tomatoes",
  "price": 11.25,
  "category": "Fresh Produce",
  "weight": 0.5,
  "barcode": "6001234567890"
}
```

### Required Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique product identifier |
| `name` | string | Product display name |
| `price` | number | Price in SAR (must be > 0) |

### Optional Fields
| Field | Type | Description |
|-------|------|-------------|
| `category` | string | Product category (defaults to "Other") |
| `weight` | number | Weight in kg (for weight validation) |
| `barcode` | string | EAN-13 barcode number |
| `image` | string | Image URL (uses placeholder if not provided) |

## Generating QR Codes

### Using the QR Codes Page

1. Navigate to `/qr-codes` or click the QR icon in the header
2. View all product QR codes in grid or list view
3. Filter by category or search by name/barcode
4. Download individual QR codes as SVG
5. Print all QR codes for physical use

### Programmatic Generation

```typescript
import { productToQRData } from "@/utils/qrCodeParser";
import { Product } from "@/types/product";

const product: Product = {
  id: "1",
  name: "Fresh Tomatoes",
  price: 11.25,
  category: "Fresh Produce",
  weight: 0.5,
  barcode: "6001234567890",
  image: "/assets/tomato.jpg"
};

// Generate QR data string
const qrData = productToQRData(product);
// Result: '{"id":"1","name":"Fresh Tomatoes","price":11.25,...}'
```

### Using QRCodeSVG Component

```tsx
import { QRCodeSVG } from "qrcode.react";
import { productToQRData } from "@/utils/qrCodeParser";

<QRCodeSVG
  value={productToQRData(product)}
  size={150}
  level="M"
  includeMargin={false}
/>
```

## Scanning QR Codes

### Scanning Flow

1. User taps "Scan QR Code" button
2. Camera opens with scanning frame
3. User positions QR code in frame
4. On successful scan:
   - QR data is parsed from JSON
   - Required fields are validated
   - (Optional) Weight is validated against sensor
   - Product is added to cart
   - Success toast notification shown
   - Scanner closes automatically

### Error Handling

| Error | Cause | User Message |
|-------|-------|--------------|
| Parse Error | Invalid JSON | "Failed to parse QR code" |
| Missing Fields | No id/name/price | "Invalid QR code format: missing required fields" |
| Invalid Price | Price <= 0 | "Invalid price: must be greater than 0" |
| Weight Mismatch | Sensor weight differs | "Weight mismatch: Expected X kg, got Y kg" |

## Weight Validation

When enabled, the system validates product weight:

```typescript
// In useQRScanner hook
const { weight: sensorWeight } = useESP32Weight({ enabled: validateWeightOnScan });

// Tolerance: 50g (0.05 kg) by default
const weightValidation = validateWeight(
  qrData.weight,    // Expected weight from QR
  sensorWeight,     // Actual weight from sensor
  0.05              // Tolerance in kg
);
```

## Testing QR Codes

### Available Test Products

The system includes 21 pre-configured products:

**Fresh Produce (5 products)**
- Fresh Tomatoes - 11.25 SAR
- Organic Potatoes - 13.12 SAR
- Red Apples - 18.75 SAR
- Fresh Bananas - 9.50 SAR
- Fresh Carrots - 8.75 SAR

**Dairy & Bakery (3 products)**
- Fresh Milk - 15.99 SAR
- Fresh Bread - 7.50 SAR
- Cheese Selection - 32.99 SAR

**Beverages (1 product)**
- Orange Juice - 12.50 SAR

**Pantry Staples (3 products)**
- Pasta - 14.25 SAR
- White Rice - 28.99 SAR
- Olive Oil - 45.00 SAR

**Household (3 products)**
- Cleaning Supplies - 22.50 SAR
- Tissue Paper - 18.99 SAR
- Soap & Shampoo - 35.75 SAR

**Snacks (1 product)**
- Chips & Snacks - 16.50 SAR

**Meat & Poultry (1 product)**
- Fresh Chicken - 42.00 SAR

**Clothing (2 products)**
- Cotton T-Shirt - 75.00 SAR
- Casual Pants - 150.00 SAR

**Kitchen (2 products)**
- Cookware Set - 299.99 SAR
- Kitchen Utensils - 93.75 SAR

### Printing Test QR Codes

1. Go to `/qr-codes`
2. Click "Print All" button
3. A print-optimized view opens with all QR codes
4. Print on paper/stickers for testing

## Custom QR Code Creation

To add a new product QR code:

```typescript
// Add to src/data/products.ts
export const products: Product[] = [
  // ... existing products
  {
    id: "22",
    name: "New Product",
    category: "Category Name",
    price: 99.99,
    image: newProductImg, // Import the image
    barcode: "6010234567890", // Valid EAN-13
    weight: 1.0, // Optional
  },
];
```

The QR code will automatically be generated on the `/qr-codes` page.

## Security Considerations

- QR codes are client-side generated
- No server validation of QR data currently
- For production, consider:
  - Server-side product validation
  - Signed QR codes with HMAC
  - Product existence check against database
