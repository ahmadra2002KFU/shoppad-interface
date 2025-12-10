/**
 * PaymentMethod Model
 * Handles payment method operations
 */

import db from '../database/index.js';

export class PaymentMethod {
  /**
   * Get all enabled payment methods
   */
  static getAll() {
    return db.get().prepare(`
      SELECT * FROM payment_methods
      WHERE enabled = 1
      ORDER BY display_order, name
    `).all();
  }

  /**
   * Get all payment methods including disabled
   */
  static getAllAdmin() {
    return db.get().prepare(`
      SELECT * FROM payment_methods
      ORDER BY display_order, name
    `).all();
  }

  /**
   * Find payment method by ID
   */
  static findById(id) {
    return db.get().prepare('SELECT * FROM payment_methods WHERE id = ?').get(id);
  }

  /**
   * Enable/disable a payment method
   */
  static setEnabled(id, enabled) {
    db.get().prepare(`
      UPDATE payment_methods SET enabled = ? WHERE id = ?
    `).run(enabled ? 1 : 0, id);
    return this.findById(id);
  }

  /**
   * Update display order
   */
  static updateOrder(id, displayOrder) {
    db.get().prepare(`
      UPDATE payment_methods SET display_order = ? WHERE id = ?
    `).run(displayOrder, id);
    return this.findById(id);
  }
}
