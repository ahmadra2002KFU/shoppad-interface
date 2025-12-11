import { supabase } from '@/lib/supabase'
import { QRSession } from '@/types/auth'

// Create a new QR session for a device (in-store screen)
export async function createQRSession(deviceId: string): Promise<{ token: string; sessionId: string } | null> {
  try {
    const { data, error } = await supabase
      .rpc('create_qr_session', { p_device_id: deviceId })

    if (error) {
      console.error('Error creating QR session:', error)
      return null
    }

    if (data && data.length > 0) {
      return {
        sessionId: data[0].session_id,
        token: data[0].session_token
      }
    }

    return null
  } catch (err) {
    console.error('QR session creation exception:', err)
    return null
  }
}

// Claim a QR session (called from mobile app after scanning)
export async function claimQRSession(token: string, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('claim_qr_session', { p_token: token, p_user_id: userId })

    if (error) {
      console.error('Error claiming QR session:', error)
      return false
    }

    return data === true
  } catch (err) {
    console.error('QR session claim exception:', err)
    return false
  }
}

// Get session by token (to check status)
export async function getQRSessionByToken(token: string): Promise<QRSession | null> {
  try {
    const { data, error } = await supabase
      .from('qr_sessions')
      .select('*')
      .eq('token', token)
      .single()

    if (error) {
      console.error('Error fetching QR session:', error)
      return null
    }

    return data as QRSession
  } catch (err) {
    console.error('QR session fetch exception:', err)
    return null
  }
}

// Subscribe to QR session changes (for realtime updates on in-store screen)
export function subscribeToQRSession(
  sessionId: string,
  onUpdate: (session: QRSession) => void
) {
  const channel = supabase
    .channel(`qr_session_${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'qr_sessions',
        filter: `id=eq.${sessionId}`
      },
      (payload) => {
        onUpdate(payload.new as QRSession)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Generate QR code data (URL that mobile app will scan)
export function generateQRCodeData(token: string): string {
  // The QR code contains a URL that the mobile app will open
  // This URL includes the token for session claiming
  const baseUrl = window.location.origin
  return `${baseUrl}/qr-claim/${token}`
}
