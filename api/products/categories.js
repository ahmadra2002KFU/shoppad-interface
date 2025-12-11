import { query } from '../lib/db.js';
import { handleCors } from '../lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const categories = await query(
      `SELECT DISTINCT category, COUNT(*) as product_count
       FROM products
       WHERE is_active = true
       GROUP BY category
       ORDER BY category`
    );

    res.json({
      success: true,
      data: categories.map(c => ({
        name: c.category,
        productCount: parseInt(c.product_count),
      })),
    });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
    });
  }
}
