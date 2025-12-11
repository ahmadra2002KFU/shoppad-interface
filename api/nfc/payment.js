import { query, execute, generateId, queryOne } from '../lib/db.js';
import { handleCors } from '../lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { nfc_uid, items } = req.body;

    if (!nfc_uid) {
      return res.status(400).json({
        success: false,
        error: 'NFC UID required',
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Items required',
      });
    }

    // Find user by NFC UID
    const user = await queryOne(
      'SELECT id, name, preferred_payment_id FROM users WHERE nfc_uid = $1',
      [nfc_uid]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NFC card not linked to any user',
        code: 'NFC_NOT_LINKED',
      });
    }

    // Determine payment method
    let paymentMethodId = user.preferred_payment_id;
    if (!paymentMethodId) {
      // Use first enabled payment method as default
      const defaultMethod = await queryOne(
        'SELECT id FROM payment_methods WHERE enabled = true ORDER BY display_order LIMIT 1'
      );
      paymentMethodId = defaultMethod?.id;
    }

    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        error: 'No payment method available',
      });
    }

    // Validate items and calculate total
    let total = 0;
    const validItems = [];

    for (const item of items) {
      const product = await queryOne(
        'SELECT id, name, price FROM products WHERE id = $1',
        [item.productId]
      );

      if (product) {
        validItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: parseFloat(product.price),
        });
        total += parseFloat(product.price) * item.quantity;
      }
    }

    if (validItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid items',
      });
    }

    // Create transaction
    const transactionId = generateId();
    await execute(
      `INSERT INTO transactions (id, user_id, total, payment_method_id, status, nfc_uid, created_at, completed_at)
       VALUES ($1, $2, $3, $4, 'completed', $5, NOW(), NOW())`,
      [transactionId, user.id, total, paymentMethodId, nfc_uid]
    );

    // Create transaction items
    for (const item of validItems) {
      await execute(
        `INSERT INTO transaction_items (id, transaction_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [generateId(), transactionId, item.productId, item.quantity, item.price]
      );
    }

    // Record NFC event with transaction details
    await execute(
      `INSERT INTO nfc_events (uid, event, device_id, processed, transaction_id, user_name, total)
       VALUES ($1, $2, $3, true, $4, $5, $6)`,
      [nfc_uid, 'nfc_payment', 'auto-payment', transactionId, user.name, total]
    );

    res.json({
      success: true,
      message: 'NFC payment processed',
      data: {
        transactionId,
        userId: user.id,
        userName: user.name,
        total: Math.round(total * 100) / 100,
        itemCount: validItems.reduce((sum, item) => sum + item.quantity, 0),
      },
    });
  } catch (error) {
    console.error('NFC payment error:', error);
    res.status(500).json({
      success: false,
      error: 'NFC payment failed',
    });
  }
}
