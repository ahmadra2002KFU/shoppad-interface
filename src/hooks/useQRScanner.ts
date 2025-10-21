/**
 * QR Scanner Hook
 * Manages QR scanner state and integration with cart
 */

import { useState, useCallback } from "react";
import { useCart } from "@/contexts/CartContext";
import { useESP32Weight } from "@/hooks/useESP32Weight";
import { QRCodeScanResult } from "@/types/qrcode";
import { qrDataToProduct, validateWeight } from "@/utils/qrCodeParser";
import { toast } from "sonner";

interface UseQRScannerOptions {
  validateWeightOnScan?: boolean;
  weightTolerance?: number; // in kg
  autoAddToCart?: boolean;
  defaultProductImage?: string;
}

export function useQRScanner(options: UseQRScannerOptions = {}) {
  const {
    validateWeightOnScan = false,
    weightTolerance = 0.05, // 50g tolerance
    autoAddToCart = true,
    defaultProductImage = '/placeholder-product.jpg',
  } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<QRCodeScanResult | null>(null);
  const { addToCart } = useCart();
  const { weight: sensorWeight } = useESP32Weight({ enabled: validateWeightOnScan });

  const openScanner = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeScanner = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleScan = useCallback(
    (result: QRCodeScanResult) => {
      setLastScanResult(result);

      if (!result.success) {
        toast.error('Invalid QR Code', {
          description: result.error || 'Could not parse QR code data',
        });
        return;
      }

      if (!result.data) {
        toast.error('Invalid QR Code', {
          description: 'No product data found',
        });
        return;
      }

      // Validate weight if enabled and weight is specified in QR code
      if (validateWeightOnScan && result.data.weight && sensorWeight !== null) {
        const weightValidation = validateWeight(
          result.data.weight,
          sensorWeight,
          weightTolerance
        );

        if (!weightValidation.valid) {
          toast.error('Weight Mismatch', {
            description: weightValidation.message,
          });
          return;
        }
      }

      // Convert QR data to Product and add to cart
      const product = qrDataToProduct(result.data, defaultProductImage);

      if (autoAddToCart) {
        addToCart(product);
        toast.success('Product Added!', {
          description: `${product.name} - ${product.price.toFixed(2)} SAR`,
        });
      }

      // Close scanner after successful scan
      closeScanner();
    },
    [
      validateWeightOnScan,
      sensorWeight,
      weightTolerance,
      autoAddToCart,
      defaultProductImage,
      addToCart,
      closeScanner,
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

