import { queryOne } from '../lib/db.js';
import { handleCors } from '../lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Product ID required',
      });
    }

    const product = await queryOne(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        nameAr: product.name_ar,
        category: product.category,
        price: parseFloat(product.price),
        barcode: product.barcode,
        weight: product.weight ? parseFloat(product.weight) : null,
        imageUrl: product.image_url,
        isActive: product.is_active,
      },
    });
  } catch (error) {
    console.error('Product fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
    });
  }
}
