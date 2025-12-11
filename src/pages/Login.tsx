import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Mail, Lock, ShoppingCart, QrCode } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    // Basic validation
    if (!email.trim()) {
      setError('Email is required')
      setIsSubmitting(false)
      return
    }

    if (!password) {
      setError('Password is required')
      setIsSubmitting(false)
      return
    }

    const result = await login({ email: email.trim(), password })

    if (result.success) {
      navigate('/')
    } else {
      setError(result.error || 'Login failed')
    }

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ShopPad</h1>
          <p className="text-gray-600 mt-1">Smart Shopping Cart</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Welcome Back</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* QR Login Button */}
          <Link to="/qr-scan">
            <Button
              type="button"
              variant="outline"
              className="w-full py-3 border-2"
            >
              <QrCode className="w-5 h-5 mr-2" />
              Scan QR to Login
            </Button>
          </Link>

          {/* Register Link */}
          <p className="text-center mt-6 text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
