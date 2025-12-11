import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'shoppad-dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token for a user
 * @param {Object} user - User object with id, phone, name
 * @returns {string} - JWT token
 */
export function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      phone: user.phone,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded payload or null if invalid
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Extract and verify auth from request
 * @param {Object} req - Request object with headers
 * @returns {Object|null} - Decoded user payload or null
 */
export function verifyAuth(req) {
  const auth = req.headers.authorization || req.headers.Authorization;

  if (!auth || !auth.startsWith('Bearer ')) {
    return null;
  }

  const token = auth.slice(7);
  return verifyToken(token);
}

/**
 * Middleware helper - returns user or sends 401 response
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object|null} - User payload or null (response already sent)
 */
export function requireAuth(req, res) {
  const user = verifyAuth(req);

  if (!user) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized - valid token required',
      code: 'UNAUTHORIZED',
    });
    return null;
  }

  return user;
}

/**
 * Handle CORS preflight requests
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {boolean} - True if preflight was handled
 */
export function handleCors(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }

  return false;
}
