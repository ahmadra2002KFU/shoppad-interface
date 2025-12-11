import { Link } from 'react-router-dom'
import { QRCodeScanner } from '@/components/qr/QRCodeScanner'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { ArrowLeft, LogIn } from 'lucide-react'

export default function QRScan() {
  const { isAuthenticated } = useAuth()

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Login Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to scan QR codes and authenticate screens.
          </p>
          <Link to="/login">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Scan QR Code</h1>
      </div>

      {/* Scanner */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
          <QRCodeScanner
            onSuccess={() => {
              // Show success message, then redirect
              setTimeout(() => {
                // Optionally redirect back to home
              }, 2000)
            }}
            onError={(error) => {
              console.error('QR scan error:', error)
            }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center text-gray-600 text-sm">
        <p>Scan the QR code on the shopping cart screen to login</p>
      </div>
    </div>
  )
}
