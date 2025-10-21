/**
 * QR Code Scanner Component
 * Provides camera-based QR code scanning functionality
 */

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/contexts/LanguageContext";
import { parseQRCodeData } from "@/utils/qrCodeParser";
import { QRCodeScanResult, QRScannerStatus } from "@/types/qrcode";

interface QRScannerProps {
  onScan: (result: QRCodeScanResult) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function QRScanner({ onScan, onClose, isOpen }: QRScannerProps) {
  const { t } = useLanguage();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [status, setStatus] = useState<QRScannerStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const qrCodeRegionId = "qr-reader";

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    startScanner();

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    try {
      setStatus('scanning');
      setError(null);

      // Initialize scanner
      const html5QrCode = new Html5Qrcode(qrCodeRegionId);
      scannerRef.current = html5QrCode;

      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      
      if (!devices || devices.length === 0) {
        throw new Error('No cameras found on this device');
      }

      // Prefer back camera on mobile devices
      const backCamera = devices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      );
      const cameraId = backCamera?.id || devices[0].id;

      // Start scanning
      await html5QrCode.start(
        cameraId,
        {
          fps: 10, // Frames per second
          qrbox: { width: 250, height: 250 }, // Scanning box size
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Ignore scanning errors (happens continuously when no QR code is visible)
          // Only log actual errors
          if (!errorMessage.includes('NotFoundException')) {
            console.debug('QR Scan error:', errorMessage);
          }
        }
      );

      setStatus('scanning');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start camera';
      setError(errorMsg);
      setStatus('error');
      console.error('Scanner error:', err);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setStatus('idle');
  };

  const handleScanSuccess = (decodedText: string) => {
    // Prevent duplicate scans
    if (decodedText === lastScan) {
      return;
    }

    setLastScan(decodedText);
    setStatus('success');

    // Parse QR code data
    const result = parseQRCodeData(decodedText);

    // Play success sound (optional)
    playSuccessSound();

    // Notify parent component
    onScan(result);

    // Auto-close after successful scan (optional)
    setTimeout(() => {
      if (result.success) {
        handleClose();
      } else {
        setStatus('error');
        setError(result.error || 'Invalid QR code');
        // Reset after showing error
        setTimeout(() => {
          setStatus('scanning');
          setError(null);
          setLastScan(null);
        }, 2000);
      }
    }, 500);
  };

  const playSuccessSound = () => {
    // Create a simple beep sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (err) {
      // Ignore audio errors
      console.debug('Could not play sound:', err);
    }
  };

  const handleClose = () => {
    stopScanner();
    setLastScan(null);
    setError(null);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {t('scanQRCode')}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Scanner Area */}
        <div className="p-4">
          <div 
            id={qrCodeRegionId} 
            className="rounded-lg overflow-hidden bg-black"
            style={{ minHeight: '300px' }}
          />

          {/* Status Messages */}
          <div className="mt-4 space-y-2">
            {status === 'scanning' && !error && (
              <Alert className="bg-blue-500/10 border-blue-500/20">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <AlertDescription className="text-blue-500">
                  {t('scanningQRCode')}
                </AlertDescription>
              </Alert>
            )}

            {status === 'success' && (
              <Alert className="bg-green-500/10 border-green-500/20">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <AlertDescription className="text-green-500">
                  {t('qrCodeScanned')}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="bg-destructive/10 border-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>{t('qrScanInstructions')}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            {t('cancel') || 'Cancel'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

