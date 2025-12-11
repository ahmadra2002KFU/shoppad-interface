import { query, execute, generateId } from '../lib/db.js';
import { requireAuth, handleCors } from '../lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'Items array required',
      });
    }

    // Clear existing cart
    await execute('DELETE FROM user_carts WHERE user_id = $1', [authUser.userId]);

    // Insert new items
    for (const item of items) {
      if (item.productId && item.quantity > 0) {
        // Verify product exists
        const product = await query('SELECT id FROM products WHERE id = $1', [item.productId]);
        if (product.length) {
          await execute(
            'INSERT INTO user_carts (id, user_id, product_id, quantity) VALUES ($1, $2, $3, $4)',
            [generateId(), authUser.userId, item.productId, item.quantity]
          );
        }
      }
    }

    // Return updated cart
    const cartItems = await query(
      `SELECT c.id, c.product_id, c.quantity, c.added_at, c.updated_at,
              p.name, p.name_ar, p.price, p.barcode, p.image_url, p.category
       FROM user_carts c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1
       ORDER BY c.added_at DESC`,
      [authUser.userId]
    );

    const total = cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

    res.json({
      success: true,
      message: 'Cart synced successfully',
      data: {
        items: cartItems.map(item => ({
          id: item.id,
          productId: item.product_id,
          quantity: item.quantity,
          addedAt: item.added_at,
          updatedAt: item.updated_at,
          product: {
            id: item.product_id,
            name: item.name,
            nameAr: item.name_ar,
            price: parseFloat(item.price),
            barcode: item.barcode,
            imageUrl: item.image_url,
            category: item.category,
          },
        })),
        total: Math.round(total * 100) / 100,
        itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      },
    });
  } catch (error) {
    console.error('Cart sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync cart',
    });
  }
}
