import { useState, useEffect, useCallback } from 'react'
import { useZxing } from 'react-zxing'
import { Button } from '@/components/ui/button'
import { X, Camera, CameraOff, Volume2, VolumeX } from 'lucide-react'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
  isOpen: boolean
}

export function BarcodeScanner({ onScan, onClose, isOpen }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null)
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [scanning, setScanning] = useState(false)

  // Beep sound for successful scan
  const playBeep = useCallback(() => {
    if (!soundEnabled) return

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 1000
      oscillator.type = 'sine'
      gainNode.gain.value = 0.3

      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (e) {
      console.warn('Could not play beep sound:', e)
    }
  }, [soundEnabled])

  const { ref } = useZxing({
    onDecodeResult(result) {
      const barcode = result.getText()

      // Debounce: Don't scan same barcode within 2 seconds
      if (barcode === lastScanned) return

      setLastScanned(barcode)
      playBeep()
      onScan(barcode)

      // Reset last scanned after 2 seconds
      setTimeout(() => setLastScanned(null), 2000)
    },
    onError(err) {
      // Only show error if it's not a "no barcode found" type error
      if (!err.message?.includes('No MultiFormat Readers')) {
        console.error('Scanner error:', err)
        setError('Camera error. Please try again.')
      }
    },
    paused: !isOpen || !scanning,
    constraints: {
      video: {
        facingMode: 'environment', // Rear camera
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 15 }, // Lower for cheap devices
      },
    },
    timeBetweenDecodingAttempts: 200, // Reduce CPU usage
  })

  // Start scanning when opened
  useEffect(() => {
    if (isOpen) {
      setScanning(true)
      setError(null)
      setLastScanned(null)
    } else {
      setScanning(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl overflow-hidden max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Scan Barcode</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-400" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Camera View */}
        <div className="relative aspect-[4/3] bg-black">
          {scanning ? (
            <>
              <video
                ref={ref}
                className="w-full h-full object-cover"
                playsInline
                muted
              />

              {/* Scan overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Corner markers */}
                <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-white/50 rounded-lg">
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-green-500 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-green-500 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-green-500 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-green-500 rounded-br-lg" />
                </div>

                {/* Scanning line animation */}
                <div className="absolute top-1/4 left-1/4 w-1/2 overflow-hidden h-1/2">
                  <div className="w-full h-0.5 bg-green-500 animate-scan" />
                </div>
              </div>

              {/* Last scanned indicator */}
              {lastScanned && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full font-mono text-sm">
                  Scanned: {lastScanned}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <CameraOff className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 space-y-3">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant={scanning ? 'destructive' : 'default'}
              className="flex-1"
              onClick={() => setScanning(!scanning)}
            >
              {scanning ? (
                <>
                  <CameraOff className="w-4 h-4 mr-2" />
                  Stop Camera
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Start Camera
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Point the camera at a barcode. Supports EAN-13, EAN-8, UPC-A, Code 128.
          </p>
        </div>
      </div>

      {/* Scanning animation styles */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(calc(100% - 2px)); }
          100% { transform: translateY(0); }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

// Manual barcode input for testing
interface ManualBarcodeInputProps {
  onSubmit: (barcode: string) => void
}

export function ManualBarcodeInput({ onSubmit }: ManualBarcodeInputProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onSubmit(value.trim())
      setValue('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter barcode manually..."
        className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono"
      />
      <Button type="submit" size="sm" disabled={!value.trim()}>
        Add
      </Button>
    </form>
  )
}

export default BarcodeScanner
