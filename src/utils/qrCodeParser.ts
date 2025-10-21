/**
 * QR Code Parser Utility
 * Parses and validates QR code data for product information
 */

import { QRCodeProductData, QRCodeScanResult } from "@/types/qrcode";
import { Product } from "@/types/product";

/**
 * Parse QR code string data into product information
 * Supports JSON format: {"id": "123", "name": "Product", "price": 10.99, ...}
 */
export function parseQRCodeData(qrData: string): QRCodeScanResult {
  try {
    // Try to parse as JSON
    const parsed = JSON.parse(qrData);

    // Validate required fields
    if (!parsed.id || !parsed.name || typeof parsed.price !== 'number') {
      return {
        success: false,
        error: 'Invalid QR code format: missing required fields (id, name, price)',
        rawData: qrData,
      };
    }

    // Validate price is positive
    if (parsed.price <= 0) {
      return {
        success: false,
        error: 'Invalid price: must be greater than 0',
        rawData: qrData,
      };
    }

    const productData: QRCodeProductData = {
      id: String(parsed.id),
      name: String(parsed.name),
      price: Number(parsed.price),
      category: parsed.category ? String(parsed.category) : undefined,
      weight: parsed.weight ? Number(parsed.weight) : undefined,
      image: parsed.image ? String(parsed.image) : undefined,
      barcode: parsed.barcode ? String(parsed.barcode) : undefined,
    };

    return {
      success: true,
      data: productData,
      rawData: qrData,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse QR code: ${error instanceof Error ? error.message : 'Unknown error'}`,
      rawData: qrData,
    };
  }
}

/**
 * Convert QR code product data to Product type for cart
 */
export function qrDataToProduct(qrData: QRCodeProductData, defaultImage?: string): Product {
  return {
    id: qrData.id,
    name: qrData.name,
    price: qrData.price,
    category: qrData.category || 'Other',
    image: qrData.image || defaultImage || '/placeholder-product.jpg',
    barcode: qrData.barcode,
    weight: qrData.weight,
  };
}

/**
 * Generate QR code data string from product
 * Useful for creating QR codes for products
 */
export function productToQRData(product: Product): string {
  const qrData: QRCodeProductData = {
    id: product.id,
    name: product.name,
    price: product.price,
    category: product.category,
    weight: product.weight,
    barcode: product.barcode,
  };

  return JSON.stringify(qrData);
}

/**
 * Validate weight against expected weight (from QR code vs sensor)
 * Returns true if weights match within tolerance
 */
export function validateWeight(
  qrWeight: number | undefined,
  sensorWeight: number,
  toleranceKg: number = 0.05 // 50g tolerance
): { valid: boolean; difference?: number; message?: string } {
  if (!qrWeight) {
    return {
      valid: true,
      message: 'No weight specified in QR code',
    };
  }

  const difference = Math.abs(sensorWeight - qrWeight);

  if (difference <= toleranceKg) {
    return {
      valid: true,
      difference,
      message: 'Weight matches',
    };
  }

  return {
    valid: false,
    difference,
    message: `Weight mismatch: Expected ${qrWeight.toFixed(2)} kg, got ${sensorWeight.toFixed(2)} kg`,
  };
}

