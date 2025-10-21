/**
 * BarcodeScanner Component
 * Camera-based barcode scanner using ZXing library
 */

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarcodeScanResult, BarcodeScannerStatus } from '@/types/barcode';
import { cn } from '@/lib/utils';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: BarcodeScanResult) => void;
  audioFeedback?: boolean;
  preventDuplicates?: boolean;
  scanCooldown?: number;
}

export function BarcodeScanner({
  isOpen,
  onClose,
  onScan,
  audioFeedback = true,
  preventDuplicates = true,
  scanCooldown = 2000,
}: BarcodeScannerProps) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const [status, setStatus] = useState<BarcodeScannerStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  // Play beep sound on successful scan
  const playBeep = () => {
    if (!audioFeedback) return;
    
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
  };

  // Start barcode scanner
  const startScanner = async () => {
    try {
      setStatus('scanning');
      setError(null);

      // Create code reader
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      // Get available video devices
      const videoInputDevices = await codeReader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error('No camera found');
      }

      // Prefer back camera on mobile devices
      const backCamera = videoInputDevices.find(device =>
        device.label.toLowerCase().includes('back') ||
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      );

      const selectedDeviceId = backCamera?.deviceId || videoInputDevices[0].deviceId;

      // Start decoding from video device
      await codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        (result, error) => {
          if (result) {
            const barcodeText = result.getText();
            const now = Date.now();

            // Check for duplicate scans
            if (preventDuplicates && barcodeText === lastScannedBarcode) {
              if (now - lastScanTime < scanCooldown) {
                return; // Ignore duplicate scan within cooldown period
              }
            }

            // Update last scan info
            setLastScannedBarcode(barcodeText);
            setLastScanTime(now);

            // Play success sound
            playBeep();

            // Set success status
            setStatus('success');

            // Call onScan callback
            onScan({
              success: true,
              barcode: barcodeText,
              format: result.getBarcodeFormat() as any,
              rawData: barcodeText,
            });

            // Auto-close after short delay
            setTimeout(() => {
              stopScanner();
              onClose();
            }, 500);
          }

          if (error && !(error instanceof NotFoundException)) {
            console.error('Barcode scan error:', error);
          }
        }
      );

      // Store the stream reference
      if (videoRef.current && videoRef.current.srcObject) {
        streamRef.current = videoRef.current.srcObject as MediaStream;
      }
    } catch (err) {
      console.error('Failed to start barcode scanner:', err);
      setError(err instanceof Error ? err.message : 'Failed to start camera');
      setStatus('error');
    }
  };

  // Stop barcode scanner
  const stopScanner = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }

    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setStatus('idle');
    setError(null);
  };

  // Start scanner when dialog opens
  useEffect(() => {
    if (isOpen) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  // Handle close
  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t('scanBarcode')}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera Preview */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />

            {/* Scanning Overlay */}
            {status === 'scanning' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-48 border-2 border-primary rounded-lg relative">
                  {/* Scanning line animation */}
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-primary animate-scan" />
                  
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary" />
                </div>
              </div>
            )}

            {/* Success Overlay */}
            {status === 'success' && (
              <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                <div className="bg-green-500 text-white p-4 rounded-full">
                  <CheckCircle className="h-12 w-12" />
                </div>
              </div>
            )}

            {/* Error Overlay */}
            {status === 'error' && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                <div className="bg-red-500 text-white p-4 rounded-full">
                  <AlertCircle className="h-12 w-12" />
                </div>
              </div>
            )}
          </div>

          {/* Status Message */}
          <div className="text-center">
            {status === 'scanning' && (
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('scanningBarcode')}
              </p>
            )}
            {status === 'success' && (
              <p className="text-sm text-green-600 font-medium">
                {t('barcodeScanned')}
              </p>
            )}
            {status === 'error' && error && (
              <p className="text-sm text-red-600 font-medium">
                {error}
              </p>
            )}
            {status === 'idle' && (
              <p className="text-sm text-muted-foreground">
                {t('barcodeScanInstructions')}
              </p>
            )}
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>{t('barcodeScanInstructions')}</p>
            <p className="text-xs opacity-75">
              Supported: EAN-13, UPC-A, Code-128, and more
            </p>
          </div>

          {/* Cancel Button */}
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full"
          >
            {t('cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

{/* Add scanning animation to global CSS */}
<style jsx global>{`
  @keyframes scan {
    0% {
      top: 0;
    }
    50% {
      top: 100%;
    }
    100% {
      top: 0;
    }
  }
  
  .animate-scan {
    animation: scan 2s ease-in-out infinite;
  }
`}</style>

