/**
 * Database Seed Script
 * Seeds initial data: payment methods and products
 */

import db from './index.js';

// Payment methods data
const paymentMethods = [
  { id: 'mada', name: 'Mada Pay', name_ar: 'مدى', icon: 'credit-card', display_order: 1 },
  { id: 'apple', name: 'Apple Pay', name_ar: 'Apple Pay', icon: 'apple', display_order: 2 },
  { id: 'google', name: 'Google Pay', name_ar: 'Google Pay', icon: 'smartphone', display_order: 3 },
  { id: 'cod', name: 'Cash on Delivery', name_ar: 'الدفع عند الاستلام', icon: 'banknote', display_order: 4 },
];

// Products data (migrated from src/data/products.ts)
const products = [
  // Fresh Produce
  { id: '1', name: 'Fresh Tomatoes', name_ar: 'طماطم طازجة', category: 'Fresh Produce', price: 11.25, barcode: '6001234567890', weight: 0.5 },
  { id: '2', name: 'Organic Potatoes', name_ar: 'بطاطس عضوية', category: 'Fresh Produce', price: 13.12, barcode: '6001234567906', weight: 1.0 },
  { id: '3', name: 'Red Apples', name_ar: 'تفاح أحمر', category: 'Fresh Produce', price: 18.75, barcode: '6001234567913', weight: 0.8 },
  { id: '4', name: 'Fresh Bananas', name_ar: 'موز طازج', category: 'Fresh Produce', price: 9.50, barcode: '6001234567920', weight: 0.6 },
  { id: '5', name: 'Fresh Carrots', name_ar: 'جزر طازج', category: 'Fresh Produce', price: 8.75, barcode: '6001234567937', weight: 0.7 },

  // Dairy & Bakery
  { id: '6', name: 'Fresh Milk', name_ar: 'حليب طازج', category: 'Dairy & Bakery', price: 15.99, barcode: '6002234567891', weight: 1.0 },
  { id: '7', name: 'Fresh Bread', name_ar: 'خبز طازج', category: 'Dairy & Bakery', price: 7.50, barcode: '6002234567907', weight: null },
  { id: '8', name: 'Cheese Selection', name_ar: 'تشكيلة جبن', category: 'Dairy & Bakery', price: 32.99, barcode: '6002234567914', weight: 0.3 },

  // Beverages
  { id: '9', name: 'Orange Juice', name_ar: 'عصير برتقال', category: 'Beverages', price: 12.50, barcode: '6003234567892', weight: 1.0 },

  // Pantry Staples
  { id: '10', name: 'Pasta', name_ar: 'معكرونة', category: 'Pantry Staples', price: 14.25, barcode: '6004234567893', weight: null },
  { id: '11', name: 'White Rice', name_ar: 'أرز أبيض', category: 'Pantry Staples', price: 28.99, barcode: '6004234567909', weight: 2.0 },
  { id: '12', name: 'Olive Oil', name_ar: 'زيت زيتون', category: 'Pantry Staples', price: 45.00, barcode: '6004234567916', weight: 1.0 },

  // Household
  { id: '13', name: 'Cleaning Supplies', name_ar: 'مواد تنظيف', category: 'Household', price: 22.50, barcode: '6005234567894', weight: null },
  { id: '14', name: 'Tissue Paper', name_ar: 'مناديل ورقية', category: 'Household', price: 18.99, barcode: '6005234567900', weight: null },
  { id: '15', name: 'Soap & Shampoo', name_ar: 'صابون وشامبو', category: 'Household', price: 35.75, barcode: '6005234567917', weight: null },

  // Snacks
  { id: '16', name: 'Chips & Snacks', name_ar: 'شيبس ووجبات خفيفة', category: 'Snacks', price: 16.50, barcode: '6006234567895', weight: null },

  // Meat & Poultry
  { id: '17', name: 'Fresh Chicken', name_ar: 'دجاج طازج', category: 'Meat & Poultry', price: 42.00, barcode: '6007234567896', weight: 1.5 },

  // Clothing
  { id: '18', name: 'Cotton T-Shirt', name_ar: 'تيشيرت قطني', category: 'Clothing', price: 75.00, barcode: '6008234567897', weight: null },
  { id: '19', name: 'Casual Pants', name_ar: 'بنطلون كاجوال', category: 'Clothing', price: 150.00, barcode: '6008234567903', weight: null },

  // Kitchen
  { id: '20', name: 'Cookware Set', name_ar: 'طقم أواني طبخ', category: 'Kitchen', price: 299.99, barcode: '6009234567898', weight: null },
  { id: '21', name: 'Kitchen Utensils', name_ar: 'أدوات مطبخ', category: 'Kitchen', price: 93.75, barcode: '6009234567904', weight: null },
];

/**
 * Seed payment methods
 */
function seedPaymentMethods() {
  const stmt = db.get().prepare(`
    INSERT OR REPLACE INTO payment_methods (id, name, name_ar, icon, display_order, enabled)
    VALUES (?, ?, ?, ?, ?, 1)
  `);

  const insertMany = db.get().transaction((methods) => {
    for (const m of methods) {
      stmt.run(m.id, m.name, m.name_ar, m.icon, m.display_order);
    }
  });

  insertMany(paymentMethods);
  console.log(`[Seed] Inserted ${paymentMethods.length} payment methods`);
}

/**
 * Seed products
 */
function seedProducts() {
  const stmt = db.get().prepare(`
    INSERT OR REPLACE INTO products (id, name, name_ar, category, price, barcode, weight, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `);

  const insertMany = db.get().transaction((prods) => {
    for (const p of prods) {
      stmt.run(p.id, p.name, p.name_ar, p.category, p.price, p.barcode, p.weight);
    }
  });

  insertMany(products);
  console.log(`[Seed] Inserted ${products.length} products`);
}

/**
 * Run all seeds
 */
export function seed() {
  console.log('[Seed] Starting database seeding...');

  try {
    seedPaymentMethods();
    seedProducts();
    console.log('[Seed] Database seeding completed successfully');
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    throw error;
  }
}

/**
 * Check if database needs seeding
 */
export function needsSeeding() {
  const productCount = db.get().prepare('SELECT COUNT(*) as count FROM products').get();
  return productCount.count === 0;
}

// Run seed if this file is executed directly
const isMainModule = process.argv[1]?.endsWith('seed.js');
if (isMainModule) {
  db.init();
  seed();
  db.close();
}
