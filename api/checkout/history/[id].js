import { query, queryOne } from '../../lib/db.js';
import { requireAuth, handleCors } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Transaction ID required',
      });
    }

    // Get transaction (verify ownership)
    const transaction = await queryOne(
      `SELECT t.*, pm.name as payment_method_name, pm.icon as payment_method_icon
       FROM transactions t
       JOIN payment_methods pm ON t.payment_method_id = pm.id
       WHERE t.id = $1 AND t.user_id = $2`,
      [id, authUser.userId]
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
      });
    }

    // Get transaction items
    const items = await query(
      `SELECT ti.quantity, ti.unit_price,
              p.id as product_id, p.name, p.name_ar, p.barcode, p.image_url, p.category
       FROM transaction_items ti
       JOIN products p ON ti.product_id = p.id
       WHERE ti.transaction_id = $1`,
      [id]
    );

    res.json({
      success: true,
      data: {
        id: transaction.id,
        total: parseFloat(transaction.total),
        status: transaction.status,
        createdAt: transaction.created_at,
        completedAt: transaction.completed_at,
        paymentMethod: {
          id: transaction.payment_method_id,
          name: transaction.payment_method_name,
          icon: transaction.payment_method_icon,
        },
        items: items.map(item => ({
          quantity: item.quantity,
          unitPrice: parseFloat(item.unit_price),
          subtotal: Math.round(parseFloat(item.unit_price) * item.quantity * 100) / 100,
          product: {
            id: item.product_id,
            name: item.name,
            nameAr: item.name_ar,
            barcode: item.barcode,
            imageUrl: item.image_url,
            category: item.category,
          },
        })),
      },
    });
  } catch (error) {
    console.error('Transaction detail error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction details',
    });
  }
}
