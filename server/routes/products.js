/**
 * Product Routes
 * CRUD operations for products
 */

import express from 'express';
import { z } from 'zod';
import { query } from '../db/index.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Validation schemas
const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  nameAr: z.string().max(200).optional(),
  category: z.string().min(1).max(100),
  price: z.number().positive(),
  imageUrl: z.string().url().optional(),
  barcode: z.string().max(50).optional(),
  weight: z.number().positive().optional(),
  stockQuantity: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

const updateProductSchema = createProductSchema.partial();

const querySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  isActive: z.coerce.boolean().optional(),
});

/**
 * GET /api/products
 * List all products with optional filtering
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const validation = querySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: validation.error.errors,
      });
    }

    const { category, search, page, limit, isActive } = validation.data;
    const offset = (page - 1) * limit;

    // Build query dynamically
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // Default to active products only for non-admin
    if (isActive !== undefined) {
      conditions.push(`is_active = $${paramIndex++}`);
      values.push(isActive);
    } else {
      conditions.push(`is_active = $${paramIndex++}`);
      values.push(true);
    }

    if (category) {
      conditions.push(`category = $${paramIndex++}`);
      values.push(category);
    }

    if (search) {
      conditions.push(`(name ILIKE $${paramIndex} OR name_ar ILIKE $${paramIndex} OR barcode ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM products ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Get products
    values.push(limit, offset);
    const { rows: products } = await query(
      `SELECT id, name, name_ar, category, price, image_url, barcode, weight, stock_quantity, is_active, created_at, updated_at
       FROM products
       ${whereClause}
       ORDER BY category, name
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      values
    );

    res.json({
      success: true,
      data: products.map(p => ({
        id: p.id,
        name: p.name,
        nameAr: p.name_ar,
        category: p.category,
        price: parseFloat(p.price),
        imageUrl: p.image_url,
        barcode: p.barcode,
        weight: p.weight ? parseFloat(p.weight) : null,
        stockQuantity: p.stock_quantity,
        isActive: p.is_active,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list products',
    });
  }
});

/**
 * GET /api/products/categories
 * Get all unique categories
 */
router.get('/categories', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT DISTINCT category FROM products WHERE is_active = true ORDER BY category`
    );

    res.json({
      success: true,
      categories: rows.map(r => r.category),
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get categories',
    });
  }
});

/**
 * GET /api/products/:id
 * Get a single product by ID
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await query(
      `SELECT id, name, name_ar, category, price, image_url, barcode, weight, stock_quantity, is_active, created_at, updated_at
       FROM products WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    const p = rows[0];
    res.json({
      success: true,
      product: {
        id: p.id,
        name: p.name,
        nameAr: p.name_ar,
        category: p.category,
        price: parseFloat(p.price),
        imageUrl: p.image_url,
        barcode: p.barcode,
        weight: p.weight ? parseFloat(p.weight) : null,
        stockQuantity: p.stock_quantity,
        isActive: p.is_active,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      },
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get product',
    });
  }
});

/**
 * GET /api/products/barcode/:barcode
 * Get a product by barcode
 */
router.get('/barcode/:barcode', optionalAuth, async (req, res) => {
  try {
    const { barcode } = req.params;

    const { rows } = await query(
      `SELECT id, name, name_ar, category, price, image_url, barcode, weight, stock_quantity, is_active, created_at, updated_at
       FROM products WHERE barcode = $1 AND is_active = true`,
      [barcode]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND',
      });
    }

    const p = rows[0];
    res.json({
      success: true,
      product: {
        id: p.id,
        name: p.name,
        nameAr: p.name_ar,
        category: p.category,
        price: parseFloat(p.price),
        imageUrl: p.image_url,
        barcode: p.barcode,
        weight: p.weight ? parseFloat(p.weight) : null,
        stockQuantity: p.stock_quantity,
        isActive: p.is_active,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      },
    });
  } catch (error) {
    console.error('Get product by barcode error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get product',
    });
  }
});

/**
 * POST /api/products
 * Create a new product (admin only - for POC, any authenticated user)
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const validation = createProductSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    const { name, nameAr, category, price, imageUrl, barcode, weight, stockQuantity, isActive } = validation.data;

    // Check if barcode already exists
    if (barcode) {
      const { rows: existing } = await query(
        'SELECT id FROM products WHERE barcode = $1',
        [barcode]
      );

      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Barcode already exists',
          code: 'BARCODE_EXISTS',
        });
      }
    }

    const { rows } = await query(
      `INSERT INTO products (name, name_ar, category, price, image_url, barcode, weight, stock_quantity, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, name_ar, category, price, image_url, barcode, weight, stock_quantity, is_active, created_at, updated_at`,
      [name, nameAr || null, category, price, imageUrl || null, barcode || null, weight || null, stockQuantity, isActive]
    );

    const p = rows[0];
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: {
        id: p.id,
        name: p.name,
        nameAr: p.name_ar,
        category: p.category,
        price: parseFloat(p.price),
        imageUrl: p.image_url,
        barcode: p.barcode,
        weight: p.weight ? parseFloat(p.weight) : null,
        stockQuantity: p.stock_quantity,
        isActive: p.is_active,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      },
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product',
    });
  }
});

/**
 * PUT /api/products/:id
 * Update a product (admin only - for POC, any authenticated user)
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const validation = updateProductSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    const data = validation.data;

    // Check if product exists
    const { rows: existing } = await query(
      'SELECT id FROM products WHERE id = $1',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Check barcode uniqueness if updating
    if (data.barcode) {
      const { rows: barcodeCheck } = await query(
        'SELECT id FROM products WHERE barcode = $1 AND id != $2',
        [data.barcode, id]
      );

      if (barcodeCheck.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Barcode already exists',
          code: 'BARCODE_EXISTS',
        });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    const fieldMappings = {
      name: 'name',
      nameAr: 'name_ar',
      category: 'category',
      price: 'price',
      imageUrl: 'image_url',
      barcode: 'barcode',
      weight: 'weight',
      stockQuantity: 'stock_quantity',
      isActive: 'is_active',
    };

    for (const [key, dbField] of Object.entries(fieldMappings)) {
      if (data[key] !== undefined) {
        updates.push(`${dbField} = $${paramIndex++}`);
        values.push(data[key]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
    }

    values.push(id);

    const { rows } = await query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, name, name_ar, category, price, image_url, barcode, weight, stock_quantity, is_active, created_at, updated_at`,
      values
    );

    const p = rows[0];
    res.json({
      success: true,
      message: 'Product updated successfully',
      product: {
        id: p.id,
        name: p.name,
        nameAr: p.name_ar,
        category: p.category,
        price: parseFloat(p.price),
        imageUrl: p.image_url,
        barcode: p.barcode,
        weight: p.weight ? parseFloat(p.weight) : null,
        stockQuantity: p.stock_quantity,
        isActive: p.is_active,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      },
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product',
    });
  }
});

/**
 * DELETE /api/products/:id
 * Delete a product (soft delete - sets is_active to false)
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await query(
      `UPDATE products SET is_active = false WHERE id = $1 RETURNING id`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product',
    });
  }
});

export default router;
