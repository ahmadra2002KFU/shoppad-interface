/**
 * Cart Routes
 * User shopping cart operations
 */

import express from 'express';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All cart routes require authentication
router.use(authMiddleware);

/**
 * GET /cart
 * Get user's cart with items and totals
 */
router.get('/', (req, res) => {
  try {
    const items = Cart.getByUserId(req.user.userId);
    const totals = Cart.getTotals(req.user.userId);

    res.json({
      success: true,
      data: {
        items,
        ...totals
      }
    });
  } catch (error) {
    console.error('[Cart] Get cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cart'
    });
  }
});

/**
 * POST /cart
 * Add item to cart
 */
router.post('/', (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'productId is required'
      });
    }

    // Verify product exists
    const product = Product.findById(productId);
    if (!product || !product.is_active) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const items = Cart.addItem(req.user.userId, productId, quantity);
    const totals = Cart.getTotals(req.user.userId);

    res.json({
      success: true,
      data: {
        items,
        ...totals
      }
    });
  } catch (error) {
    console.error('[Cart] Add item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add item to cart'
    });
  }
});

/**
 * PUT /cart/:productId
 * Update item quantity
 */
router.put('/:productId', (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        error: 'quantity is required'
      });
    }

    const items = Cart.setQuantity(req.user.userId, req.params.productId, quantity);
    const totals = Cart.getTotals(req.user.userId);

    res.json({
      success: true,
      data: {
        items,
        ...totals
      }
    });
  } catch (error) {
    console.error('[Cart] Update quantity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update cart'
    });
  }
});

/**
 * DELETE /cart/:productId
 * Remove item from cart
 */
router.delete('/:productId', (req, res) => {
  try {
    const items = Cart.removeItem(req.user.userId, req.params.productId);
    const totals = Cart.getTotals(req.user.userId);

    res.json({
      success: true,
      data: {
        items,
        ...totals
      }
    });
  } catch (error) {
    console.error('[Cart] Remove item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove item from cart'
    });
  }
});

/**
 * DELETE /cart
 * Clear entire cart
 */
router.delete('/', (req, res) => {
  try {
    Cart.clear(req.user.userId);

    res.json({
      success: true,
      data: {
        items: [],
        total: 0,
        itemCount: 0,
        totalWeight: 0
      }
    });
  } catch (error) {
    console.error('[Cart] Clear cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cart'
    });
  }
});

/**
 * POST /cart/sync
 * Sync cart from client (for offline support)
 */
router.post('/sync', (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'items must be an array'
      });
    }

    const syncedItems = Cart.syncFromClient(req.user.userId, items);
    const totals = Cart.getTotals(req.user.userId);

    res.json({
      success: true,
      data: {
        items: syncedItems,
        ...totals
      }
    });
  } catch (error) {
    console.error('[Cart] Sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync cart'
    });
  }
});

export default router;
