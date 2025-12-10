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

export default router;
