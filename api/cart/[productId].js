import { query, execute } from '../lib/db.js';
import { requireAuth, handleCors } from '../lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  try {
    const { productId } = req.query;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID required',
      });
    }

    // PUT - Update item quantity
    if (req.method === 'PUT') {
      const { quantity } = req.body;

      if (typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({
          success: false,
          error: 'Valid quantity required',
        });
      }

      if (quantity === 0) {
        // Remove item
        await execute(
          'DELETE FROM user_carts WHERE user_id = $1 AND product_id = $2',
          [authUser.userId, productId]
        );
      } else {
        // Update quantity
        const existing = await query(
          'SELECT id FROM user_carts WHERE user_id = $1 AND product_id = $2',
          [authUser.userId, productId]
        );

        if (existing.length) {
          await execute(
            'UPDATE user_carts SET quantity = $1, updated_at = NOW() WHERE id = $2',
            [quantity, existing[0].id]
          );
        } else {
          return res.status(404).json({
            success: false,
            error: 'Item not in cart',
          });
        }
      }

      return res.json({
        success: true,
        message: quantity === 0 ? 'Item removed from cart' : 'Cart updated',
      });
    }

    // DELETE - Remove item from cart
    if (req.method === 'DELETE') {
      const result = await execute(
        'DELETE FROM user_carts WHERE user_id = $1 AND product_id = $2',
        [authUser.userId, productId]
      );

      return res.json({
        success: true,
        message: 'Item removed from cart',
      });
    }

    res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Cart item error:', error);
    res.status(500).json({
      success: false,
      error: 'Cart operation failed',
    });
  }
}
