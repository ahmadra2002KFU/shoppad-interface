/**
 * QR Code Authentication Routes
 * /auth/qr/session, /auth/qr/status, /auth/qr/authorize, /auth/qr/info
 */

import express from 'express';
import { QRLoginSession } from '../models/QRLoginSession.js';
import { User } from '../models/User.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get frontend URL from environment or use default
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * POST /auth/qr/session
 * Create a new QR login session (called by cart tablet)
 */
router.post('/session', (req, res) => {
  try {
    const { deviceInfo } = req.body;

    // Cleanup old expired sessions
    QRLoginSession.cleanupExpired();

    // Create new session
    const session = QRLoginSession.create(deviceInfo);

    // Generate QR data URL
    const qrData = `${FRONTEND_URL}/authorize-cart?session=${session.id}`;

    res.status(201).json({
      success: true,
      data: {
        sessionId: session.id,
        secret: session.secret,
        expiresAt: session.expiresAt,
        qrData
      }
    });
  } catch (error) {
    console.error('[QR Auth] Create session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create QR session'
    });
  }
});

/**
 * GET /auth/qr/status/:sessionId
 * Poll session status (called by cart tablet)
 * Requires X-QR-Secret header
 */
router.get('/status/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const secret = req.headers['x-qr-secret'];

    // Validate secret header
    if (!secret) {
      return res.status(401).json({
        success: false,
        error: 'Secret required'
      });
    }

    // Find session
    const session = QRLoginSession.findByIdWithUser(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        code: 'SESSION_NOT_FOUND'
      });
    }

    // Validate secret
    if (session.secret !== secret) {
      return res.status(401).json({
        success: false,
        error: 'Invalid secret'
      });
    }

    // Check if expired
    if (QRLoginSession.isExpired(session)) {
      QRLoginSession.markExpired(sessionId);
      return res.json({
        success: true,
        data: {
          status: 'expired',
          expiresAt: session.expires_at
        }
      });
    }

    // Return based on status
    if (session.status === 'pending') {
      return res.json({
        success: true,
        data: {
          status: 'pending',
          expiresAt: session.expires_at
        }
      });
    }

    if (session.status === 'authorized') {
      // Generate token for the cart
      const user = {
        id: session.user_id,
        name: session.user_name,
        phone: session.user_phone,
        preferred_payment_id: session.user_preferred_payment_id
      };
      const token = generateToken(user);

      // Mark session as used (one-time token retrieval)
      QRLoginSession.markUsed(sessionId);

      return res.json({
        success: true,
        data: {
          status: 'authorized',
          token,
          user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            preferredPaymentId: user.preferred_payment_id
          }
        }
      });
    }

    if (session.status === 'used') {
      return res.json({
        success: true,
        data: {
          status: 'used',
          message: 'Token already retrieved'
        }
      });
    }

    // Expired or other status
    return res.json({
      success: true,
      data: {
        status: session.status,
        expiresAt: session.expires_at
      }
    });

  } catch (error) {
    console.error('[QR Auth] Status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check session status'
    });
  }
});

/**
 * GET /auth/qr/info/:sessionId
 * Get session info before authorizing (called by phone)
 * Requires authenticated user
 */
router.get('/info/:sessionId', authMiddleware, (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = QRLoginSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        code: 'SESSION_NOT_FOUND'
      });
    }

    // Check if expired
    if (QRLoginSession.isExpired(session)) {
      return res.json({
        success: true,
        data: {
          sessionId: session.id,
          status: 'expired',
          deviceInfo: session.device_info,
          createdAt: session.created_at,
          expiresAt: session.expires_at
        }
      });
    }

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        status: session.status,
        deviceInfo: session.device_info,
        createdAt: session.created_at,
        expiresAt: session.expires_at
      }
    });
  } catch (error) {
    console.error('[QR Auth] Info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session info'
    });
  }
});

/**
 * POST /auth/qr/authorize
 * Authorize session with user's account (called by phone)
 * Requires authenticated user
 */
router.post('/authorize', authMiddleware, (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const session = QRLoginSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        code: 'SESSION_NOT_FOUND'
      });
    }

    // Check if already authorized or used
    if (session.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Session is already ${session.status}`,
        code: 'SESSION_INVALID_STATUS'
      });
    }

    // Check if expired
    if (QRLoginSession.isExpired(session)) {
      QRLoginSession.markExpired(sessionId);
      return res.status(400).json({
        success: false,
        error: 'Session has expired',
        code: 'SESSION_EXPIRED'
      });
    }

    // Authorize the session with current user
    const authorized = QRLoginSession.authorize(sessionId, req.user.userId);

    if (!authorized) {
      return res.status(500).json({
        success: false,
        error: 'Failed to authorize session'
      });
    }

    // Get user info for response
    const user = User.findById(req.user.userId);

    console.log(`[QR Auth] Session ${sessionId} authorized by user ${user.name} (${user.phone})`);

    res.json({
      success: true,
      data: {
        status: 'authorized',
        message: 'Cart authorized successfully',
        sessionId,
        user: {
          name: user.name,
          phone: user.phone
        }
      }
    });
  } catch (error) {
    console.error('[QR Auth] Authorize error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to authorize session'
    });
  }
});

export default router;
