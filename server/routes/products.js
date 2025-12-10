/**
 * Product Routes
 * CRUD operations for products
 */

import express from 'express';
import { Product } from '../models/Product.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /products
 * List all products (public)
 */
router.get('/', optionalAuth, (req, res) => {
  try {
    const { category, search, active } = req.query;
    const products = Product.getAll({
      category,
      search,
      active: active !== 'false'
    });

    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('[Products] Get all error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get products'
    });
  }
});

/**
 * GET /products/categories
 * Get all categories
 */
router.get('/categories', (req, res) => {
  try {
    const categories = Product.getCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('[Products] Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get categories'
    });
  }
});

/**
 * GET /products/stats
 * Get product statistics
 */
router.get('/stats', (req, res) => {
  try {
    const byCategory = Product.getCountByCategory();
    const total = byCategory.reduce((sum, c) => sum + c.count, 0);

    res.json({
      success: true,
      data: {
        total,
        byCategory
      }
    });
  } catch (error) {
    console.error('[Products] Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get stats'
    });
  }
});

/**
 * GET /products/barcode/:barcode
 * Find product by barcode
 */
router.get('/barcode/:barcode', (req, res) => {
  try {
    const product = Product.findByBarcode(req.params.barcode);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('[Products] Find by barcode error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find product'
    });
  }
});

/**
 * GET /products/:id
 * Get single product by ID
 */
router.get('/:id', (req, res) => {
  try {
    const product = Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('[Products] Get by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get product'
    });
  }
});

/**
 * POST /products
 * Create a new product (requires auth)
 */
router.post('/', authMiddleware, (req, res) => {
  try {
    const { name, nameAr, category, price, barcode, weight, imageUrl } = req.body;

    // Validation
    if (!name || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Name, category, and price are required'
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be greater than 0'
      });
    }

    // Check barcode uniqueness
    if (barcode && Product.barcodeExists(barcode)) {
      return res.status(409).json({
        success: false,
        error: 'Barcode already exists'
      });
    }

    const product = Product.create({
      name,
      nameAr,
      category,
      price,
      barcode,
      weight,
      imageUrl
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('[Products] Create error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product'
    });
  }
});

/**
 * PUT /products/:id
 * Update a product (requires auth)
 */
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const existing = Product.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const { name, nameAr, category, price, barcode, weight, imageUrl, isActive } = req.body;

    // Validate price if provided
    if (price !== undefined && price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be greater than 0'
      });
    }

    // Check barcode uniqueness if changing
    if (barcode && barcode !== existing.barcode && Product.barcodeExists(barcode, req.params.id)) {
      return res.status(409).json({
        success: false,
        error: 'Barcode already exists'
      });
    }

    const product = Product.update(req.params.id, {
      name,
      nameAr,
      category,
      price,
      barcode,
      weight,
      imageUrl,
      isActive
    });

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('[Products] Update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product'
    });
  }
});

/**
 * DELETE /products/:id
 * Soft delete a product (requires auth)
 */
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const existing = Product.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    Product.delete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('[Products] Delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product'
    });
  }
});

export default router;
