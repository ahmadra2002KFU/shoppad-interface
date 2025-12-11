import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { updateUserProfile } from '@/services/authService'
import { PaymentMethod } from '@/types/auth'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  User,
  Mail,
  CreditCard,
  Package,
  LogOut,
  Check,
  Save
} from 'lucide-react'

const PAYMENT_METHODS: { id: PaymentMethod; name: string; icon: string }[] = [
  { id: 'mada_pay', name: 'Mada Pay', icon: '💳' },
  { id: 'google_pay', name: 'Google Pay', icon: '🟢' },
  { id: 'apple_pay', name: 'Apple Pay', icon: '🍎' }
]

export default function Profile() {
  const { user, profile, logout, updatePayment, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(
    profile?.preferred_payment_method || 'mada_pay'
  )
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const handleSaveProfile = async () => {
    if (!user) return

    setIsSaving(true)
    setSaveMessage('')

    // Update profile name
    const nameResult = await updateUserProfile(user.id, { full_name: fullName })

    // Update payment method if changed
    if (selectedPayment !== profile?.preferred_payment_method) {
      await updatePayment(selectedPayment)
    }

    if (nameResult.success) {
      await refreshProfile()
      setSaveMessage('Profile updated successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } else {
      setSaveMessage('Failed to update profile')
    }

    setIsSaving(false)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Profile</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{profile.full_name}</h2>
              <p className="text-gray-500 flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {profile.email}
              </p>
            </div>
          </div>

          {/* Edit Name */}
          <div className="space-y-4">
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="inline w-4 h-4 mr-1" />
                Preferred Payment Method
              </label>
              <div className="grid grid-cols-3 gap-3">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedPayment(method.id)}
                    className={`
                      relative p-4 rounded-xl border-2 text-center transition-all
                      ${selectedPayment === method.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    {selectedPayment === method.id && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="text-2xl">{method.icon}</span>
                    <div className="text-sm mt-1 font-medium text-gray-700">
                      {method.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Save Message */}
            {saveMessage && (
              <div className={`p-3 rounded-lg text-sm ${
                saveMessage.includes('success')
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                {saveMessage}
              </div>
            )}

            {/* Save Button */}
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <Link
            to="/orders"
            className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Order History</span>
            </div>
            <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
          </Link>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-red-200 text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>

        {/* Account Info */}
        <div className="text-center text-sm text-gray-500">
          <p>Member since {new Date(profile.created_at).toLocaleDateString()}</p>
        </div>
      </main>
    </div>
  )
}
