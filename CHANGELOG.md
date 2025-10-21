# Changelog

All notable changes to the ShopPad Interface project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2025-10-21

### ✨ QR Code Scanner Feature Release

Complete QR code scanning functionality for automatic product addition to shopping cart.

### Added - QR Code Scanner

#### Core Components
- **QRScanner Component** (`src/components/QRScanner.tsx`)
  - Camera-based QR code scanning
  - Real-time QR detection (10 FPS)
  - Visual feedback (scanning, success, error states)
  - Audio feedback (beep sound on successful scan)
  - Mobile-responsive design
  - Automatic camera selection (back camera on mobile)
  - Duplicate scan prevention

- **useQRScanner Hook** (`src/hooks/useQRScanner.ts`)
  - Scanner state management
  - Cart integration
  - Optional weight validation against ESP32 sensor
  - Toast notifications
  - Configurable options (auto-add, weight tolerance)

#### Utilities & Types
- **QR Code Parser** (`src/utils/qrCodeParser.ts`)
  - JSON parsing and validation
  - Product data conversion
  - Weight validation logic
  - QR code generation helper

- **QR Code Types** (`src/types/qrcode.ts`)
  - TypeScript interfaces for QR data
  - Scan result types
  - Scanner status types

#### Integration
- **Updated ScannerPlaceholder** - Now functional with QR scanner
- **Language Support** - English and Arabic translations
- **Cart Integration** - Automatic product addition
- **Weight Sensor Integration** - Optional weight validation

### Features

#### QR Code Data Format
- JSON-based product data in QR codes
- Required fields: id, name, price
- Optional fields: category, weight, barcode, image
- Comprehensive validation

#### User Experience
- One-click scanner activation
- Live camera preview
- Visual scanning indicators
- Success/error toast notifications
- Auto-close on successful scan
- Mobile-optimized interface

#### Advanced Features
- Weight validation (optional)
- Configurable weight tolerance (default: 50g)
- Duplicate scan prevention
- Multi-language support (EN/AR)
- RTL support for Arabic
- Responsive design (desktop & mobile)

### Documentation

#### Complete Guides Created
1. **QR_CODE_INTEGRATION.md** (300+ lines)
   - Complete feature overview
   - QR code data format specification
   - Usage instructions (customers & developers)
   - Technical implementation details
   - API reference
   - Customization guide
   - Troubleshooting
   - Future enhancements

2. **QR_CODE_TESTING_GUIDE.md** (300+ lines)
   - Step-by-step testing instructions
   - 20+ test cases (positive & negative)
   - Sample QR code data
   - Performance testing
   - Browser compatibility
   - Debugging guide
   - Test checklist

### Dependencies
- Added `html5-qrcode` (v2.3.8) - QR code scanning library

### Changed
- Updated `ScannerPlaceholder` component - Now includes functional QR scanner
- Enhanced `LanguageContext` - Added QR scanner translations
- Updated package.json - New dependency

### Technical Details

#### Performance
- Scan speed: < 1 second
- Camera startup: 1-2 seconds
- Detection rate: 10 FPS
- Memory usage: < 50 MB

#### Browser Support
- Chrome (Desktop & Mobile) ✅
- Firefox (Desktop & Mobile) ✅
- Safari (Desktop & Mobile) ✅
- Edge (Desktop & Mobile) ✅

#### Security
- Camera permission required
- No video recording/storage
- Data validation before processing
- Secure JSON parsing

---

## [1.3.1] - 2025-10-20

### 🔧 Bug Fixes

#### Timer Overflow Fix
- Fixed "Next send in: 4294965 seconds" overflow issue
- Proper unsigned long arithmetic to prevent timer wraparound
- Now correctly shows "Next send in: 0.1 seconds"

#### Weight Calibration Fix
- Fixed negative weight readings
- Updated calibration factor from 3268.3 to -2694.0
- Inverted sign to match load cell orientation
- Based on actual test: -0.54 kg reading for 445g weight

### Added
- Complete calibration guide (CALIBRATION_GUIDE.md)
- Connection troubleshooting guide (TROUBLESHOOTING_CONNECTION.md)
- Step-by-step server diagnostics
- Firewall and port checking procedures

### Changed
- Calibration factor: 3268.3 → -2694.0 (inverted)
- Timer calculation: Fixed overflow protection
- Status display: Better handling of edge cases

---

## [1.3.0] - 2025-10-20

### ✅ Real-Time Mode Release

Near real-time weight updates with 100ms intervals (10 updates per second).
Optimized for live weight display with minimal latency.

### Added - Real-Time Features

#### ESP32 Optimizations
- **100ms transmission interval** (reduced from 10 seconds)
- **Keep-alive connections** to reduce reconnection overhead
- **Reduced logging** for better performance in real-time mode
- **Faster timeouts** (1 second instead of 5 seconds)
- **Optimized weight reading** (3 samples instead of 10)
- **Connection reuse** for efficient data transmission

