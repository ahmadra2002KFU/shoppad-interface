import { query, execute, generateId } from '../lib/db.js';
import { requireAuth, handleCors } from '../lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  try {
    // GET - Fetch user's cart
    if (req.method === 'GET') {
      const items = await query(
        `SELECT c.id, c.product_id, c.quantity, c.added_at, c.updated_at,
                p.name, p.name_ar, p.price, p.barcode, p.image_url, p.category
         FROM user_carts c
         JOIN products p ON c.product_id = p.id
         WHERE c.user_id = $1
         ORDER BY c.added_at DESC`,
        [authUser.userId]
      );

      const total = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

      return res.json({
        success: true,
        data: {
          items: items.map(item => ({
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
          itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        },
      });
    }

    // POST - Add item to cart
    if (req.method === 'POST') {
      const { productId, quantity = 1 } = req.body;

      if (!productId) {
        return res.status(400).json({
          success: false,
          error: 'Product ID required',
        });
      }

      // Check if product exists
      const product = await query('SELECT id FROM products WHERE id = $1', [productId]);
      if (!product.length) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }

      // Check if already in cart
      const existing = await query(
        'SELECT id, quantity FROM user_carts WHERE user_id = $1 AND product_id = $2',
        [authUser.userId, productId]
      );

      if (existing.length) {
        // Update quantity
        await execute(
          'UPDATE user_carts SET quantity = quantity + $1, updated_at = NOW() WHERE id = $2',
          [quantity, existing[0].id]
        );
      } else {
        // Insert new item
        await execute(
          'INSERT INTO user_carts (id, user_id, product_id, quantity) VALUES ($1, $2, $3, $4)',
          [generateId(), authUser.userId, productId, quantity]
        );
      }

      return res.json({
        success: true,
        message: 'Item added to cart',
      });
    }

    // DELETE - Clear cart
    if (req.method === 'DELETE') {
      await execute('DELETE FROM user_carts WHERE user_id = $1', [authUser.userId]);

      return res.json({
        success: true,
        message: 'Cart cleared',
      });
    }

    res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Cart operation failed',
    });
  }
}
