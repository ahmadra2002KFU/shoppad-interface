import { queryOne, execute } from '../lib/db.js';
import { requireAuth, handleCors } from '../lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  // Verify authentication
  const authUser = requireAuth(req, res);
  if (!authUser) return;

  try {
    if (req.method === 'GET') {
      // Get current user
      const user = await queryOne(
        `SELECT id, name, phone, nfc_uid, preferred_payment_id, created_at, updated_at
         FROM users WHERE id = $1`,
        [authUser.userId]
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      return res.json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          nfcUid: user.nfc_uid,
          preferredPaymentId: user.preferred_payment_id,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      });
    }

    if (req.method === 'PUT') {
      // Update user profile
      const { name, preferredPaymentId } = req.body;

      const updates = [];
      const params = [];
      let paramIndex = 1;

      if (name) {
        updates.push(`name = $${paramIndex++}`);
        params.push(name);
      }

      if (preferredPaymentId !== undefined) {
        updates.push(`preferred_payment_id = $${paramIndex++}`);
        params.push(preferredPaymentId || null);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update',
        });
      }

      updates.push(`updated_at = NOW()`);
      params.push(authUser.userId);

      await execute(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
        params
      );

      // Get updated user
      const user = await queryOne(
        `SELECT id, name, phone, nfc_uid, preferred_payment_id, created_at, updated_at
         FROM users WHERE id = $1`,
        [authUser.userId]
      );

      return res.json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          nfcUid: user.nfc_uid,
          preferredPaymentId: user.preferred_payment_id,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      });
    }

    res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process request',
    });
  }
}
