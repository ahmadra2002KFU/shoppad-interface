import { queryOne, execute } from '../../lib/db.js';
import { requireAuth, handleCors } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // This endpoint requires authentication (phone user)
  const authUser = requireAuth(req, res);
  if (!authUser) return;

  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID required',
      });
    }

    // Get session
    const session = await queryOne(
      `SELECT id, status, expires_at FROM qr_login_sessions WHERE id = $1`,
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
    if (new Date(session.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Session has expired',
        code: 'SESSION_EXPIRED',
      });
    }

    // Check if already used
    if (session.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Session is already ${session.status}`,
        code: 'SESSION_NOT_PENDING',
      });
    }

    // Authorize the session
    await execute(
      `UPDATE qr_login_sessions
       SET status = 'authorized', user_id = $1, authorized_at = NOW()
       WHERE id = $2`,
      [authUser.userId, sessionId]
    );

    res.json({
      success: true,
      message: 'Session authorized successfully',
      data: {
        sessionId,
        status: 'authorized',
      },
    });
  } catch (error) {
    console.error('QR authorize error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to authorize session',
    });
  }
}
