# ShopPad Interface - Smart Shopping Cart System

A complete IoT solution for smart shopping carts with ESP32/ESP8266 weight sensors and real-time data communication.

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [ESP32/ESP8266 Setup](#esp32esp8266-setup)
- [Server Setup](#server-setup)
- [Frontend Setup](#frontend-setup)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)
- [Contributing](#contributing)

---

## 🎯 Overview

ShopPad Interface is a production-ready smart shopping cart system that combines:
- **ESP32/ESP8266** weight sensors with HX711 load cells
- **HTTPS Server** for secure data communication (Port 5050)
- **React Frontend** for shopping cart interface (Port 8080)

The system enables real-time weight monitoring and data transmission from IoT devices to a central server.

---

## 🏗️ System Architecture

```
┌─────────────────┐         HTTPS          ┌──────────────────┐         HTTPS         ┌──────────────────┐
│  ESP32/ESP8266  │ ──────────────────────> │  Node.js Server  │ <──────────────────── │  React Frontend  │
│  Weight Sensor  │    POST /weight         │   (Port 5050)    │    GET /logs          │   (Port 8081)    │
│   (HX711)       │    Every 10s            │                  │    Poll every 3s      │                  │
└─────────────────┘                         └──────────────────┘                       └──────────────────┘
                                                     │
                                                     │ Data Storage
                                                     ▼
                                            ┌──────────────────┐
                                            │  JSON Files      │
                                            │  Log Files       │
                                            └──────────────────┘
```

**Data Flow:**
1. ESP32 reads weight from HX711 sensor every 10 seconds
2. ESP32 sends weight to server via HTTPS POST /weight
3. Server stores data in JSON files and logs
4. React frontend polls GET /logs every 3 seconds
5. Frontend displays real-time weight in shopping cart interface

---

## ✨ Features

### ESP32/ESP8266 Firmware
- ✅ WiFi connectivity with auto-reconnection
- ✅ HTTPS client for secure communication
- ✅ HX711 load cell integration
- ✅ 10-second data transmission interval
- ✅ Raw numeric weight data format
- ✅ Comprehensive error handling
- ✅ Serial monitoring and debugging

### HTTPS Server
- ✅ Production-ready Node.js server
- ✅ SSL/TLS encryption
- ✅ RESTful API endpoints
- ✅ Data persistence (JSON files)
- ✅ Log rotation and retention
- ✅ Rate limiting and security
- ✅ CORS support
- ✅ Request validation

### Frontend
- ✅ React + TypeScript + Vite
- ✅ Modern UI with shadcn-ui
- ✅ Shopping cart functionality
- ✅ **Real-time weight display from ESP32 sensor**
- ✅ **Live sensor data with auto-polling (3s interval)**
- ✅ **Visual status indicators (Live/Offline)**
- ✅ **Comparison with calculated cart weight**
- ✅ Multi-language support (EN/AR)
- ✅ Responsive design

---

## 📦 Prerequisites

### For ESP32/ESP8266 Development
- **Arduino IDE** (v1.8.19 or later) or **PlatformIO**
- **ESP32/ESP8266 Board** (any variant)
- **HX711 Load Cell Amplifier**
- **Load Cell** (weight sensor)
- **USB Cable** for programming

### For Server
- **Node.js** v18+ (LTS recommended)
- **npm** v9+
- **OpenSSL** (for certificate generation)
- **Windows/Linux/macOS**

### For Frontend
- **Node.js** v18+
- **npm** v9+

---

## 🚀 Quick Start

### 1. Clone the Repository


```bash
git clone https://github.com/ahmadra2002KFU/shoppad-interface.git
cd shoppad-interface
```

### 2. Find Your PC's IP Address

**Windows:**
```powershell
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

**Linux/Mac:**
```bash
ifconfig
# or
ip addr show
```

Note your IP address (e.g., `192.168.1.100`) - you'll need this for ESP32 configuration.

---

## 🔧 ESP32/ESP8266 Setup

### Step 1: Install Arduino IDE and Board Support

1. **Download Arduino IDE**: https://www.arduino.cc/en/software
2. **Install ESP32 Board Support:**
   - Open Arduino IDE
   - Go to `File` → `Preferences`
   - Add to "Additional Board Manager URLs":
     ```
     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
     ```
   - Go to `Tools` → `Board` → `Boards Manager`
   - Search for "ESP32" and install "esp32 by Espressif Systems"

3. **For ESP8266:**
   - Add to "Additional Board Manager URLs":
     ```
     http://arduino.esp8266.com/stable/package_esp8266com_index.json
     ```
   - Install "esp8266 by ESP8266 Community"

### Step 2: Install Required Libraries

Open Arduino IDE and go to `Sketch` → `Include Library` → `Manage Libraries`

Install these libraries:
- **HX711** by Bogdan Necula (already included)
- **ArduinoJson** by Benoit Blanchon (v6.x)

### Step 3: Configure the Firmware

1. Open `sketch_oct19a/ESP32-We/ESP32-We.ino` in Arduino IDE

2. **Update WiFi Credentials** (Lines 44-45):
   ```cpp
   const char* WIFI_SSID = "ABC";          // Your WiFi network name
   const char* WIFI_PASSWORD = "ahmad123";  // Your WiFi password
   ```

3. **Update Server IP** (Line 48):
   ```cpp
   const char* SERVER_HOST = "192.168.1.100";  // Your PC's IP address
   ```

4. **Verify Other Settings:**
   ```cpp
   const int SERVER_PORT = 5050;              // Server port (don't change)
   const unsigned long SEND_INTERVAL = 10000; // 10 seconds
   ```

### Step 4: Upload to ESP32/ESP8266

1. Connect your ESP32/ESP8266 via USB
2. Select your board: `Tools` → `Board` → Select your ESP32/ESP8266 model
3. Select the port: `Tools` → `Port` → Select the COM port
4. Click **Upload** button (→)
5. Wait for upload to complete

### Step 5: Monitor Serial Output

1. Open Serial Monitor: `Tools` → `Serial Monitor`
2. Set baud rate to **115200**
3. You should see connection status and weight readings

---

## 🖥️ Server Setup

### Step 1: Install Dependencies

```bash
cd server
npm install
```

### Step 2: Generate SSL Certificates

```bash
npm run generate-certs
```

This creates self-signed SSL certificates in `server/ssl/` directory.

**Note for Windows users:** If OpenSSL is not installed:
- Download from: https://slproweb.com/products/Win32OpenSSL.html
- Or use Git Bash which includes OpenSSL
- Or use WSL (Windows Subsystem for Linux)

### Step 3: Configure Environment (Optional)

Copy `.env.example` to `.env` and customize if needed:

```bash
cp .env.example .env
```

Default configuration works for most cases.

### Step 4: Start the Server

```bash
npm start
```

You should see:
```
🚀 HTTPS Weight Server Started Successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server:        https://localhost:5050
🌍 Network:       https://<YOUR_IP>:5050
🔒 SSL:           Enabled (Self-signed)
```

### Step 5: Configure Windows Firewall

Allow incoming connections on port 5050:

1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Select "TCP" and enter port "5050" → Next
6. Select "Allow the connection" → Next
7. Check all profiles → Next
8. Name it "ShopPad Server" → Finish

---

## 🎨 Frontend Setup

### Step 1: Install Dependencies

```bash
# From project root
npm install
```

### Step 2: Accept SSL Certificate (Required for ESP32 Integration)

**IMPORTANT:** Before the React app can connect to the HTTPS server, you must accept the self-signed certificate:

1. **Start the server** (if not already running):
   ```bash
   cd server
   npm start
   ```

2. **Open your browser** and navigate to: `https://localhost:5050/status`

3. **Accept the security warning:**
   - Chrome/Edge: Click "Advanced" → "Proceed to localhost (unsafe)"
   - Firefox: Click "Advanced" → "Accept the Risk and Continue"

4. **You should see JSON response:**
   ```json
   {"status":"online","timestamp":"..."}
   ```

5. **Keep this tab open** (or the certificate will be forgotten)

### Step 3: Start Development Server

```bash
npm run dev
```

The frontend will be available at: http://localhost:8081

### Step 4: Verify ESP32 Integration

1. Open the shopping cart interface
2. Look at the **bottom-right corner** for the WeightDisplay component
3. You should see:
   - 🟢 Green "Live" badge (connected)
   - Current weight from ESP32 sensor
   - Last update timestamp
   - Cart estimate for comparison

**If you see "Offline" badge:**
- Make sure the server is running
- Verify you accepted the SSL certificate (Step 2)
- Check browser console for errors
- See [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) for detailed troubleshooting

### Configuration

To change the server URL or polling interval, edit `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  SERVER_URL: 'https://localhost:5050', // Change to your server IP
  POLL_INTERVAL: 3000, // Update every 3 seconds
  ENABLED: true,
};
```

Or use environment variable in `.env`:
```env
VITE_SERVER_URL=https://10.232.200.83:5050
```

---

## 📡 API Documentation

### Base URL
```
https://<YOUR_IP>:5050
```

### Endpoints

#### 1. POST /weight
Receive weight data from ESP32

**Request:**
```json
{
  "weight": 12.34
}
```

**Response:**
```json
{
  "success": true,
  "message": "Weight data received",
  "weight": 12.34,
  "timestamp": "2025-10-20T10:30:00.000Z"
}
```

#### 2. GET /status
Server health check

**Response:**
```json
{
  "status": "online",
  "timestamp": "2025-10-20T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "stats": {
    "count": 100,
    "min": 0.5,
    "max": 50.2,
    "average": 15.7,
    "latest": {...}
  }
}
```

#### 3. GET /logs?limit=100
Get recent weight readings

**Response:**
```json
{
  "success": true,
  "count": 100,
  "data": [
    {
      "timestamp": "2025-10-20T10:30:00.000Z",
      "weight": 12.34,
      "deviceId": "192.168.1.50"
    }
  ]
}
```

#### 4. GET /stats
Get statistics

**Response:**
```json
{
  "success": true,
  "stats": {
    "count": 1000,
    "min": 0.5,
    "max": 50.2,
    "average": 15.7,
    "latest": {...}
  }
}
```

---


## 🔍 Troubleshooting

### ESP32/ESP8266 Issues

#### WiFi Connection Failed
- ✅ Verify SSID and password are correct
- ✅ Check if WiFi network is 2.4GHz (ESP8266 doesn't support 5GHz)
- ✅ Ensure ESP32/ESP8266 is within WiFi range
- ✅ Check Serial Monitor for error messages

#### Cannot Connect to Server
- ✅ Verify server is running (`npm start` in server directory)
- ✅ Check SERVER_HOST IP address is correct
- ✅ Ensure ESP32 and PC are on the same network
- ✅ Verify Windows Firewall allows port 5050
- ✅ Test server with: `curl -k https://localhost:5050/status`

#### HX711 Not Ready
- ✅ Check wiring connections (DOUT → GPIO16, SCK → GPIO4)
- ✅ Verify HX711 has power (VCC and GND)
- ✅ Test load cell connections
- ✅ Try different GPIO pins if needed

#### Upload Failed
- ✅ Select correct board type in Arduino IDE
- ✅ Select correct COM port
- ✅ Press BOOT button during upload (some boards)
- ✅ Install USB drivers (CP2102, CH340, etc.)

### Server Issues

#### SSL Certificate Error
```bash
# Regenerate certificates
cd server
npm run generate-certs
```

#### Port 5050 Already in Use
```bash
# Windows: Find and kill process
netstat -ano | findstr :5050
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5050 | xargs kill -9
```

#### Module Not Found
```bash
# Reinstall dependencies
cd server
rm -rf node_modules package-lock.json
npm install
```

### Frontend Issues

#### Weight Display Shows "Offline"

**Cause:** Browser hasn't accepted the SSL certificate or CORS issue

**Solution:**
1. Visit `https://localhost:5050/status` in browser
2. Accept the security warning
3. Refresh the React app
4. Check browser console for CORS errors

#### CORS Error in Console

**Cause:** Server CORS not configured for your frontend URL

**Solution:**
Update `server/config.js`:
```javascript
cors: {
  allowedOrigins: ['http://localhost:8080', 'http://localhost:8081'],
}
```
Restart the server after changes.

#### Weight Shows 0.00 kg

**Possible Causes:**
1. ESP32 not connected to server
2. No weight data sent yet
3. HX711 sensor not calibrated

**Solution:**
1. Check ESP32 Serial Monitor for connection status
2. Check server logs: `npm run logs` (in server directory)
3. Calibrate the HX711 sensor (see ESP32 README)

#### Negative Weight Values

**Cause:** HX711 sensor needs taring (zero calibration)

**Solution:**
1. Remove all weight from the load cell
2. Reset the ESP32
3. The sensor should auto-tare on startup

#### Mixed Content Warning

**Cause:** HTTP frontend trying to access HTTPS backend

**Solution:**
This is expected with self-signed certificates. Accept the certificate manually (see Frontend Setup Step 2).

### Network Issues

#### Find Your PC's IP Address

**Windows PowerShell:**
```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*"} | Select-Object IPAddress, InterfaceAlias
```

**Windows CMD:**
```cmd
ipconfig | findstr IPv4
```

**Linux/Mac:**
```bash
hostname -I
# or
ip addr show | grep "inet " | grep -v 127.0.0.1
```

#### Test Server Connectivity

From ESP32's network:
```bash
# Test if server is reachable
ping <YOUR_PC_IP>

# Test HTTPS endpoint (from another computer on same network)
curl -k https://<YOUR_PC_IP>:5050/status
```

---

## 🚀 Production Deployment

### Server Deployment

#### 1. Use Production SSL Certificates

Replace self-signed certificates with CA-signed certificates:

```bash
# Place your certificates in server/ssl/
server/ssl/key.pem    # Private key
server/ssl/cert.pem   # Certificate
```

#### 2. Set Environment to Production

```bash
# In server/.env
NODE_ENV=production
```

#### 3. Use Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start server with PM2
cd server
pm2 start server.js --name shoppad-server

# Enable auto-start on boot
pm2 startup
pm2 save
```

#### 4. Configure Reverse Proxy (Optional)

Use Nginx or Apache as reverse proxy for better security and performance.

### ESP32 Production Configuration

#### 1. Enable Certificate Validation

Update ESP32 code to use certificate fingerprint:

```cpp
// Get certificate fingerprint from your server
const char* fingerprint = "AA BB CC DD EE FF 00 11 22 33 44 55 66 77 88 99 AA BB CC DD";

// In setup()
client.setFingerprint(fingerprint);
```

#### 2. Add Watchdog Timer

```cpp
#include <esp_task_wdt.h>

void setup() {
  // Enable watchdog (30 seconds)
  esp_task_wdt_init(30, true);
  esp_task_wdt_add(NULL);
}

void loop() {
  // Reset watchdog
  esp_task_wdt_reset();
  // ... rest of code
}
```

---

## 📊 Utility Scripts

### View Recent Weight Data

```bash
cd server
npm run logs

# View last 50 readings
node view-logs.js 50
```

### Clean Old Logs

```bash
cd server
npm run clean-logs
```

### Test Server Endpoints

```bash
# Health check
curl -k https://localhost:5050/status

# Get statistics
curl -k https://localhost:5050/stats

# Get recent logs
curl -k https://localhost:5050/logs?limit=10

# Send test weight data
curl -k -X POST https://localhost:5050/weight \
  -H "Content-Type: application/json" \
  -d '{"weight": 12.34}'
```

---

## 📁 Project Structure

```
shoppad-interface/
├── server/                    # HTTPS Server
│   ├── server.js             # Main server file
│   ├── config.js             # Configuration
│   ├── logger.js             # Logging system
│   ├── generate-certs.js     # SSL certificate generator
│   ├── view-logs.js          # Log viewer utility
│   ├── clean-logs.js         # Log cleanup utility
│   ├── package.json          # Server dependencies
│   ├── .env.example          # Environment template
│   ├── ssl/                  # SSL certificates
│   ├── logs/                 # Server logs
│   └── data/                 # Weight data storage
│
├── sketch_oct19a/            # ESP32/ESP8266 Firmware
│   └── ESP32-We/
│       └── ESP32-We.ino      # Arduino sketch
│
├── src/                      # React Frontend
│   ├── components/           # UI components
│   ├── contexts/             # React contexts
│   ├── pages/                # Page components
│   └── ...
│
├── CHANGELOG.md              # Project changelog
├── README.md                 # This file
└── package.json              # Frontend dependencies
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the [Troubleshooting](#troubleshooting) section
- Review the [CHANGELOG.md](CHANGELOG.md) for recent updates

---

## 🙏 Acknowledgments

- **Lovable.dev** - Initial project scaffolding
- **ESP32/ESP8266 Community** - Board support and libraries
- **Node.js Community** - Server frameworks and tools
- **React Community** - Frontend framework

---

**Made with ❤️ by the ShopPad Team**
