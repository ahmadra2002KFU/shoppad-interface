import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Production-ready configuration for the HTTPS weight server
 */
const config = {
  // Server settings
  server: {
    port: parseInt(process.env.PORT || '5050', 10),
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development',
    // Render.com provides RENDER_EXTERNAL_URL
    externalUrl: process.env.RENDER_EXTERNAL_URL || null,
  },

  // SSL/TLS settings
  ssl: {
    keyPath: process.env.SSL_KEY_PATH || join(__dirname, 'ssl', 'key.pem'),
    certPath: process.env.SSL_CERT_PATH || join(__dirname, 'ssl', 'cert.pem'),
  },

  // Logging settings
  logging: {
    retentionDays: parseInt(process.env.LOG_RETENTION_DAYS || '30', 10),
    directory: process.env.LOG_DIRECTORY || join(__dirname, 'logs'),
    format: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  },

  // Security settings - REAL-TIME MODE (increased limits)
  security: {
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000', 10), // Increased from 100 to 1000 for real-time
  },

  // CORS settings
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:3000'],
  },

  // Data storage settings
  data: {
    file: process.env.DATA_FILE || join(__dirname, 'data', 'weight-data.json'),
    maxEntries: parseInt(process.env.MAX_DATA_ENTRIES || '10000', 10),
  },

  // Weight sensor validation
  validation: {
    minWeight: 0,
    maxWeight: 1000, // kg
    precision: 2, // decimal places
  },
};

export default config;

