import { execute, generateId } from '../../lib/db.js';
import { handleCors } from '../../lib/auth.js';
import { randomBytes } from 'crypto';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { deviceInfo } = req.body;

    const sessionId = generateId();
    const secret = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await execute(
      `INSERT INTO qr_login_sessions (id, secret, status, device_info, expires_at)
       VALUES ($1, $2, 'pending', $3, $4)`,
      [sessionId, secret, deviceInfo || null, expiresAt.toISOString()]
    );

    res.json({
      success: true,
      data: {
        sessionId,
        secret,
        expiresAt: expiresAt.toISOString(),
        qrData: JSON.stringify({ sessionId, type: 'shoppad-login' }),
      },
    });
  } catch (error) {
    console.error('QR session creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create QR session',
    });
  }
}
