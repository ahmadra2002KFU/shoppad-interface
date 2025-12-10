# Product Management

**Document:** How Products Are Stored and Managed
**Last Updated:** December 10, 2025

---

## Table of Contents

1. [Product Data Overview](#product-data-overview)
2. [Product Type Definition](#product-type-definition)
3. [Product Catalog](#product-catalog)
4. [Product Lookup Methods](#product-lookup-methods)
5. [Important Notes](#important-notes)

---

## Product Data Overview

### Storage Method

**Products are stored as static data** in a TypeScript file. There is **no database** (SQLite or otherwise) implemented in the current codebase.

**Location:** `src/data/products.ts`

### Why Static Data?

The current implementation uses hardcoded product data for:
- Rapid prototyping
- Demo/POC purposes
- No backend database dependency
- Simple deployment (all data bundled with frontend)

---

## Product Type Definition

### Location
`src/types/product.ts`

### Interface
```typescript
export interface Product {
  id: string;           // Unique identifier
  name: string;         // Product display name
  category: string;     // Category for filtering
  price: number;        // Price in SAR (Saudi Riyal)
  image: string;        // Image path (imported asset)
  barcode?: string;     // EAN-13 barcode (optional)
  weight?: number;      // Weight in kg (optional)
}

export interface CartItem extends Product {
  quantity: number;     // Quantity in cart
}
```

### Field Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique product identifier (1-21) |
| `name` | string | Yes | Display name (English) |
| `category` | string | Yes | Product category |
| `price` | number | Yes | Price in SAR |
| `image` | string | Yes | Imported image asset |
| `barcode` | string | No | 13-digit EAN-13 code |
| `weight` | number | No | Weight in kilograms |

---

## Product Catalog

### Location
`src/data/products.ts`

### Categories

```typescript
export const categories = Array.from(new Set(products.map((p) => p.category)));
// Result: [
//   "Fresh Produce",
//   "Dairy & Bakery",
//   "Beverages",
//   "Pantry Staples",
//   "Household",
//   "Snacks",
//   "Meat & Poultry",
//   "Clothing",
//   "Kitchen"
// ]
```

### Complete Product List

| ID | Name | Category | Price (SAR) | Barcode | Weight (kg) |
|----|------|----------|-------------|---------|-------------|
| 1 | Fresh Tomatoes | Fresh Produce | 11.25 | 6001234567890 | 0.5 |
| 2 | Organic Potatoes | Fresh Produce | 13.12 | 6001234567906 | 1.0 |
| 3 | Red Apples | Fresh Produce | 18.75 | 6001234567913 | 0.8 |
| 4 | Fresh Bananas | Fresh Produce | 9.50 | 6001234567920 | 0.6 |
| 5 | Fresh Carrots | Fresh Produce | 8.75 | 6001234567937 | 0.7 |
| 6 | Fresh Milk | Dairy & Bakery | 15.99 | 6002234567891 | 1.0 |
| 7 | Fresh Bread | Dairy & Bakery | 7.50 | 6002234567907 | - |
| 8 | Cheese Selection | Dairy & Bakery | 32.99 | 6002234567914 | 0.3 |
| 9 | Orange Juice | Beverages | 12.50 | 6003234567892 | 1.0 |
| 10 | Pasta | Pantry Staples | 14.25 | 6004234567893 | - |
| 11 | White Rice | Pantry Staples | 28.99 | 6004234567909 | 2.0 |
| 12 | Olive Oil | Pantry Staples | 45.00 | 6004234567916 | 1.0 |
| 13 | Cleaning Supplies | Household | 22.50 | 6005234567894 | - |
| 14 | Tissue Paper | Household | 18.99 | 6005234567900 | - |
| 15 | Soap & Shampoo | Household | 35.75 | 6005234567917 | - |
| 16 | Chips & Snacks | Snacks | 16.50 | 6006234567895 | - |
| 17 | Fresh Chicken | Meat & Poultry | 42.00 | 6007234567896 | 1.5 |
| 18 | Cotton T-Shirt | Clothing | 75.00 | 6008234567897 | - |
| 19 | Casual Pants | Clothing | 150.00 | 6008234567903 | - |
| 20 | Cookware Set | Kitchen | 299.99 | 6009234567898 | - |
| 21 | Kitchen Utensils | Kitchen | 93.75 | 6009234567904 | - |

### Barcode Pattern

All barcodes follow EAN-13 format with valid checksums:
- `600XXXXXXXXXX` - Fresh Produce (6001...)
- `6002...` - Dairy & Bakery
- `6003...` - Beverages
- `6004...` - Pantry Staples
- `6005...` - Household
- `6006...` - Snacks
- `6007...` - Meat & Poultry
- `6008...` - Clothing
- `6009...` - Kitchen

### Product Images

Images are imported from `src/assets/`:

```typescript
import tomatoImg from "@/assets/tomato.jpg";
import potatoImg from "@/assets/potato.jpg";
// ... etc
```

Available image files:
- apple.jpg, banana.jpg, carrot.jpg, tomato.jpg, potato.jpg
- milk.jpg, bread.jpg, cheese.jpg
- juice.jpg
- pasta.jpg, rice.jpg, oil.jpg
- cleaning.jpg, tissue.jpg, soap.jpg
- snacks.jpg
- chicken.jpg
- clothing.jpg
- kitchen.jpg
- hero-shopping.jpg (unused)
- store-map.jpg (for StoreMap component)

---

## Product Lookup Methods

### By ID (Direct Array Access)
```typescript
import { products } from "@/data/products";

const product = products.find(p => p.id === "5");
```

### By Barcode
```typescript
// src/utils/barcodeParser.ts
import { products } from '@/data/products';

export function findProductByBarcode(barcode: string): Product | null {
  const cleanBarcode = barcode.trim();
  const product = products.find(p => p.barcode === cleanBarcode);
  return product || null;
}
```

### By Category
```typescript
const filteredProducts = selectedCategory
  ? products.filter((p) => p.category === selectedCategory)
  : products;
```

---

## Important Notes

### No Database

1. **SQLite is NOT implemented** despite being mentioned in project context. All product data is static.

2. **Data persistence**: Cart data exists only in React state (memory). Refreshing the page clears the cart.

3. **No product CRUD**: Products cannot be added, edited, or deleted through the UI.

### For Future Database Integration

To add a proper database:

1. **Backend options:**
   - Add SQLite to the Express server
   - Use Supabase/Firebase for cloud database
   - Add PostgreSQL via Prisma

2. **Schema suggestion:**
```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  image_url TEXT,
  barcode TEXT UNIQUE,
  weight REAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

3. **API endpoints to add:**
   - `GET /products` - List all products
   - `GET /products/:id` - Get single product
   - `GET /products/barcode/:barcode` - Lookup by barcode
   - `POST /products` - Create product (admin)
   - `PUT /products/:id` - Update product (admin)
   - `DELETE /products/:id` - Delete product (admin)

### Currency

All prices are in **SAR (Saudi Riyal)** as indicated by the `SAR` suffix in the UI components.

### Weight Units

Weights are stored and displayed in **kilograms (kg)**.
