/**
 * useBarcodeScanner Hook
 * Manages barcode scanner state and integrates with cart
 */

import { useState, useCallback } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { BarcodeScanResult } from '@/types/barcode';
import { findProductByBarcode, processBarcodeScann } from '@/utils/barcodeParser';

interface UseBarcodeScannerOptions {
  /**
   * Whether to automatically add scanned products to cart
   * Default: true
   */
  autoAddToCart?: boolean;

  /**
   * Whether to validate weight against ESP32 sensor
   * Default: false
   */
  validateWeightOnScan?: boolean;

  /**
   * Weight tolerance in kg for validation
   * Default: 0.05 (50 grams)
   */
  weightTolerance?: number;

  /**
   * Default product image if not specified
   */
  defaultProductImage?: string;

  /**
   * Current weight from ESP32 sensor (for validation)
   */
  sensorWeight?: number | null;
}

export function useBarcodeScanner(options: UseBarcodeScannerOptions = {}) {
  const {
    autoAddToCart = true,
    validateWeightOnScan = false,
    weightTolerance = 0.05,
    defaultProductImage = '/placeholder-product.jpg',
    sensorWeight = null,
  } = options;

  const { addToCart } = useCart();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<BarcodeScanResult | null>(null);

  /**
   * Open the barcode scanner
   */
  const openScanner = useCallback(() => {
    setIsOpen(true);
    setLastScanResult(null);
  }, []);

  /**
   * Close the barcode scanner
   */
  const closeScanner = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Handle barcode scan result
   */
  const handleScan = useCallback(
    (result: BarcodeScanResult) => {
      setLastScanResult(result);

      if (!result.success) {
        toast.error(t('invalidBarcode'), {
          description: result.error || 'Unknown error',
        });
        return;
      }

      // Process the barcode
      const processResult = processBarcodeScann(result.barcode!);

      if (!processResult.success) {
        toast.error(t('invalidBarcode'), {
          description: processResult.error,
        });
        return;
      }

      // Find product
      const product = findProductByBarcode(result.barcode!);

      if (!product) {
        toast.error(t('productNotFound'), {
          description: `Barcode: ${result.barcode}`,
        });
        return;
      }

      // Weight validation if enabled
      if (validateWeightOnScan && product.weight && sensorWeight !== null) {
        const weightDiff = Math.abs(product.weight - sensorWeight);

        if (weightDiff > weightTolerance) {
          toast.error(t('weightMismatch'), {
            description: `Expected: ${product.weight.toFixed(2)} kg, Sensor: ${sensorWeight.toFixed(2)} kg`,
          });
          return;
        }
      }

      // Add to cart
      if (autoAddToCart) {
        addToCart(product);
        toast.success(t('productAdded'), {
          description: `${product.name} - ${product.price.toFixed(2)} SAR`,
        });
      }

      // Close scanner
      closeScanner();
    },
    [
      autoAddToCart,
      validateWeightOnScan,
      sensorWeight,
      weightTolerance,
      addToCart,
      closeScanner,
      t,
    ]
  );

  return {
    isOpen,
    openScanner,
    closeScanner,
    handleScan,
    lastScanResult,
  };
}

