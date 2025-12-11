import { query } from '../lib/db.js';
import { handleCors } from '../lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { category, search, active } = req.query;

    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (category) {
      sql += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    if (search) {
      sql += ` AND (name ILIKE $${paramIndex} OR name_ar ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (active !== undefined) {
      sql += ` AND is_active = $${paramIndex++}`;
      params.push(active === 'true');
    }

    sql += ' ORDER BY category, name';

    const products = await query(sql, params);

    res.json({
      success: true,
      count: products.length,
      data: products.map(p => ({
        id: p.id,
        name: p.name,
        nameAr: p.name_ar,
        category: p.category,
        price: parseFloat(p.price),
        barcode: p.barcode,
        weight: p.weight ? parseFloat(p.weight) : null,
        imageUrl: p.image_url,
        isActive: p.is_active,
      })),
    });
  } catch (error) {
    console.error('Products list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
    });
  }
}
