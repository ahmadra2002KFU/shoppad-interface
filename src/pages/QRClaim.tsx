import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { claimQRSession } from '@/services/qrSessionService'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, LogIn, ShoppingCart } from 'lucide-react'

export default function QRClaim() {
  const { token } = useParams<{ token: string }>()
  const { user, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'authenticating' | 'success' | 'error' | 'need_login'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated || !user) {
      setStatus('need_login')
      return
    }

    if (!token) {
      setStatus('error')
      setErrorMessage('Invalid QR code link')
      return
    }

    // Claim the session
    const claim = async () => {
      setStatus('authenticating')

      const success = await claimQRSession(token, user.id)

      if (success) {
        setStatus('success')
      } else {
        setStatus('error')
        setErrorMessage('Failed to authenticate. The QR code may have expired.')
      }
    }

    claim()
  }, [token, user, isAuthenticated, isLoading])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'need_login') {
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
            Please login first, then scan the QR code again.
          </p>
          <Link to={`/login?redirect=/qr-claim/${token}`}>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (status === 'authenticating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">Authenticating screen...</p>
          <p className="text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">
            Success!
          </h2>
          <p className="text-gray-600 mb-6">
            The shopping cart screen is now logged in as you. You can start shopping!
          </p>
          <Link to="/">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Go to Shop
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Error state
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-red-700 mb-2">
          Authentication Failed
        </h2>
        <p className="text-gray-600 mb-6">
          {errorMessage}
        </p>
        <div className="space-y-3">
          <Link to="/qr-scan">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Scan New QR Code
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="w-full">
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
