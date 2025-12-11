import bcrypt from 'bcryptjs';
import { queryOne, execute, generateId } from '../lib/db.js';
import { generateToken, handleCors } from '../lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { name, phone, password } = req.body;

    // Validation
    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, phone, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      });
    }

    // Check if phone already exists
    const existing = await queryOne('SELECT id FROM users WHERE phone = $1', [phone]);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Phone number already registered',
        code: 'PHONE_EXISTS',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = generateId();
    await execute(
      `INSERT INTO users (id, name, phone, password_hash)
       VALUES ($1, $2, $3, $4)`,
      [userId, name, phone, passwordHash]
    );

    // Get created user
    const user = await queryOne(
      'SELECT id, name, phone, nfc_uid, preferred_payment_id, created_at FROM users WHERE id = $1',
      [userId]
    );

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          nfcUid: user.nfc_uid,
          preferredPaymentId: user.preferred_payment_id,
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
    });
  }
}
