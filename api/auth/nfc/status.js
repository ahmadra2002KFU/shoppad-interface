import { queryOne } from '../../lib/db.js';
import { requireAuth, handleCors } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  try {
    const user = await queryOne(
      'SELECT nfc_uid FROM users WHERE id = $1',
      [authUser.userId]
    );

    res.json({
      success: true,
      data: {
        isLinked: !!user?.nfc_uid,
        nfcUid: user?.nfc_uid || null,
      },
    });
  } catch (error) {
    console.error('NFC status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get NFC status',
    });
  }
}
