/**
 * QR Login Session Model
 * Handles QR code-based authentication sessions
 */

import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import db from '../database/index.js';

const SESSION_EXPIRY_MINUTES = 5;

export class QRLoginSession {
  /**
   * Create a new QR login session
   * @param {string} deviceInfo - Optional cart/tablet identifier
   * @returns {object} Session with id, secret, expiresAt
   */
  static create(deviceInfo = null) {
    const id = uuidv4();
    const secret = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MINUTES * 60 * 1000).toISOString();

    const stmt = db.get().prepare(`
      INSERT INTO qr_login_sessions (id, secret, status, device_info, expires_at)
      VALUES (?, ?, 'pending', ?, ?)
    `);

    stmt.run(id, secret, deviceInfo, expiresAt);

    return { id, secret, expiresAt };
  }

  /**
   * Find session by ID
   * @param {string} id - Session UUID
   * @returns {object|undefined} Session object or undefined
   */
  static findById(id) {
    const stmt = db.get().prepare(`
      SELECT * FROM qr_login_sessions WHERE id = ?
    `);
    return stmt.get(id);
  }

  /**
   * Validate session secret
   * @param {string} id - Session UUID
   * @param {string} secret - Secret to validate
   * @returns {boolean} True if secret matches
   */
  static validateSecret(id, secret) {
    const session = this.findById(id);
    return session && session.secret === secret;
  }

  /**
   * Check if session is expired
   * @param {object} session - Session object
   * @returns {boolean} True if expired
   */
  static isExpired(session) {
    return new Date(session.expires_at) < new Date();
  }

  /**
   * Authorize session with user
   * @param {string} sessionId - Session UUID
   * @param {string} userId - User ID to link
   * @returns {boolean} True if successfully authorized
   */
  static authorize(sessionId, userId) {
    const stmt = db.get().prepare(`
      UPDATE qr_login_sessions
      SET status = 'authorized', user_id = ?, authorized_at = datetime('now')
      WHERE id = ? AND status = 'pending'
    `);
    const result = stmt.run(userId, sessionId);
    return result.changes > 0;
  }

  /**
   * Mark session as used (token was retrieved)
   * @param {string} sessionId - Session UUID
   */
  static markUsed(sessionId) {
    const stmt = db.get().prepare(`
      UPDATE qr_login_sessions
      SET status = 'used', used_at = datetime('now')
      WHERE id = ? AND status = 'authorized'
    `);
    stmt.run(sessionId);
  }

  /**
   * Mark session as expired
   * @param {string} sessionId - Session UUID
   */
  static markExpired(sessionId) {
    const stmt = db.get().prepare(`
      UPDATE qr_login_sessions
      SET status = 'expired'
      WHERE id = ? AND status = 'pending'
    `);
    stmt.run(sessionId);
  }

  /**
   * Cleanup all expired sessions
   * @returns {object} Result with changes count
   */
  static cleanupExpired() {
    const stmt = db.get().prepare(`
      UPDATE qr_login_sessions
      SET status = 'expired'
      WHERE status = 'pending' AND expires_at < datetime('now')
    `);
    return stmt.run();
  }

  /**
   * Get session with user info (for authorized sessions)
   * @param {string} sessionId - Session UUID
   * @returns {object|undefined} Session with user data
   */
  static findByIdWithUser(sessionId) {
    const stmt = db.get().prepare(`
      SELECT
        s.*,
        u.id as user_id,
        u.name as user_name,
        u.phone as user_phone,
        u.preferred_payment_id as user_preferred_payment_id
      FROM qr_login_sessions s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `);
    return stmt.get(sessionId);
  }

  /**
   * Delete old sessions (cleanup job)
   * @param {number} daysOld - Delete sessions older than this many days
   * @returns {object} Result with changes count
   */
  static deleteOld(daysOld = 7) {
    const stmt = db.get().prepare(`
      DELETE FROM qr_login_sessions
      WHERE created_at < datetime('now', '-' || ? || ' days')
    `);
    return stmt.run(daysOld);
  }
}