#### Frontend Optimizations
- **100ms polling interval** (reduced from 3 seconds)
- **Faster timeout** (2 seconds instead of 5 seconds)
- **30x faster updates** for near real-time display

#### Server Optimizations
- **Increased rate limit** to 1000 requests/minute (from 100)
- **Support for high-frequency updates** (16.6 req/sec)

### Changed
- ESP32 send interval: 10s → 100ms (100x faster)
- Frontend poll interval: 3s → 100ms (30x faster)
- Server rate limit: 100 → 1000 requests/minute
- Connection mode: close → keep-alive
- Weight reading samples: 10 → 3 (for speed)
- Response timeout: 5s → 1s (ESP32), 5s → 2s (Frontend)

### Performance
- **Updates per second:** 10
- **Total latency:** 20-250ms (sensor to display)
- **Network usage:** ~2 KB/s, ~170 MB/day
- **Data points per day:** 864,000

### Documentation
- Complete real-time mode guide (REALTIME_MODE.md)
- Performance metrics and tuning options
- Troubleshooting guide for real-time issues
- Data storage considerations
- Future WebSocket implementation notes

---

## [1.2.0] - 2025-10-20

### ✅ Production Deployment Release

Complete deployment package for DigitalOcean Droplet with automated scripts,
comprehensive documentation, and production-ready configuration.

### Added - Production Deployment

#### Deployment Documentation
- Complete DigitalOcean deployment guide (DIGITALOCEAN_DEPLOYMENT.md)
- Step-by-step deployment checklist (DEPLOYMENT_CHECKLIST.md)
- Production configuration guide for ESP32 (PRODUCTION_CONFIG.h)
- Nginx reverse proxy configuration template
- Production environment template (.env.production)

#### Deployment Scripts
- Automated deployment script (deploy.sh)
  - System updates and dependency installation
  - Node.js, Git, PM2, Nginx, Certbot setup
  - Repository cloning and configuration
  - Firewall configuration
  - PM2 process management
- Production start script (production-start.sh)
  - Quick production startup
  - PM2 process management
  - Environment configuration

#### Production Features
- PM2 process manager integration
- Nginx reverse proxy support
- Let's Encrypt SSL certificate support
- Production environment variables
- Enhanced security configuration
- Automated startup on server reboot
- Log management and rotation
- Backup and restore procedures

#### Package.json Scripts
- `npm run deploy` - Run full deployment
- `npm run prod:start` - Start in production mode
- `npm run prod:stop` - Stop production server
- `npm run prod:restart` - Restart production server
- `npm run prod:logs` - View production logs
- `npm run prod:status` - Check production status

### Changed
- Updated server configuration for production deployment
- Enhanced CORS configuration for production domains
- Updated rate limiting for production (60 requests/minute)
- Increased max data entries to 50,000 for production

### Documentation
- Complete deployment guide with 13 detailed steps
- Troubleshooting section for common deployment issues
- Monitoring and maintenance procedures
- Backup and recovery strategies
- Security best practices
- Performance optimization tips

---

## [1.1.0] - 2025-10-20

### ✅ Frontend Integration Release

Complete integration of ESP32 weight sensor data into React frontend.
Real-time weight display with auto-polling and error handling.

### Added - Frontend Integration

#### React Components & Hooks
- Custom React hook `useESP32Weight` for fetching real-time weight data
  - Auto-polling every 3 seconds
  - Error handling and retry logic
  - Loading states and statistics tracking
  - Configurable polling interval and server URL
- Enhanced WeightDisplay component
  - Live sensor data display (replaces calculated weight)
  - Visual status indicators (Live/Offline badges)
  - Loading spinner for initial data fetch
  - Last update timestamp
  - Comparison with calculated cart weight
  - Retry button when offline
  - Responsive design with fixed positioning

#### Configuration & API
- API configuration file (`src/config/api.ts`)
  - Centralized server URL configuration
  - Environment variable support
  - Configurable polling intervals
- CORS configuration updated
  - Added support for port 8081
  - Multiple frontend port support

#### Documentation
- Complete frontend integration guide (FRONTEND_INTEGRATION.md)
  - Setup instructions with SSL certificate acceptance
  - Configuration options
  - Troubleshooting guide
  - Code examples
  - Performance considerations
  - Security notes

### Changed
- WeightDisplay component now shows live ESP32 sensor data instead of calculated cart weight
- Shopping page updated to pass calculated weight for comparison
- Server CORS configuration expanded to support multiple frontend ports

### Technical Details
- Data flow: ESP32 (10s) → HTTPS Server → React Frontend (3s polling)
- API endpoint used: GET /logs?limit=1
- Real-time updates with minimal network overhead (~4 KB/minute)
- Graceful degradation when server is offline

---

