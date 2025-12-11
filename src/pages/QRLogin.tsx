import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeDisplay } from '@/components/qr/QRCodeDisplay'
import { supabase } from '@/lib/supabase'
import { ShoppingCart } from 'lucide-react'

export default function QRLogin() {
  const { deviceId } = useParams<{ deviceId: string }>()
  const navigate = useNavigate()

  // Generate a device ID if not provided
  const actualDeviceId = deviceId || `screen-${Date.now()}`

  const handleAuthenticated = async (userId: string) => {
    // The user has authenticated via QR scan
    // We need to sign them in on this device
    // This is done by creating a session for the user

    // For now, we'll just redirect to home
    // In a real implementation, you'd want to create a session
    // using a secure token exchange mechanism

    // Wait a moment to show success state
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Redirect to home
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-4">
          <ShoppingCart className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">ShopPad</h1>
        <p className="text-gray-600 mt-1">Smart Shopping Cart</p>
      </div>

      {/* QR Code Display */}
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">
          Scan to Login
        </h2>

        <QRCodeDisplay
          deviceId={actualDeviceId}
          onAuthenticated={handleAuthenticated}
        />

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-center text-gray-500 text-sm">
            Open the ShopPad app on your phone and scan this code to login instantly
          </p>
        </div>
      </div>

      {/* Device Info */}
      <div className="mt-6 text-center text-gray-500 text-sm">
        <p>Device: {actualDeviceId}</p>
      </div>
    </div>
  )
}
