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
    const { paymentMethodId, items: clientItems } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        error: 'Payment method required',
      });
    }

    // Verify payment method exists
    const paymentMethod = await query(
      'SELECT id, name FROM payment_methods WHERE id = $1 AND enabled = true',
      [paymentMethodId]
    );

    if (!paymentMethod.length) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment method',
      });
    }

    // Get cart items (or use client items)
    let items;
    if (clientItems && Array.isArray(clientItems) && clientItems.length > 0) {
      // Use client-provided items
      items = [];
      for (const ci of clientItems) {
        const product = await query(
          'SELECT id, name, price FROM products WHERE id = $1',
          [ci.productId]
        );
        if (product.length) {
          items.push({
            product_id: ci.productId,
            quantity: ci.quantity,
            price: product[0].price,
          });
        }
      }
    } else {
      // Use server cart
      items = await query(
        `SELECT c.product_id, c.quantity, p.price
         FROM user_carts c
         JOIN products p ON c.product_id = p.id
         WHERE c.user_id = $1`,
        [authUser.userId]
      );
    }

    if (!items.length) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty',
      });
    }

    // Calculate total
    const total = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

    // Create transaction
    const transactionId = generateId();
    await execute(
      `INSERT INTO transactions (id, user_id, total, payment_method_id, status, created_at)
       VALUES ($1, $2, $3, $4, 'completed', NOW())`,
      [transactionId, authUser.userId, total, paymentMethodId]
    );

    // Create transaction items
    for (const item of items) {
      await execute(
        `INSERT INTO transaction_items (id, transaction_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [generateId(), transactionId, item.product_id, item.quantity, item.price]
      );
    }

    // Clear the user's cart
    await execute('DELETE FROM user_carts WHERE user_id = $1', [authUser.userId]);

    res.json({
      success: true,
      message: 'Checkout successful',
      data: {
        transactionId,
        total: Math.round(total * 100) / 100,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        paymentMethod: paymentMethod[0].name,
      },
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      success: false,
      error: 'Checkout failed',
    });
  }
}
