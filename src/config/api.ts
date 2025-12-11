/**
 * API Configuration for ShopPad
 */

// Server configuration
export const API_CONFIG = {
  // API server URL - uses relative path in production (same domain)
  // Falls back to localhost for local development with separate backend
  SERVER_URL: import.meta.env.VITE_SERVER_URL || '/api',

  // Polling interval in milliseconds (how often to fetch weight data)
  POLL_INTERVAL: 100, // 0.1 seconds (100ms) for near real-time updates

  // Request timeout in milliseconds
  TIMEOUT: 5000, // 5 seconds

  // Enable/disable weight sensor integration
  ENABLED: true,
};

// API Endpoints (all relative to SERVER_URL)
export const API_ENDPOINTS = {
  // Health check
  STATUS: '/status',

  // Auth Endpoints
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_ME: '/auth/me',
  AUTH_NFC_LINK: '/auth/nfc/link',
  AUTH_NFC_UNLINK: '/auth/nfc/unlink',
  AUTH_NFC_STATUS: '/auth/nfc/status',

  // QR Login Endpoints
  AUTH_QR_SESSION: '/auth/qr/session',
  AUTH_QR_STATUS: '/auth/qr/status', // append /:id
  AUTH_QR_INFO: '/auth/qr/info', // append /:id
  AUTH_QR_AUTHORIZE: '/auth/qr/authorize',

  // Product Endpoints
  PRODUCTS: '/products',
  PRODUCTS_CATEGORIES: '/products/categories',
  PRODUCTS_BARCODE: '/products/barcode', // append /:code
  PRODUCT: '/products', // append /:id

  // Cart Endpoints
  CART: '/cart',
  CART_SYNC: '/cart/sync',
  CART_ITEM: '/cart', // append /:productId

  // Checkout Endpoints
  CHECKOUT: '/checkout',
  PAYMENT_METHODS: '/checkout/payment-methods',
  CHECKOUT_HISTORY: '/checkout/history',
  CHECKOUT_HISTORY_DETAIL: '/checkout/history', // append /:id

  // NFC Endpoints
  NFC: '/nfc',
  NFC_PAYMENT: '/nfc/payment',
  NFC_MARK_PROCESSED: '/nfc/mark-processed',

  // Legacy endpoints (for ESP32 weight sensor)
  WEIGHT: '/weight',
  LOGS: '/logs',
  STATS: '/stats',
  LOG_FILES: '/log-files',
};

/**
 * Helper to build full API URL
 */
export function buildApiUrl(endpoint: string, param?: string): string {
  const base = API_CONFIG.SERVER_URL;
  const path = param ? `${endpoint}/${param}` : endpoint;
  return `${base}${path}`;
}
