import { query } from '../lib/db.js';
import { handleCors } from '../lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const methods = await query(
      `SELECT id, name, name_ar, icon, enabled, display_order
       FROM payment_methods
       WHERE enabled = true
       ORDER BY display_order, name`
    );

    res.json({
      success: true,
      data: methods.map(m => ({
        id: m.id,
        name: m.name,
        nameAr: m.name_ar,
        icon: m.icon,
        enabled: m.enabled,
        displayOrder: m.display_order,
      })),
    });
  } catch (error) {
    console.error('Payment methods error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment methods',
    });
  }
}
