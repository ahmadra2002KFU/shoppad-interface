/**
 * Checkout Routes
 * Payment methods and transaction processing
 */

import express from 'express';
import { Transaction } from '../models/Transaction.js';
import { Cart } from '../models/Cart.js';
import { PaymentMethod } from '../models/PaymentMethod.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All checkout routes require authentication
router.use(authMiddleware);

/**
 * GET /checkout/payment-methods
 * Get available payment methods
 */
router.get('/payment-methods', (req, res) => {
  try {
    const methods = PaymentMethod.getAll();

    res.json({
      success: true,
      data: methods
    });
  } catch (error) {
    console.error('[Checkout] Get payment methods error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment methods'
    });
  }
});

/**
 * POST /checkout
 * Process checkout and create transaction
 */
router.post('/', async (req, res) => {
  try {
    const { paymentMethodId, nfcUid } = req.body;

    // Validate payment method
    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        error: 'paymentMethodId is required'
      });
    }

    const paymentMethod = PaymentMethod.findById(paymentMethodId);
    if (!paymentMethod || !paymentMethod.enabled) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or disabled payment method'
      });
    }

    // Check cart has items
    if (!Cart.hasItems(req.user.userId)) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    }

    // Create transaction
    const transaction = Transaction.create(req.user.userId, paymentMethodId, nfcUid);

    // Simulate payment processing
    // All payment methods are simulated with 90% success rate
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      // Mark transaction as completed
      Transaction.complete(transaction.id);

      // Clear user's cart
      Cart.clear(req.user.userId);

      const completedTransaction = Transaction.findById(transaction.id);

      res.json({
        success: true,
        data: {
          transaction: completedTransaction,
          message: 'Payment successful'
        }
      });
    } else {
      // Mark transaction as failed
      Transaction.fail(transaction.id);

      const failedTransaction = Transaction.findById(transaction.id);

      res.status(402).json({
        success: false,
        error: 'Payment failed. Please try again.',
        data: {
          transaction: failedTransaction
        }
      });
    }
  } catch (error) {
    console.error('[Checkout] Process checkout error:', error);

    if (error.message === 'Cart is empty') {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Checkout failed'
    });
  }
});

/**
 * GET /checkout/history
 * Get user's transaction history
 */
router.get('/history', (req, res) => {
  try {
    const { limit = 50, status } = req.query;

    const transactions = Transaction.getByUserId(req.user.userId, {
      limit: parseInt(limit, 10),
      status
    });

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('[Checkout] Get history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transaction history'
    });
  }
});

/**
 * GET /checkout/history/:id
 * Get single transaction details
 */
router.get('/history/:id', (req, res) => {
  try {
    const transaction = Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Verify ownership
    if (transaction.user_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('[Checkout] Get transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transaction'
    });
  }
});

/**
 * GET /checkout/stats
 * Get user's checkout statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = Transaction.getUserStats(req.user.userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('[Checkout] Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get checkout stats'
    });
  }
});

export default router;
