/**
 * Product Model
 * Handles product CRUD operations
 */

import { v4 as uuidv4 } from 'uuid';
import db from '../database/index.js';

export class Product {
  /**
   * Get all products with optional filtering
   */
  static getAll({ category, active = true, search } = {}) {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (active) {
      sql += ' AND is_active = 1';
    }

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR name_ar LIKE ? OR barcode LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    sql += ' ORDER BY category, name';
    return db.get().prepare(sql).all(...params);
  }

  /**
   * Find product by ID
   */
  static findById(id) {
    return db.get().prepare('SELECT * FROM products WHERE id = ?').get(id);
  }

  /**
   * Find product by barcode
   */
  static findByBarcode(barcode) {
    return db.get().prepare('SELECT * FROM products WHERE barcode = ? AND is_active = 1').get(barcode);
  }

  /**
   * Create a new product
   */
  static create({ name, nameAr, category, price, barcode, weight, imageUrl }) {
    const id = uuidv4();
    const stmt = db.get().prepare(`
      INSERT INTO products (id, name, name_ar, category, price, barcode, weight, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, name, nameAr || null, category, price, barcode || null, weight || null, imageUrl || null);
    return this.findById(id);
  }

  /**
   * Update a product
   */
  static update(id, { name, nameAr, category, price, barcode, weight, imageUrl, isActive }) {
    const updates = [];
    const params = [];

    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (nameAr !== undefined) { updates.push('name_ar = ?'); params.push(nameAr); }
    if (category !== undefined) { updates.push('category = ?'); params.push(category); }
    if (price !== undefined) { updates.push('price = ?'); params.push(price); }
    if (barcode !== undefined) { updates.push('barcode = ?'); params.push(barcode); }
    if (weight !== undefined) { updates.push('weight = ?'); params.push(weight); }
    if (imageUrl !== undefined) { updates.push('image_url = ?'); params.push(imageUrl); }
    if (isActive !== undefined) { updates.push('is_active = ?'); params.push(isActive ? 1 : 0); }

    if (updates.length === 0) return this.findById(id);

    updates.push("updated_at = datetime('now')");
    params.push(id);

    const sql = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;
    db.get().prepare(sql).run(...params);
    return this.findById(id);
  }

  /**
   * Soft delete a product
   */
  static delete(id) {
    return this.update(id, { isActive: false });
  }

  /**
   * Get all categories
   */
  static getCategories() {
    const result = db.get().prepare(`
      SELECT DISTINCT category FROM products WHERE is_active = 1 ORDER BY category
    `).all();
    return result.map(r => r.category);
  }

  /**
   * Get product count by category
   */
  static getCountByCategory() {
    return db.get().prepare(`
      SELECT category, COUNT(*) as count
      FROM products
      WHERE is_active = 1
      GROUP BY category
      ORDER BY category
    `).all();
  }

  /**
   * Check if barcode exists
   */
  static barcodeExists(barcode, excludeId = null) {
    let sql = 'SELECT 1 FROM products WHERE barcode = ?';
    const params = [barcode];

    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }

    return !!db.get().prepare(sql).get(...params);
  }
}
