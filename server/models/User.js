/**
 * User Model
 * Handles user CRUD operations and authentication
 */

import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import db from '../database/index.js';

const SALT_ROUNDS = 10;

export class User {
  /**
   * Create a new user
   */
  static create({ name, phone, password, preferredPaymentId = null }) {
    const id = uuidv4();
    const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);

    const stmt = db.get().prepare(`
      INSERT INTO users (id, name, phone, password_hash, preferred_payment_id)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, name, phone, passwordHash, preferredPaymentId);
    return this.findById(id);
  }

  /**
   * Find user by ID (excludes password)
   */
  static findById(id) {
    const stmt = db.get().prepare(`
      SELECT id, name, phone, preferred_payment_id, nfc_uid, created_at, updated_at
      FROM users WHERE id = ?
    `);
    return stmt.get(id);
  }

  /**
   * Find user by phone (includes password hash for auth)
   */
  static findByPhone(phone) {
    const stmt = db.get().prepare(`
      SELECT * FROM users WHERE phone = ?
    `);
    return stmt.get(phone);
  }

  /**
   * Verify password against stored hash
   */
  static verifyPassword(user, password) {
    return bcrypt.compareSync(password, user.password_hash);
  }

  /**
   * Update user's preferred payment method
   */
  static updatePreferredPayment(userId, paymentMethodId) {
    const stmt = db.get().prepare(`
      UPDATE users
      SET preferred_payment_id = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    stmt.run(paymentMethodId, userId);
    return this.findById(userId);
  }

  /**
   * Update user profile
   */
  static update(userId, { name, phone }) {
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone);
    }

    if (updates.length === 0) return this.findById(userId);

    updates.push("updated_at = datetime('now')");
    params.push(userId);

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    db.get().prepare(sql).run(...params);
    return this.findById(userId);
  }

  /**
   * Change user password
   */
  static changePassword(userId, newPassword) {
    const passwordHash = bcrypt.hashSync(newPassword, SALT_ROUNDS);
    const stmt = db.get().prepare(`
      UPDATE users
      SET password_hash = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    stmt.run(passwordHash, userId);
    return true;
  }

  /**
   * Delete user (and cascade to carts)
   */
  static delete(userId) {
    const stmt = db.get().prepare('DELETE FROM users WHERE id = ?');
    stmt.run(userId);
    return true;
  }

  /**
   * Check if phone is already registered
   */
  static phoneExists(phone) {
    const stmt = db.get().prepare('SELECT 1 FROM users WHERE phone = ?');
    return !!stmt.get(phone);
  }

  /**
   * Find user by NFC UID
   */
  static findByNfcUid(nfcUid) {
    const stmt = db.get().prepare(`
      SELECT id, name, phone, preferred_payment_id, nfc_uid, created_at, updated_at
      FROM users WHERE nfc_uid = ?
    `);
    return stmt.get(nfcUid);
  }

  /**
   * Link NFC card to user
   */
  static linkNfcCard(userId, nfcUid) {
    // Check if NFC UID is already linked to another user
    const existingUser = this.findByNfcUid(nfcUid);
    if (existingUser && existingUser.id !== userId) {
      throw new Error('NFC card already linked to another user');
    }

    const stmt = db.get().prepare(`
      UPDATE users
      SET nfc_uid = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    stmt.run(nfcUid, userId);
    return this.findById(userId);
  }

  /**
   * Unlink NFC card from user
   */
  static unlinkNfcCard(userId) {
    const stmt = db.get().prepare(`
      UPDATE users
      SET nfc_uid = NULL, updated_at = datetime('now')
      WHERE id = ?
    `);
    stmt.run(userId);
    return this.findById(userId);
  }

  /**
   * Check if NFC UID is linked to any user
   */
  static nfcUidExists(nfcUid) {
    const stmt = db.get().prepare('SELECT 1 FROM users WHERE nfc_uid = ?');
    return !!stmt.get(nfcUid);
  }
}
