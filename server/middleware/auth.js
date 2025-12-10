/**
 * Authentication Middleware
 * JWT token validation and generation
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'shoppad-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token for user
 */
export function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      phone: user.phone,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Required authentication middleware
 * Returns 401 if no valid token
 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
}

/**
 * Optional authentication middleware
 * Continues even without token, but populates req.user if valid
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = verifyToken(token);
    } catch (error) {
      // Token invalid, but continue without auth
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token) {
  return jwt.decode(token);
}
