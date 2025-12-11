import { query } from '../lib/db.js';
import { requireAuth, handleCors } from '../lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  try {
    const { limit = 20, offset = 0 } = req.query;

    const transactions = await query(
      `SELECT t.id, t.total, t.status, t.created_at, t.completed_at,
              pm.name as payment_method_name, pm.icon as payment_method_icon,
              (SELECT COUNT(*) FROM transaction_items WHERE transaction_id = t.id) as item_count
       FROM transactions t
       JOIN payment_methods pm ON t.payment_method_id = pm.id
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC
       LIMIT $2 OFFSET $3`,
      [authUser.userId, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) as total FROM transactions WHERE user_id = $1',
      [authUser.userId]
    );

    res.json({
      success: true,
      data: transactions.map(t => ({
        id: t.id,
        total: parseFloat(t.total),
        status: t.status,
        createdAt: t.created_at,
        completedAt: t.completed_at,
        itemCount: parseInt(t.item_count),
        paymentMethod: {
          name: t.payment_method_name,
          icon: t.payment_method_icon,
        },
      })),
      pagination: {
        total: parseInt(countResult[0]?.total || 0),
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction history',
    });
  }
}