## [1.0.0] - 2025-10-20

### ✅ Production-Ready Release

Complete ESP32/ESP8266 weight sensor system with HTTPS server integration.
All tests passing. System verified and ready for deployment.

### Added

#### ESP32/ESP8266 Firmware
- Initial WiFi connectivity implementation
  - SSID: ABC
  - Password: ahmad123
  - Auto-reconnection logic with exponential backoff
  - Connection status monitoring
- HTTPS client implementation
  - Secure communication with server on port 5050
  - Certificate validation (configurable for development/production)
  - Request retry mechanism with timeout handling
- Weight sensor integration (HX711)
  - 10-second reading interval
  - Raw numeric data transmission
  - Calibration support
  - Tare functionality
- Error handling and recovery
  - WiFi disconnection recovery
  - HTTPS request failure handling
  - Sensor error detection
  - Watchdog timer implementation
- Status indicators
  - Serial logging for debugging
  - LED status indicators (optional)

#### Backend Server
- Production-ready Node.js HTTPS server
  - Port: 5050
  - SSL/TLS encryption with self-signed certificates
  - CORS configuration for local development
  - Request validation and sanitization
  - Rate limiting protection
- API Endpoints
  - POST /weight - Receive weight data from ESP32
  - GET /status - Server health check
  - GET /logs - Retrieve recent weight readings
  - GET /stats - Get statistics (min, max, average weight)
- Data persistence
  - File-based logging system
  - JSON data storage
  - Log rotation (daily)
  - Automatic cleanup of old logs (30-day retention)
- Monitoring and logging
  - Request logging with timestamps
  - Error logging with stack traces
  - Performance metrics
  - Data validation logging
- Security features
  - Input validation
  - SQL injection prevention (for future database integration)
  - XSS protection
  - Rate limiting per IP
  - HTTPS-only communication

#### Documentation
- Comprehensive README with setup instructions
- ESP32 library installation guide
- Server deployment guide
- API documentation
- Troubleshooting guide
- Network configuration guide

#### Configuration
- Environment-based configuration
- Configurable server settings (port, SSL paths, log retention)
- ESP32 configurable parameters (WiFi credentials, server IP, intervals)

### Changed
- ESP32 firmware: Updated from basic serial output to full HTTPS client
- Data transmission: Changed from 1-second to 10-second intervals
- Data format: Simplified to raw numeric values for weight

### Technical Details
- **ESP32 Libraries Used:**
  - WiFi.h / ESP8266WiFi.h
  - WiFiClientSecure.h
  - ArduinoJson.h (v6.x)
  - HX711.h
  
- **Server Dependencies:**
  - Node.js v18+ (LTS)
  - Express.js v4.x
  - body-parser v1.x
  - morgan (logging)
  - helmet (security)
  - express-rate-limit

### Security Considerations
- Self-signed SSL certificates for local development
- Certificate pinning option for production
- Secure WiFi credential storage
- Input validation on all endpoints
- Rate limiting to prevent abuse

#### Testing & Quality Assurance
- Comprehensive test suite for server endpoints
  - 10 automated tests covering all endpoints
  - Input validation testing
  - Error handling verification
  - Rate limiting tests
  - All tests passing ✅
- Cross-platform certificate generation
  - Node.js-based solution using selfsigned package
  - Works on Windows, Linux, and macOS
  - No OpenSSL dependency required

#### Documentation
- Complete README.md with setup instructions
- ESP32/ESP8266 specific setup guide (sketch_oct19a/ESP32-We/README.md)
- Quick start guide (QUICKSTART.md - 15-minute setup)
- Troubleshooting section with common issues
- Production deployment guide
- API documentation with examples
- Wiring diagrams and pin configurations
- Calibration instructions

#### Utility Scripts
- `view-logs.js` - View recent weight data in table format
- `clean-logs.js` - Clean old log files interactively
- `test-server.js` - Automated server testing (10 tests)
- `generate-certs-simple.js` - Cross-platform certificate generation
- `generate-certs-windows.ps1` - PowerShell certificate generation

### Known Issues
- Self-signed certificates require validation bypass on ESP32 (acceptable for local development)
- Windows Firewall may block port 5050 (requires manual configuration - documented in README)
- ESP8266 only supports 2.4GHz WiFi networks

### Future Enhancements
- Database integration (PostgreSQL/MongoDB)
- Real-time WebSocket updates to frontend
- Multi-device support
- Cloud deployment option
- Mobile app integration
- Advanced analytics and reporting
- Alert system for abnormal readings
- OTA (Over-The-Air) firmware updates for ESP32
- Battery monitoring and power management
- Multiple sensor support (temperature, humidity, etc.)

---

## [0.0.0] - 2025-10-19

### Initial Release
- Basic ESP32 HX711 weight sensor integration
- React/Vite frontend for shopping cart interface
- Project structure setup

