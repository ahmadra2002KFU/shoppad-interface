import { useEffect, useState, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { createQRSession, subscribeToQRSession, generateQRCodeData } from '@/services/qrSessionService'
import { QRSession } from '@/types/auth'
import { RefreshCw, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QRCodeDisplayProps {
  deviceId: string
  onAuthenticated: (userId: string) => void
}

export function QRCodeDisplay({ deviceId, onAuthenticated }: QRCodeDisplayProps) {
  const [token, setToken] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'authenticated' | 'expired'>('loading')
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(0)

  const createSession = useCallback(async () => {
    setStatus('loading')
    const result = await createQRSession(deviceId)

    if (result) {
      setToken(result.token)
      setSessionId(result.sessionId)
      setStatus('ready')
      setExpiresAt(new Date(Date.now() + 5 * 60 * 1000)) // 5 minutes from now
    } else {
      setStatus('expired')
    }
  }, [deviceId])

  // Create initial session
  useEffect(() => {
    createSession()
  }, [createSession])

  // Subscribe to session updates
  useEffect(() => {
    if (!sessionId) return

    const unsubscribe = subscribeToQRSession(sessionId, (session: QRSession) => {
      if (session.status === 'authenticated' && session.user_id) {
        setStatus('authenticated')
        onAuthenticated(session.user_id)
      } else if (session.status === 'expired') {
        setStatus('expired')
      }
    })

    return unsubscribe
  }, [sessionId, onAuthenticated])

  // Countdown timer
  useEffect(() => {
    if (!expiresAt || status !== 'ready') return

    const interval = setInterval(() => {
      const now = new Date()
      const diff = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))
      setTimeLeft(diff)

      if (diff === 0) {
        setStatus('expired')
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, status])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Generating QR code...</p>
      </div>
    )
  }

  if (status === 'authenticated') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <p className="text-xl font-semibold text-green-700">Authenticated!</p>
        <p className="text-gray-600 mt-2">Logging you in...</p>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-12 h-12 text-gray-400" />
        </div>
        <p className="text-xl font-semibold text-gray-700 mb-2">QR Code Expired</p>
        <Button onClick={createSession} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Generate New Code
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <QRCodeSVG
          value={token ? generateQRCodeData(token) : ''}
          size={256}
          level="H"
          includeMargin={true}
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </div>

      <div className="mt-6 text-center">
        <p className="text-lg font-medium text-gray-700">
          Scan with your phone to login
        </p>
        <div className="flex items-center justify-center gap-2 mt-2 text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Expires in {formatTime(timeLeft)}</span>
        </div>
      </div>

      <Button
        variant="ghost"
        onClick={createSession}
        className="mt-4 text-gray-500"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh Code
      </Button>
    </div>
  )
}
