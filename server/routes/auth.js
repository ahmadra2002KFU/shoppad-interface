/**
 * Authentication Routes
 * Handles user signup, signin, and profile management
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query } from '../db/index.js';
import { requireAuth, generateToken, generateRefreshToken, verifyRefreshToken } from '../middleware/auth.js';

const router = express.Router();

// Validation schemas
const signupSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(8).max(20),
  password: z.string().min(6).max(100),
  preferredPaymentMethod: z.enum(['madapay', 'google_pay', 'apple_pay']).optional().default('madapay'),
});

const signinSchema = z.object({
  identifier: z.string().min(2).max(100), // Can be phone or name
  password: z.string().min(1),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  preferredPaymentMethod: z.enum(['madapay', 'google_pay', 'apple_pay']).optional(),
});

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post('/signup', async (req, res) => {
  try {
    // Validate input
    const validation = signupSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    const { name, phone, password, preferredPaymentMethod } = validation.data;

    // Check if phone already exists
    const { rows: existingUsers } = await query(
      'SELECT id FROM users WHERE phone = $1',
      [phone]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Phone number already registered',
        code: 'PHONE_EXISTS',
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const { rows } = await query(
      `INSERT INTO users (name, phone, password_hash, preferred_payment_method)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, phone, preferred_payment_method, created_at`,
      [name, phone, passwordHash, preferredPaymentMethod]
    );

    const user = rows[0];

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        preferredPaymentMethod: user.preferred_payment_method,
        createdAt: user.created_at,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user',
    });
  }
});

/**
 * POST /api/auth/signin
 * Login with phone or name
 */
router.post('/signin', async (req, res) => {
  try {
    // Validate input
    const validation = signinSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    const { identifier, password } = validation.data;

    // Find user by phone or name
    const { rows } = await query(
      'SELECT id, name, phone, password_hash, preferred_payment_method, created_at FROM users WHERE phone = $1 OR name = $1',
      [identifier]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    const user = rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        preferredPaymentMethod: user.preferred_payment_method,
        createdAt: user.created_at,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to login',
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required',
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
    }

    // Verify user still exists
    const { rows } = await query(
      'SELECT id, name, phone, preferred_payment_method FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }

    const user = rows[0];

    // Generate new tokens
    const newToken = generateToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh token',
    });
  }
});

/**
 * POST /api/auth/signout
 * Logout (client should discard tokens)
 */
router.post('/signout', requireAuth, async (req, res) => {
  // In a more complete implementation, you might want to:
  // - Add token to a blacklist
  // - Invalidate refresh tokens
  // For this POC, we just acknowledge the logout
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', requireAuth, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      phone: req.user.phone,
      preferredPaymentMethod: req.user.preferred_payment_method,
      createdAt: req.user.created_at,
    },
  });
});

/**
 * PUT /api/auth/me
 * Update current user profile
 */
router.put('/me', requireAuth, async (req, res) => {
  try {
    // Validate input
    const validation = updateProfileSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    const { name, preferredPaymentMethod } = validation.data;

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }

    if (preferredPaymentMethod !== undefined) {
      updates.push(`preferred_payment_method = $${paramIndex++}`);
      values.push(preferredPaymentMethod);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
    }

    values.push(req.user.id);

    const { rows } = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, name, phone, preferred_payment_method, created_at, updated_at`,
      values
    );

    const user = rows[0];

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        preferredPaymentMethod: user.preferred_payment_method,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
    });
  }
});

/**
 * PUT /api/auth/password
 * Change password
 */
router.put('/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters',
      });
    }

    // Get current password hash
    const { rows } = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    const isValidPassword = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect',
      });
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, req.user.id]
    );

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password',
    });
  }
});

export default router;
