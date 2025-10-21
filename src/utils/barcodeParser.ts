/**
 * Barcode Parser Utility
 * Handles barcode validation, parsing, and product lookup
 */

import { Product } from '@/types/product';
import { BarcodeScanResult, BarcodeValidationResult, BarcodeFormat } from '@/types/barcode';
import { products } from '@/data/products';

/**
 * Validate a barcode string
 * Checks format and checksum for EAN-13 and UPC-A
 */
export function validateBarcode(barcode: string): BarcodeValidationResult {
  if (!barcode || typeof barcode !== 'string') {
    return {
      valid: false,
      message: 'Barcode must be a non-empty string',
    };
  }

  // Remove any whitespace
  const cleanBarcode = barcode.trim();

  // Check length and determine format
  if (cleanBarcode.length === 13) {
    // EAN-13
    if (!/^\d{13}$/.test(cleanBarcode)) {
      return {
        valid: false,
        message: 'EAN-13 barcode must contain exactly 13 digits',
      };
    }

    // Validate EAN-13 checksum
    if (!validateEAN13Checksum(cleanBarcode)) {
      return {
        valid: false,
        message: 'Invalid EAN-13 checksum',
      };
    }

    return {
      valid: true,
      format: 'EAN_13',
    };
  } else if (cleanBarcode.length === 12) {
    // UPC-A
    if (!/^\d{12}$/.test(cleanBarcode)) {
      return {
        valid: false,
        message: 'UPC-A barcode must contain exactly 12 digits',
      };
    }

    // Validate UPC-A checksum
    if (!validateUPCAChecksum(cleanBarcode)) {
      return {
        valid: false,
        message: 'Invalid UPC-A checksum',
      };
    }

    return {
      valid: true,
      format: 'UPC_A',
    };
  } else if (cleanBarcode.length === 8) {
    // EAN-8
    if (!/^\d{8}$/.test(cleanBarcode)) {
      return {
        valid: false,
        message: 'EAN-8 barcode must contain exactly 8 digits',
      };
    }

    return {
      valid: true,
      format: 'EAN_8',
    };
  } else if (cleanBarcode.length >= 6 && cleanBarcode.length <= 20) {
    // Other formats (Code 128, Code 39, etc.)
    return {
      valid: true,
      format: 'CODE_128',
    };
  }

  return {
    valid: false,
    message: `Invalid barcode length: ${cleanBarcode.length}`,
  };
}

/**
 * Validate EAN-13 checksum
 */
function validateEAN13Checksum(barcode: string): boolean {
  if (barcode.length !== 13) return false;

  const digits = barcode.split('').map(Number);
  const checkDigit = digits[12];

  // Calculate checksum
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }

  const calculatedCheckDigit = (10 - (sum % 10)) % 10;

  return checkDigit === calculatedCheckDigit;
}

/**
 * Validate UPC-A checksum
 */
function validateUPCAChecksum(barcode: string): boolean {
  if (barcode.length !== 12) return false;

  const digits = barcode.split('').map(Number);
  const checkDigit = digits[11];

  // Calculate checksum
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    sum += digits[i] * (i % 2 === 0 ? 3 : 1);
  }

  const calculatedCheckDigit = (10 - (sum % 10)) % 10;

  return checkDigit === calculatedCheckDigit;
}

/**
 * Find product by barcode
 */
export function findProductByBarcode(barcode: string): Product | null {
  const cleanBarcode = barcode.trim();
  const product = products.find(p => p.barcode === cleanBarcode);
  return product || null;
}

/**
 * Process a scanned barcode and return result
 */
export function processBarcodeScann(barcodeText: string): BarcodeScanResult {
  // Validate barcode format
  const validation = validateBarcode(barcodeText);
  
  if (!validation.valid) {
    return {
      success: false,
      error: validation.message || 'Invalid barcode format',
      rawData: barcodeText,
    };
  }

  // Find product
  const product = findProductByBarcode(barcodeText);
  
  if (!product) {
    return {
      success: false,
      error: 'Product not found for this barcode',
      barcode: barcodeText,
      format: validation.format,
      rawData: barcodeText,
    };
  }

  return {
    success: true,
    barcode: barcodeText,
    format: validation.format,
    rawData: barcodeText,
  };
}

/**
 * Generate EAN-13 barcode with valid checksum
 */
export function generateEAN13(prefix: string): string {
  // Ensure prefix is 12 digits (pad with zeros if needed)
  let barcode = prefix.padStart(12, '0').substring(0, 12);
  
  // Calculate check digit
  const digits = barcode.split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return barcode + checkDigit;
}

/**
 * Generate UPC-A barcode with valid checksum
 */
export function generateUPCA(prefix: string): string {
  // Ensure prefix is 11 digits (pad with zeros if needed)
  let barcode = prefix.padStart(11, '0').substring(0, 11);
  
  // Calculate check digit
  const digits = barcode.split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    sum += digits[i] * (i % 2 === 0 ? 3 : 1);
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return barcode + checkDigit;
}

/**
 * Format barcode for display
 */
export function formatBarcodeForDisplay(barcode: string, format?: BarcodeFormat): string {
  if (!barcode) return '';
  
  switch (format) {
    case 'EAN_13':
      // Format as: 123 4567 890123
      if (barcode.length === 13) {
        return `${barcode.substring(0, 3)} ${barcode.substring(3, 7)} ${barcode.substring(7, 13)}`;
      }
      break;
    case 'UPC_A':
      // Format as: 1 23456 78901 2
      if (barcode.length === 12) {
        return `${barcode[0]} ${barcode.substring(1, 6)} ${barcode.substring(6, 11)} ${barcode[11]}`;
      }
      break;
    case 'EAN_8':
      // Format as: 1234 5678
      if (barcode.length === 8) {
        return `${barcode.substring(0, 4)} ${barcode.substring(4, 8)}`;
      }
      break;
  }
  
  return barcode;
}

/**
 * Get barcode format name for display
 */
export function getBarcodeFormatName(format?: BarcodeFormat): string {
  switch (format) {
    case 'EAN_13': return 'EAN-13';
    case 'EAN_8': return 'EAN-8';
    case 'UPC_A': return 'UPC-A';
    case 'UPC_E': return 'UPC-E';
    case 'CODE_128': return 'Code 128';
    case 'CODE_39': return 'Code 39';
    case 'ITF': return 'ITF';
    case 'CODABAR': return 'Codabar';
    case 'QR_CODE': return 'QR Code';
    default: return 'Unknown';
  }
}

