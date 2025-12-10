/**
 * Transaction Model
 * Handles checkout and transaction operations
 */

import { v4 as uuidv4 } from 'uuid';
import db from '../database/index.js';
import { Cart } from './Cart.js';

export class Transaction {
  /**
   * Create a new transaction from user's cart
   */
  static create(userId, paymentMethodId, nfcUid = null) {
    const cartItems = Cart.getByUserId(userId);

    if (cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    const totals = Cart.getTotals(userId);
    const transactionId = uuidv4();

    // Use transaction for atomicity
    const createTransaction = db.get().transaction(() => {
      // Create transaction record
      db.get().prepare(`
        INSERT INTO transactions (id, user_id, total, payment_method_id, status, nfc_uid)
        VALUES (?, ?, ?, ?, 'pending', ?)
      `).run(transactionId, userId, totals.total, paymentMethodId, nfcUid);

      // Create transaction items
      const itemStmt = db.get().prepare(`
        INSERT INTO transaction_items (id, transaction_id, product_id, quantity, unit_price)
        VALUES (?, ?, ?, ?, ?)
      `);

      for (const item of cartItems) {
        itemStmt.run(uuidv4(), transactionId, item.product_id, item.quantity, item.price);
      }
    });

    createTransaction();
    return this.findById(transactionId);
  }

  /**
   * Find transaction by ID with items
   */
  static findById(id) {
    const transaction = db.get().prepare(`
      SELECT t.*, pm.name as payment_method_name, pm.name_ar as payment_method_name_ar
      FROM transactions t
      JOIN payment_methods pm ON t.payment_method_id = pm.id
      WHERE t.id = ?
    `).get(id);

    if (transaction) {
      transaction.items = db.get().prepare(`
        SELECT ti.*, p.name as product_name, p.name_ar as product_name_ar
        FROM transaction_items ti
        JOIN products p ON ti.product_id = p.id
        WHERE ti.transaction_id = ?
      `).all(id);
    }

    return transaction;
  }

  /**
   * Mark transaction as completed
   */
  static complete(id) {
    db.get().prepare(`
      UPDATE transactions
      SET status = 'completed', completed_at = datetime('now')
      WHERE id = ?
    `).run(id);
    return this.findById(id);
  }

  /**
   * Mark transaction as failed
   */
  static fail(id) {
    db.get().prepare(`
      UPDATE transactions SET status = 'failed' WHERE id = ?
    `).run(id);
    return this.findById(id);
  }

  /**
   * Cancel a pending transaction
   */
  static cancel(id) {
    const transaction = this.findById(id);
    if (transaction && transaction.status === 'pending') {
      db.get().prepare(`
        UPDATE transactions SET status = 'cancelled' WHERE id = ?
      `).run(id);
    }
    return this.findById(id);
  }

  /**
   * Get user's transaction history
   */
  static getByUserId(userId, { limit = 50, status } = {}) {
    let sql = `
      SELECT t.*, pm.name as payment_method_name, pm.name_ar as payment_method_name_ar
      FROM transactions t
      JOIN payment_methods pm ON t.payment_method_id = pm.id
      WHERE t.user_id = ?
    `;
    const params = [userId];

    if (status) {
      sql += ' AND t.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY t.created_at DESC LIMIT ?';
    params.push(limit);

    return db.get().prepare(sql).all(...params);
  }

  /**
   * Get transaction statistics for user
   */
  static getUserStats(userId) {
    return db.get().prepare(`
      SELECT
        COUNT(*) as total_transactions,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN total ELSE 0 END), 0) as total_spent,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
      FROM transactions
      WHERE user_id = ?
    `).get(userId);
  }
}
