import { useState } from 'react'
import { useZxing } from 'react-zxing'
import { claimQRSession } from '@/services/qrSessionService'
import { useAuth } from '@/contexts/AuthContext'
import { Camera, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QRCodeScannerProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function QRCodeScanner({ onSuccess, onError }: QRCodeScannerProps) {
  const [status, setStatus] = useState<'scanning' | 'processing' | 'success' | 'error'>('scanning')
  const [errorMessage, setErrorMessage] = useState('')
  const { user } = useAuth()

  const { ref } = useZxing({
    onDecodeResult: async (result) => {
      if (status !== 'scanning') return

      const scannedData = result.getText()

      // Extract token from URL
      // Expected format: https://domain.com/qr-claim/{token}
      const tokenMatch = scannedData.match(/\/qr-claim\/([a-f0-9]+)$/i)

      if (!tokenMatch) {
        setStatus('error')
        setErrorMessage('Invalid QR code')
        onError?.('Invalid QR code')
        return
      }

      const token = tokenMatch[1]
      setStatus('processing')

      if (!user) {
        setStatus('error')
        setErrorMessage('You must be logged in to scan')
        onError?.('You must be logged in to scan')
        return
      }

      // Claim the session
      const success = await claimQRSession(token, user.id)

      if (success) {
        setStatus('success')
        onSuccess?.()
      } else {
        setStatus('error')
        setErrorMessage('Failed to authenticate. QR code may be expired.')
        onError?.('Failed to authenticate')
      }
    },
    onError: (error) => {
      console.error('QR scan error:', error)
    },
    constraints: {
      video: {
        facingMode: 'environment',
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    }
  })

  const resetScanner = () => {
    setStatus('scanning')
    setErrorMessage('')
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <p className="text-xl font-semibold text-green-700">Success!</p>
        <p className="text-gray-600 mt-2">The screen is now logged in as you</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>
        <p className="text-xl font-semibold text-red-700">Error</p>
        <p className="text-gray-600 mt-2">{errorMessage}</p>
        <Button onClick={resetScanner} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  if (status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-lg font-medium text-gray-700">Authenticating...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-sm aspect-square bg-black rounded-2xl overflow-hidden">
        <video ref={ref} className="w-full h-full object-cover" />

        {/* Scan overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 border-2 border-white rounded-lg opacity-50">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <div className="flex items-center justify-center gap-2 text-gray-700">
          <Camera className="w-5 h-5" />
          <span className="font-medium">Point camera at QR code</span>
        </div>
        <p className="text-gray-500 text-sm mt-2">
          Scan the QR code displayed on the shopping screen
        </p>
      </div>
    </div>
  )
}
