import { queryOne, execute } from '../../../lib/db.js';
import { generateToken, handleCors } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { id: sessionId } = req.query;
    const secret = req.headers['x-qr-secret'];

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID required',
      });
    }

    // Get session
    const session = await queryOne(
      `SELECT s.*, u.id as user_id, u.name, u.phone, u.nfc_uid, u.preferred_payment_id
       FROM qr_login_sessions s
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.id = $1`,
      [sessionId]
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        code: 'SESSION_NOT_FOUND',
      });
    }

    // Validate secret
    if (session.secret !== secret) {
      return res.status(403).json({
        success: false,
        error: 'Invalid session secret',
        code: 'INVALID_SECRET',
      });
    }

    // Check if expired
    if (new Date(session.expires_at) < new Date()) {
      if (session.status === 'pending') {
        await execute(
          `UPDATE qr_login_sessions SET status = 'expired' WHERE id = $1`,
          [sessionId]
        );
      }
      return res.json({
        success: true,
        data: {
          status: 'expired',
          sessionId,
        },
      });
    }

    // If authorized and not yet used, return token
    if (session.status === 'authorized' && session.user_id) {
      // Mark as used
      await execute(
        `UPDATE qr_login_sessions SET status = 'used', used_at = NOW() WHERE id = $1`,
        [sessionId]
      );

      const user = {
        id: session.user_id,
        name: session.name,
        phone: session.phone,
        nfcUid: session.nfc_uid,
        preferredPaymentId: session.preferred_payment_id,
      };

      const token = generateToken(user);

      return res.json({
        success: true,
        data: {
          status: 'authorized',
          sessionId,
          token,
          user,
        },
      });
    }

    // Return current status
    res.json({
      success: true,
      data: {
        status: session.status,
        sessionId,
        expiresAt: session.expires_at,
      },
    });
  } catch (error) {
    console.error('QR status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session status',
    });
  }
}
