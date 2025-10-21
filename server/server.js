import https from 'https';
import http from 'http';
import fs from 'fs';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import config from './config.js';
import Logger from './logger.js';

/**
 * Production-ready HTTPS/HTTP server for ESP32/ESP8266 weight data
 * Port: Configurable (default 5050 for local, dynamic for cloud)
 * Protocol: HTTPS (local with self-signed) or HTTP (cloud with SSL termination)
 * Data format: JSON with raw weight values
 */

// Initialize logger
const logger = new Logger(config);

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow for development
}));

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (config.cors.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/weight', limiter);

// Request logging
app.use(morgan(config.logging.format, {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Validate weight data
 */
function validateWeightData(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid data format' };
  }

  if (typeof data.weight !== 'number') {
    return { valid: false, error: 'Weight must be a number' };
  }

  if (isNaN(data.weight)) {
    return { valid: false, error: 'Weight is NaN' };
  }

  if (data.weight < config.validation.minWeight || data.weight > config.validation.maxWeight) {
    return { valid: false, error: `Weight out of range (${config.validation.minWeight}-${config.validation.maxWeight} kg)` };
  }

  return { valid: true };
}

/**
 * Routes
 */

// Health check endpoint
app.get('/status', (req, res) => {
  const stats = logger.getStats();
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.server.env,
    stats,
  });
});

// Receive weight data from ESP32
app.post('/weight', (req, res) => {
  try {
    const weightData = req.body;
    
    logger.debug('Received weight data', weightData);

    // Validate data
    const validation = validateWeightData(weightData);
    if (!validation.valid) {
      logger.warn('Invalid weight data received', { error: validation.error, data: weightData });
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    // Round to configured precision
    const roundedWeight = parseFloat(weightData.weight.toFixed(config.validation.precision));

    // Save to persistent storage
    const saved = logger.saveWeightData({
      weight: roundedWeight,
      deviceId: weightData.deviceId || req.ip,
    });

    if (!saved) {
      return res.status(500).json({
        success: false,
        error: 'Failed to save data',
      });
    }

    logger.info('Weight data saved successfully', { weight: roundedWeight });

    res.json({
      success: true,
      message: 'Weight data received',
      weight: roundedWeight,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Error processing weight data', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Store NFC events in memory (for real-time polling)
let nfcEvents = [];
const MAX_NFC_EVENTS = 100;

// Receive NFC detection event from ESP32
app.post('/nfc', (req, res) => {
  try {
    const nfcData = req.body;

    logger.debug('Received NFC event', nfcData);

    // Validate NFC data
    if (!nfcData || typeof nfcData !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid NFC data format',
      });
    }

    if (!nfcData.nfc_uid || typeof nfcData.nfc_uid !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'NFC UID is required',
      });
    }

    // Create NFC event
    const nfcEvent = {
      uid: nfcData.nfc_uid,
      event: nfcData.event || 'nfc_detected',
      timestamp: new Date().toISOString(),
      deviceId: req.ip,
      processed: false,
    };

    // Add to events array
    nfcEvents.push(nfcEvent);

    // Keep only the most recent events
    if (nfcEvents.length > MAX_NFC_EVENTS) {
      nfcEvents = nfcEvents.slice(-MAX_NFC_EVENTS);
    }

    logger.info('NFC event received', { uid: nfcEvent.uid, event: nfcEvent.event });

    res.json({
      success: true,
      message: 'NFC event received',
      uid: nfcEvent.uid,
      timestamp: nfcEvent.timestamp,
    });

  } catch (error) {
    logger.error('Error processing NFC event', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get recent NFC events (for frontend polling)
app.get('/nfc', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const unprocessedOnly = req.query.unprocessed === 'true';

    let events = nfcEvents;

    // Filter unprocessed events if requested
    if (unprocessedOnly) {
      events = events.filter(event => !event.processed);
    }

    // Get most recent events
    const recentEvents = events.slice(-limit);

    res.json({
      success: true,
      count: recentEvents.length,
      data: recentEvents,
    });
  } catch (error) {
    logger.error('Error retrieving NFC events', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve NFC events',
    });
  }
});

// Mark NFC event as processed
app.post('/nfc/mark-processed', (req, res) => {
  try {
    const { uid, timestamp } = req.body;

    if (!uid || !timestamp) {
      return res.status(400).json({
        success: false,
        error: 'UID and timestamp are required',
      });
    }

    // Find and mark the event as processed
    const event = nfcEvents.find(e => e.uid === uid && e.timestamp === timestamp);

    if (event) {
      event.processed = true;
      logger.info('NFC event marked as processed', { uid, timestamp });

      res.json({
        success: true,
        message: 'Event marked as processed',
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }
  } catch (error) {
    logger.error('Error marking NFC event as processed', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get recent weight readings
app.get('/logs', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const data = logger.getRecentData(limit);
    
    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    logger.error('Error retrieving logs', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve logs',
    });
  }
});

// Get statistics
app.get('/stats', (req, res) => {
  try {
    const stats = logger.getStats();
    
    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    logger.error('Error calculating stats', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to calculate statistics',
    });
  }
});

// Get log files list
app.get('/log-files', (req, res) => {
  try {
    const files = logger.getLogFiles();
    
    res.json({
      success: true,
      files,
    });
  } catch (error) {
    logger.error('Error listing log files', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to list log files',
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    error: config.server.env === 'production' ? 'Internal server error' : err.message,
  });
});

/**
 * Start HTTPS/HTTP server
 * Uses HTTPS for local development, HTTP for cloud deployment (SSL termination by platform)
 */
function startServer() {
  try {
    let server;
    const useHTTPS = process.env.USE_HTTPS !== 'false' && config.server.env === 'development';

    if (useHTTPS) {
      // Local development with HTTPS
      // Check if SSL certificates exist
      if (!fs.existsSync(config.ssl.keyPath) || !fs.existsSync(config.ssl.certPath)) {
        console.error('\n❌ SSL certificates not found!');
        console.error('   Key:  ', config.ssl.keyPath);
        console.error('   Cert: ', config.ssl.certPath);
        console.error('\n📝 Run: npm run generate-certs\n');
        process.exit(1);
      }

      // Load SSL certificates
      const httpsOptions = {
        key: fs.readFileSync(config.ssl.keyPath),
        cert: fs.readFileSync(config.ssl.certPath),
      };

      // Create HTTPS server
      server = https.createServer(httpsOptions, app);
    } else {
      // Production/Cloud with HTTP (SSL termination handled by platform)
      server = http.createServer(app);
    }

    // Start listening
    server.listen(config.server.port, config.server.host, () => {
      const protocol = useHTTPS ? 'https' : 'http';
      const sslStatus = useHTTPS ? 'Enabled (Self-signed)' : 'Disabled (Platform SSL termination)';

      console.log(`\n🚀 ${useHTTPS ? 'HTTPS' : 'HTTP'} Weight Server Started Successfully!\n`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📡 Server:        ${protocol}://localhost:${config.server.port}`);
      console.log(`🌍 Network:       ${protocol}://<YOUR_IP>:${config.server.port}`);
      console.log(`🔒 SSL:           ${sslStatus}`);
      console.log(`📊 Environment:   ${config.server.env}`);
      console.log(`📁 Logs:          ${config.logging.directory}`);
      console.log(`💾 Data:          ${config.data.file}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n📋 Available Endpoints:');
      console.log(`   POST   /weight              - Receive weight data from ESP32`);
      console.log(`   POST   /nfc                 - Receive NFC detection event from ESP32`);
      console.log(`   GET    /nfc                 - Get recent NFC events`);
      console.log(`   POST   /nfc/mark-processed  - Mark NFC event as processed`);
      console.log(`   GET    /status              - Server health check`);
      console.log(`   GET    /logs                - Get recent weight readings`);
      console.log(`   GET    /stats               - Get statistics`);
      console.log(`   GET    /log-files           - List log files`);
      console.log('\n💡 ESP32 Configuration:');
      console.log(`   Server URL: ${process.env.RENDER_EXTERNAL_URL || '<YOUR_PC_IP or RENDER_URL>'}`);
      console.log(`   Port: ${useHTTPS ? config.server.port : '443 (HTTPS)'}`);
      console.log(`   Weight Endpoint: /weight (POST)`);
      console.log(`   Weight Payload: {"weight": <number>}`);
      console.log(`   NFC Endpoint: /nfc (POST)`);
      console.log(`   NFC Payload: {"nfc_uid": "<uid>", "event": "nfc_detected"}`);
      console.log('\n⌨️  Press Ctrl+C to stop the server\n');

      logger.info('Server started', {
        port: config.server.port,
        env: config.server.env,
        protocol: protocol,
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('\n❌ Failed to start server:', error.message);
    logger.error('Server startup failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// Start the server
startServer();

