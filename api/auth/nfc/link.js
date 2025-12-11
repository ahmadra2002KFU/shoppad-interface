import { queryOne, execute } from '../../lib/db.js';
import { requireAuth, handleCors } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  try {
    const { nfcUid } = req.body;

    if (!nfcUid || typeof nfcUid !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'NFC UID is required',
      });
    }

    // Check if NFC UID is already linked to another user
    const existing = await queryOne(
      'SELECT id, name FROM users WHERE nfc_uid = $1 AND id != $2',
      [nfcUid, authUser.userId]
    );

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'NFC card is already linked to another account',
        code: 'NFC_ALREADY_LINKED',
      });
    }

    // Link NFC card to user
    await execute(
      'UPDATE users SET nfc_uid = $1, updated_at = NOW() WHERE id = $2',
      [nfcUid, authUser.userId]
    );

    // Get updated user
    const user = await queryOne(
      'SELECT id, name, phone, nfc_uid, preferred_payment_id FROM users WHERE id = $1',
      [authUser.userId]
    );

    res.json({
      success: true,
      message: 'NFC card linked successfully',
      data: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        nfcUid: user.nfc_uid,
        preferredPaymentId: user.preferred_payment_id,
      },
    });
  } catch (error) {
    console.error('NFC link error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to link NFC card',
    });
  }
}
