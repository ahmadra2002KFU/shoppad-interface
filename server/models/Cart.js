/**
 * Cart Model
 * Handles user shopping cart operations
 */

import { v4 as uuidv4 } from 'uuid';
import db from '../database/index.js';

export class Cart {
  /**
   * Get user's cart with product details
   */
  static getByUserId(userId) {
    return db.get().prepare(`
      SELECT
        uc.id,
        uc.user_id,
        uc.product_id,
        uc.quantity,
        uc.added_at,
        uc.updated_at,
        p.name,
        p.name_ar,
        p.category,
        p.price,
        p.weight,
        p.image_url,
        p.barcode
      FROM user_carts uc
      JOIN products p ON uc.product_id = p.id
      WHERE uc.user_id = ? AND p.is_active = 1
      ORDER BY uc.added_at DESC
    `).all(userId);
  }

  /**
   * Add item to cart (upsert: add or increase quantity)
   */
  static addItem(userId, productId, quantity = 1) {
    // Check if product exists in cart
    const existing = db.get().prepare(`
      SELECT * FROM user_carts WHERE user_id = ? AND product_id = ?
    `).get(userId, productId);

    if (existing) {
      // Update quantity
      db.get().prepare(`
        UPDATE user_carts
        SET quantity = quantity + ?, updated_at = datetime('now')
        WHERE user_id = ? AND product_id = ?
      `).run(quantity, userId, productId);
    } else {
      // Insert new item
      db.get().prepare(`
        INSERT INTO user_carts (id, user_id, product_id, quantity)
        VALUES (?, ?, ?, ?)
      `).run(uuidv4(), userId, productId, quantity);
    }

    return this.getByUserId(userId);
  }

  /**
   * Set item quantity (absolute value)
   */
  static setQuantity(userId, productId, quantity) {
    if (quantity <= 0) {
      return this.removeItem(userId, productId);
    }

    const existing = db.get().prepare(`
      SELECT * FROM user_carts WHERE user_id = ? AND product_id = ?
    `).get(userId, productId);

    if (existing) {
      db.get().prepare(`
        UPDATE user_carts
        SET quantity = ?, updated_at = datetime('now')
        WHERE user_id = ? AND product_id = ?
      `).run(quantity, userId, productId);
    } else {
      db.get().prepare(`
        INSERT INTO user_carts (id, user_id, product_id, quantity)
        VALUES (?, ?, ?, ?)
      `).run(uuidv4(), userId, productId, quantity);
    }

    return this.getByUserId(userId);
  }

  /**
   * Remove item from cart
   */
  static removeItem(userId, productId) {
    db.get().prepare(`
      DELETE FROM user_carts WHERE user_id = ? AND product_id = ?
    `).run(userId, productId);

    return this.getByUserId(userId);
  }

  /**
   * Clear entire cart
   */
  static clear(userId) {
    db.get().prepare('DELETE FROM user_carts WHERE user_id = ?').run(userId);
    return [];
  }

  /**
   * Get cart totals (total price, item count, weight)
   */
  static getTotals(userId) {
    const result = db.get().prepare(`
      SELECT
        COALESCE(SUM(uc.quantity * p.price), 0) as total,
        COALESCE(SUM(uc.quantity), 0) as item_count,
        COALESCE(SUM(uc.quantity * COALESCE(p.weight, 0)), 0) as total_weight
      FROM user_carts uc
      JOIN products p ON uc.product_id = p.id
      WHERE uc.user_id = ? AND p.is_active = 1
    `).get(userId);

    return {
      total: result.total || 0,
      itemCount: result.item_count || 0,
      totalWeight: result.total_weight || 0
    };
  }

  /**
   * Check if cart has items
   */
  static hasItems(userId) {
    const result = db.get().prepare(`
      SELECT COUNT(*) as count FROM user_carts WHERE user_id = ?
    `).get(userId);
    return result.count > 0;
  }

  /**
   * Sync cart from client (for offline support)
   * Replaces entire cart with provided items
   */
  static syncFromClient(userId, items) {
    const transaction = db.get().transaction(() => {
      // Clear existing cart
      db.get().prepare('DELETE FROM user_carts WHERE user_id = ?').run(userId);

      // Insert new items
      const stmt = db.get().prepare(`
        INSERT INTO user_carts (id, user_id, product_id, quantity)
        VALUES (?, ?, ?, ?)
      `);

      for (const item of items) {
        if (item.quantity > 0) {
          stmt.run(uuidv4(), userId, item.productId, item.quantity);
        }
      }
    });

    transaction();
    return this.getByUserId(userId);
  }
}
