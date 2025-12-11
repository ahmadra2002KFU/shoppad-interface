/**
 * Authentication Middleware
 * JWT token verification and user extraction
 */

import jwt from 'jsonwebtoken';
import config from '../config.js';
import { query } from '../db/index.js';

/**
 * Extract token from Authorization header
 */
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

/**
 * Verify JWT token and attach user to request
 * Required authentication - returns 401 if no valid token
 */
export async function requireAuth(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'NO_TOKEN',
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    // Fetch user from database to ensure they still exist
    const { rows } = await query(
      'SELECT id, name, phone, preferred_payment_method, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    req.user = rows[0];
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
    });
  }
}

/**
 * Optional authentication - attaches user if token is valid, continues otherwise
 */
export async function optionalAuth(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    const { rows } = await query(
      'SELECT id, name, phone, preferred_payment_method, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    req.user = rows.length > 0 ? rows[0] : null;
    req.token = token;
  } catch (error) {
    req.user = null;
  }

  next();
}

/**
 * Generate JWT token for a user
 */
export function generateToken(userId) {
  return jwt.sign(
    { userId },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(userId) {
  return jwt.sign(
    { userId, type: 'refresh' },
    config.jwt.secret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

export default {
  requireAuth,
  optionalAuth,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
};
