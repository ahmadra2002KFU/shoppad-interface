# 🚀 RFID RC522 NFC Payment Deployment Guide

Step-by-step deployment guide for the RFID RC522 NFC payment trigger feature.

---

## 📋 Pre-Deployment Checklist

### Hardware
- [ ] RFID RC522 module purchased and tested
- [ ] ESP32 microcontroller available
- [ ] Proper wiring completed and verified
- [ ] Power supply stable (3.3V)
- [ ] NFC cards/tags available for testing

### Software
- [ ] ESP32 firmware updated to v1.6.0
- [ ] MFRC522 library installed in Arduino IDE
- [ ] Backend server updated with NFC endpoints
- [ ] Frontend updated with NFC components
- [ ] All tests passed (see RFID_TESTING_GUIDE.md)

### Environment
- [ ] Development environment tested
- [ ] Staging environment ready (if applicable)
- [ ] Production server accessible
- [ ] SSL certificates valid
- [ ] Firewall rules configured

---

## 🔧 Deployment Steps

### Step 1: Update ESP32 Firmware

**1.1 Install MFRC522 Library**
```bash
# Open Arduino IDE
# Go to: Sketch → Include Library → Manage Libraries
# Search: "MFRC522"
# Install: MFRC522 by GithubCommunity (v1.4.10+)
```

**1.2 Configure WiFi and Server**
```cpp
// In ESP32-We.ino, update these values:
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* SERVER_HOST = "YOUR_SERVER_IP";  // e.g., "192.168.1.100"
const int SERVER_PORT = 5050;
```

**1.3 Verify Pin Configuration**
```cpp
// Default pins (should work for most ESP32 boards):
const int RFID_SS_PIN = 5;     // SDA/SS pin
const int RFID_RST_PIN = 27;   // RST pin
const int RFID_VCC_PIN = 33;   // Power supply pin (3.3V output)
// SPI pins (default):
// MOSI = GPIO 23
// MISO = GPIO 19
// SCK = GPIO 18
```

**Important:** GPIO 33 is configured as a power supply pin for the RFID module. It is set to OUTPUT mode and HIGH (3.3V) during setup. This provides a dedicated 3.3V power source for boards with limited power pins.

**1.4 Upload Firmware**
```bash
# 1. Connect ESP32 via USB
# 2. Select board: Tools → Board → ESP32 Dev Module
# 3. Select port: Tools → Port → (your COM port)
# 4. Click Upload button
# 5. Wait for "Done uploading" message
```

**1.5 Verify Upload**
```bash
# Open Serial Monitor (115200 baud)
# Look for:
✅ RFID RC522 initialized successfully
✅ WiFi connected successfully!
✅ Setup complete!
```

---

### Step 2: Deploy Backend Server

**2.1 Update Server Code**
```bash
# Navigate to server directory
cd server

# Pull latest changes (if using Git)
git pull origin main

# Install dependencies (if needed)
npm install
```

**2.2 Verify NFC Endpoints**
```bash
# Check server.js for these endpoints:
# POST /nfc
# GET /nfc
# POST /nfc/mark-processed
```

**2.3 Start Server**

**Development:**
```bash
npm run dev
```

**Production:**
```bash
# Using PM2
pm2 start server.js --name shoppad-server
pm2 save
pm2 startup
```

**2.4 Verify Server**
```bash
# Check server logs
✅ POST   /nfc                 - Receive NFC detection event from ESP32
✅ GET    /nfc                 - Get recent NFC events
✅ POST   /nfc/mark-processed  - Mark NFC event as processed
```

---

### Step 3: Deploy Frontend

**3.1 Update Frontend Code**
```bash
# Navigate to project root
cd /path/to/shoppad-interface

# Pull latest changes (if using Git)
git pull origin main

# Install dependencies
npm install
```

**3.2 Build for Production**
```bash
# Build optimized production bundle
npm run build

# Output will be in 'dist' folder
```

**3.3 Deploy to Server**

**Option A: Static Hosting (Vercel, Netlify, etc.)**
```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod
```

**Option B: Self-Hosted**
```bash
# Copy dist folder to web server
scp -r dist/* user@server:/var/www/shoppad/

# Or use rsync
rsync -avz dist/ user@server:/var/www/shoppad/
```

**3.4 Configure Server URL**
```bash
# Update .env or environment variables
VITE_SERVER_URL=https://your-server-ip:5050
```

---

### Step 4: Hardware Installation

**4.1 Mount RFID Reader**
- Choose accessible location for customers
- Ensure stable mounting (avoid vibrations)
- Position at comfortable height (waist level)
- Protect from physical damage

**4.2 Cable Management**
- Use cable ties to organize wires
- Protect cables from damage
- Ensure proper strain relief
- Label cables for maintenance

