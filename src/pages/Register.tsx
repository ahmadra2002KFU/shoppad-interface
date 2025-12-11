import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { PaymentMethod } from '@/types/auth'
import { Mail, Lock, User, CreditCard, ShoppingCart, Check } from 'lucide-react'

const PAYMENT_METHODS: { id: PaymentMethod; name: string; icon: string }[] = [
  { id: 'mada_pay', name: 'Mada Pay', icon: '💳' },
  { id: 'google_pay', name: 'Google Pay', icon: '🟢' },
  { id: 'apple_pay', name: 'Apple Pay', icon: '🍎' }
]

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mada_pay')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    // Validation
    if (!fullName.trim()) {
      setError('Full name is required')
      setIsSubmitting(false)
      return
    }

    if (!email.trim()) {
      setError('Email is required')
      setIsSubmitting(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsSubmitting(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsSubmitting(false)
      return
    }

    const result = await register({
      full_name: fullName.trim(),
      email: email.trim(),
      password,
      preferred_payment_method: paymentMethod
    })

    if (result.success) {
      setSuccess('Registration successful! Please check your email to confirm your account.')
      // Wait a moment then redirect to login
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } else {
      setError(result.error || 'Registration failed')
    }

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ShopPad</h1>
          <p className="text-gray-600 mt-1">Create your account</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  disabled={isSubmitting}
                />
              </div>
            </div>

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
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="inline w-4 h-4 mr-1" />
                Preferred Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`
                      relative p-3 rounded-lg border-2 text-center transition-all
                      ${paymentMethod === method.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                    disabled={isSubmitting}
                  >
                    {paymentMethod === method.id && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className="text-xl">{method.icon}</span>
                    <div className="text-xs mt-1 font-medium text-gray-700">
                      {method.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-6 text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
