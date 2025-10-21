/**
 * Barcode Data Types
 * Defines the structure of barcode scanning data and results
 */

/**
 * Supported barcode formats
 */
export type BarcodeFormat = 
  | 'EAN_13'      // European Article Number (13 digits)
  | 'EAN_8'       // European Article Number (8 digits)
  | 'UPC_A'       // Universal Product Code (12 digits)
  | 'UPC_E'       // Universal Product Code (6 digits)
  | 'CODE_128'    // Code 128
  | 'CODE_39'     // Code 39
  | 'ITF'         // Interleaved 2 of 5
  | 'CODABAR'     // Codabar
  | 'QR_CODE';    // QR Code (for compatibility)

/**
 * Result of a barcode scan operation
 */
export interface BarcodeScanResult {
  success: boolean;
  barcode?: string;
  format?: BarcodeFormat;
  error?: string;
  rawData?: string;
}

/**
 * Scanner status states
 */
export type BarcodeScannerStatus = 'idle' | 'scanning' | 'success' | 'error';

/**
 * Barcode validation result
 */
export interface BarcodeValidationResult {
  valid: boolean;
  message?: string;
  format?: BarcodeFormat;
}

/**
 * Barcode scanner configuration options
 */
export interface BarcodeScannerOptions {
  /**
   * Preferred barcode formats to scan
   * If not specified, all formats will be attempted
   */
  formats?: BarcodeFormat[];
  
  /**
   * Frames per second for scanning
   * Default: 10
   */
  fps?: number;
  
  /**
   * Width of the scanning box
   * Default: 250
   */
  qrbox?: number;
  
  /**
   * Whether to play audio feedback on successful scan
   * Default: true
   */
  audioFeedback?: boolean;
  
  /**
   * Whether to prevent duplicate scans
   * Default: true
   */
  preventDuplicates?: boolean;
  
  /**
   * Cooldown period between scans (in milliseconds)
   * Default: 2000
   */
  scanCooldown?: number;
}