**4.3 Power Supply**
- GPIO 33 is configured as 3.3V power output for RFID module
- Verify GPIO 33 outputs 3.3V with multimeter before connecting RFID
- Add capacitors if needed (100µF recommended between VCC and GND)
- Verify voltage stability with multimeter
- Test under load (RFID module draws 13-26mA typically)
- Ensure GPIO 33 connection is secure and stable

**4.4 Signage**
- Add "Tap Here to Pay" sign
- Include NFC logo/icon
- Provide instructions in multiple languages
- Make it visible and clear

---

### Step 5: Testing in Production

**5.1 Smoke Tests**
```bash
# Test 1: NFC Detection
- Place NFC card near reader
- Verify detection in Serial Monitor
- Check server logs for event

# Test 2: Checkout Flow
- Add items to cart
- Tap NFC card
- Confirm checkout dialog appears
- Complete payment flow

# Test 3: Error Handling
- Test with empty cart
- Test with weak WiFi
- Test with server offline
```

**5.2 Performance Tests**
```bash
# Measure response times:
- Card tap to detection: < 500ms
- Detection to server: < 500ms
- Server to frontend: < 1000ms
- Total: < 2 seconds
```

**5.3 Load Tests**
```bash
# Test multiple rapid taps
# Test continuous operation (1 hour+)
# Monitor memory usage
# Check for memory leaks
```

---

### Step 6: Monitoring Setup

**6.1 ESP32 Monitoring**
```bash
# Set up remote logging (optional)
# Monitor via Serial over WiFi
# Set up alerts for errors
```

**6.2 Server Monitoring**
```bash
# PM2 monitoring
pm2 monit

# Check logs
pm2 logs shoppad-server

# Set up alerts
pm2 install pm2-logrotate
```

**6.3 Frontend Monitoring**
```bash
# Set up error tracking (e.g., Sentry)
# Monitor API response times
# Track user interactions
```

---

## 🔍 Post-Deployment Verification

### Verification Checklist
- [ ] ESP32 connects to WiFi successfully
- [ ] RFID module detects NFC cards
- [ ] NFC events sent to server
- [ ] Server receives and stores events
- [ ] Frontend polls for events
- [ ] Checkout dialog appears correctly
- [ ] Payment flow works (Yes/No)
- [ ] Success/failure dialogs display
- [ ] Cart clears on success
- [ ] Multi-language support works
- [ ] Performance meets requirements
- [ ] No errors in logs

---

## 🚨 Rollback Procedure

If issues occur after deployment:

**1. Immediate Actions**
```bash
# Stop new deployments
# Assess impact
# Notify team
```

**2. Rollback Frontend**
```bash
# Revert to previous version
git checkout <previous-commit>
npm run build
# Redeploy
```

**3. Rollback Backend**
```bash
# Stop current server
pm2 stop shoppad-server

# Revert code
git checkout <previous-commit>

# Restart server
pm2 restart shoppad-server
```

**4. Rollback ESP32**
```bash
# Upload previous firmware version
# Verify functionality
# Monitor for issues
```

---

## 📊 Monitoring Metrics

### Key Metrics to Track
- **NFC Detection Rate** - % of successful detections
- **Response Time** - Average time from tap to dialog
- **Success Rate** - % of successful checkouts
- **Error Rate** - % of failed operations
- **Uptime** - System availability %

### Alert Thresholds
- Detection rate < 95% → Warning
- Response time > 3s → Warning
- Error rate > 5% → Critical
- Uptime < 99% → Critical

---

## 🔧 Maintenance

### Daily
- [ ] Check server logs for errors
- [ ] Verify NFC detection working
- [ ] Monitor response times

### Weekly
- [ ] Review error logs
- [ ] Check hardware connections
- [ ] Clean RFID reader surface
- [ ] Verify WiFi signal strength

### Monthly
- [ ] Update firmware if needed
- [ ] Review performance metrics
- [ ] Test backup procedures
- [ ] Update documentation

---

## 📞 Support

### Common Issues

**Issue:** NFC not detected
**Solution:**
1. Check RFID module wiring
2. Verify GPIO 33 is outputting 3.3V (use multimeter)
3. Ensure GPIO 33 is connected to RFID VCC pin
4. Check that GPIO 33 is set to HIGH in firmware
5. Clean reader surface
6. Test with different cards

**Issue:** Slow response time
**Solution:**
1. Check WiFi signal strength
2. Verify server performance
3. Reduce polling interval
4. Optimize network

**Issue:** Checkout dialog not appearing
**Solution:**
1. Check browser console
2. Verify API endpoints
3. Check server logs
4. Test with different browser

---

## 📚 Additional Resources

- [RFID_INTEGRATION.md](RFID_INTEGRATION.md) - Integration guide
- [RFID_TESTING_GUIDE.md](RFID_TESTING_GUIDE.md) - Testing procedures
- [CHANGELOG.md](CHANGELOG.md) - Version history
- [README.md](README.md) - Project overview

---

**Version:** 1.6.0  
**Last Updated:** 2025-10-21  
**Author:** ShopPad Team

