import { query } from './lib/db.js';
import { handleCors } from './lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Test database connection
    const dbResult = await query('SELECT NOW() as time');
    const dbConnected = !!dbResult?.length;

    // Get counts for health info
    let productCount = 0;
    let userCount = 0;

    if (dbConnected) {
      const products = await query('SELECT COUNT(*) as count FROM products');
      const users = await query('SELECT COUNT(*) as count FROM users');
      productCount = parseInt(products[0]?.count || 0);
      userCount = parseInt(users[0]?.count || 0);
    }

    res.json({
      success: true,
      status: 'healthy',
      data: {
        database: dbConnected ? 'connected' : 'disconnected',
        serverTime: dbResult?.[0]?.time || new Date().toISOString(),
        stats: {
          products: productCount,
          users: userCount,
        },
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: 'Service unavailable',
      data: {
        database: 'error',
        message: error.message,
      },
    });
  }
}
