/**
 * QR Code Data Types
 * Defines the structure of product data encoded in QR codes
 */

export interface QRCodeProductData {
  id: string;
  name: string;
  price: number;
  category?: string;
  weight?: number;
  image?: string;
  barcode?: string;
}

export interface QRCodeScanResult {
  success: boolean;
  data?: QRCodeProductData;
  error?: string;
  rawData?: string;
}

export type QRScannerStatus = 'idle' | 'scanning' | 'success' | 'error';

