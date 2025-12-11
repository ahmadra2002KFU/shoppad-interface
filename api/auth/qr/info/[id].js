import { queryOne } from '../../../lib/db.js';
import { requireAuth, handleCors } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // This endpoint requires authentication (phone scanning)
  const authUser = requireAuth(req, res);
  if (!authUser) return;

  try {
    const { id: sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID required',
      });
    }

    // Get session info (without secret)
    const session = await queryOne(
      `SELECT id, status, device_info, created_at, expires_at
       FROM qr_login_sessions WHERE id = $1`,
      [sessionId]
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        code: 'SESSION_NOT_FOUND',
      });
    }

    // Check if expired
    const isExpired = new Date(session.expires_at) < new Date();

    if (isExpired || session.status === 'expired') {
      return res.json({
        success: true,
        data: {
          sessionId,
          status: 'expired',
          canAuthorize: false,
        },
      });
    }

    if (session.status !== 'pending') {
      return res.json({
        success: true,
        data: {
          sessionId,
          status: session.status,
          canAuthorize: false,
        },
      });
    }

    res.json({
      success: true,
      data: {
        sessionId,
        status: session.status,
        deviceInfo: session.device_info,
        createdAt: session.created_at,
        expiresAt: session.expires_at,
        canAuthorize: true,
      },
    });
  } catch (error) {
    console.error('QR info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session info',
    });
  }
}
