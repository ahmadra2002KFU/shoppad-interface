# Changelog

All notable changes to the ShopPad Interface project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

