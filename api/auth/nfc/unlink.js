import { queryOne, execute } from '../../lib/db.js';
import { requireAuth, handleCors } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  try {
    // Check if user has NFC linked
    const user = await queryOne(
      'SELECT nfc_uid FROM users WHERE id = $1',
      [authUser.userId]
    );

    if (!user || !user.nfc_uid) {
      return res.status(400).json({
        success: false,
        error: 'No NFC card is linked to this account',
        code: 'NO_NFC_LINKED',
      });
    }

    // Unlink NFC card
    await execute(
      'UPDATE users SET nfc_uid = NULL, updated_at = NOW() WHERE id = $1',
      [authUser.userId]
    );

    res.json({
      success: true,
      message: 'NFC card unlinked successfully',
    });
  } catch (error) {
    console.error('NFC unlink error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unlink NFC card',
    });
  }
}
