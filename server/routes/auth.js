/**
 * Authentication Routes
 * /auth/register, /auth/login, /auth/me
 */

import express from 'express';
import { User } from '../models/User.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /auth/register
 * Register a new user
 */
router.post('/register', (req, res) => {
  try {
    const { name, phone, password, preferredPaymentId } = req.body;

    // Validation
    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, phone, and password are required'
      });
    }

    // Validate phone format (basic validation)
    if (phone.length < 9 || phone.length > 15) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format'
      });
    }

    // Validate password length
    if (password.length < 4) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 4 characters'
      });
    }

    // Check if user exists
    if (User.phoneExists(phone)) {
      return res.status(409).json({
        success: false,
        error: 'Phone number already registered'
      });
    }

    // Create user
    const user = User.create({ name, phone, password, preferredPaymentId });
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: { user, token }
    });
  } catch (error) {
    console.error('[Auth] Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

/**
 * POST /auth/login
 * Login with phone and password
 */
router.post('/login', (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        error: 'Phone and password are required'
      });
    }

    const user = User.findByPhone(phone);

    if (!user || !User.verifyPassword(user, password)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid phone or password'
      });
    }

    const token = generateToken(user);

    // Don't send password hash to client
    const { password_hash, ...safeUser } = user;

    res.json({
      success: true,
      data: { user: safeUser, token }
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

/**
 * GET /auth/me
 * Get current user info
 */
router.get('/me', authMiddleware, (req, res) => {
  try {
    const user = User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('[Auth] Get me error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user info'
    });
  }
});

/**
 * PUT /auth/me
 * Update current user profile
 */
router.put('/me', authMiddleware, (req, res) => {
  try {
    const { name, preferredPaymentId } = req.body;
    let user = User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (name) {
      user = User.update(req.user.userId, { name });
    }

    if (preferredPaymentId !== undefined) {
      user = User.updatePreferredPayment(req.user.userId, preferredPaymentId);
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('[Auth] Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

/**
 * POST /auth/change-password
 * Change user password
 */
router.post('/change-password', authMiddleware, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current and new password are required'
      });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 4 characters'
      });
    }

    const user = User.findByPhone(req.user.phone);

    if (!User.verifyPassword(user, currentPassword)) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    User.changePassword(req.user.userId, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('[Auth] Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
});

/**
 * POST /auth/nfc/link
 * Link NFC card to user account
 */
router.post('/nfc/link', authMiddleware, (req, res) => {
  try {
    const { nfcUid } = req.body;

    if (!nfcUid || typeof nfcUid !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'NFC UID is required'
      });
    }

    // Normalize NFC UID (uppercase, no spaces)
    const normalizedUid = nfcUid.toUpperCase().replace(/\s/g, '');

    // Check if already linked to another user
    if (User.nfcUidExists(normalizedUid)) {
      const existingUser = User.findByNfcUid(normalizedUid);
      if (existingUser && existingUser.id !== req.user.userId) {
        return res.status(409).json({
          success: false,
          error: 'This NFC card is already linked to another account'
        });
      }
    }

    const user = User.linkNfcCard(req.user.userId, normalizedUid);

    console.log(`[Auth] NFC card linked: ${normalizedUid} -> User ${user.name} (${user.phone})`);

    res.json({
      success: true,
      message: 'NFC card linked successfully',
      data: {
        nfcUid: normalizedUid,
        userName: user.name
      }
    });
  } catch (error) {
    console.error('[Auth] NFC link error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to link NFC card'
    });
  }
});

/**
 * DELETE /auth/nfc/unlink
 * Unlink NFC card from user account
 */
router.delete('/nfc/unlink', authMiddleware, (req, res) => {
  try {
    const user = User.findById(req.user.userId);

    if (!user.nfc_uid) {
      return res.status(400).json({
        success: false,
        error: 'No NFC card linked to this account'
      });
    }

    const oldNfcUid = user.nfc_uid;
    User.unlinkNfcCard(req.user.userId);

    console.log(`[Auth] NFC card unlinked: ${oldNfcUid} from User ${user.name}`);

    res.json({
      success: true,
      message: 'NFC card unlinked successfully'
    });
  } catch (error) {
    console.error('[Auth] NFC unlink error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unlink NFC card'
    });
  }
});

/**
 * GET /auth/nfc/status
 * Check if user has NFC card linked
 */
router.get('/nfc/status', authMiddleware, (req, res) => {
  try {
    const user = User.findById(req.user.userId);

    res.json({
      success: true,
      data: {
        hasNfcLinked: !!user.nfc_uid,
        nfcUid: user.nfc_uid ? user.nfc_uid.substring(0, 4) + '****' : null  // Partially masked
      }
    });
  } catch (error) {
    console.error('[Auth] NFC status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get NFC status'
    });
  }
});

export default router;
