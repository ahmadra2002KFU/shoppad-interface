/**
 * API Configuration for ESP32 Weight Sensor Integration
 */

// Server configuration
export const API_CONFIG = {
  // HTTPS server URL (change to your server's IP if accessing from another device)
  SERVER_URL: import.meta.env.VITE_SERVER_URL || 'https://localhost:5050',
  
  // Polling interval in milliseconds (how often to fetch weight data)
  POLL_INTERVAL: 100, // 0.1 seconds (100ms) for near real-time updates

  // Request timeout in milliseconds
  TIMEOUT: 2000, // 2 seconds (reduced for faster failure detection)
  
  // Enable/disable weight sensor integration
  ENABLED: true,
};

// API Endpoints
export const API_ENDPOINTS = {
  WEIGHT: '/weight',
  STATUS: '/status',
  LOGS: '/logs',
  STATS: '/stats',
  LOG_FILES: '/log-files',
};

/**
 * Note: When accessing HTTPS server with self-signed certificates from the browser,
 * you may need to:
 * 
 * 1. Visit https://localhost:5050/status in your browser first
 * 2. Accept the security warning for the self-signed certificate
 * 3. Then the React app will be able to make requests
 * 
 * For production, use proper CA-signed SSL certificates.
 */

