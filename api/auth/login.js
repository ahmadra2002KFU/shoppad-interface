import bcrypt from 'bcryptjs';
import { queryOne } from '../lib/db.js';
import { generateToken, handleCors } from '../lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { phone, password } = req.body;

    // Validation
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        error: 'Phone and password are required',
      });
    }

    // Find user by phone
    const user = await queryOne(
      'SELECT id, name, phone, password_hash, nfc_uid, preferred_payment_id FROM users WHERE phone = $1',
      [phone]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid phone or password',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid phone or password',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
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
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
    });
  }
}
