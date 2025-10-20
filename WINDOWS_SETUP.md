# 🪟 Windows Setup Guide

Complete setup guide for Windows users.

## 📋 Prerequisites

### Required Software

1. **Node.js v18 or higher**
   - Download: https://nodejs.org/
   - Verify: `node --version` in PowerShell

2. **Arduino IDE**
   - Download: https://www.arduino.cc/en/software
   - Install with default settings

3. **USB Drivers** (if needed)
   - CP2102: https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers
   - CH340: http://www.wch.cn/downloads/CH341SER_ZIP.html

### Optional Software

- **Git for Windows** (includes Git Bash with OpenSSL)
  - Download: https://git-scm.com/download/win
  - Useful for certificate generation

---

## 🚀 Quick Setup (PowerShell)

### Step 1: Find Your PC's IP Address

```powershell
# Open PowerShell and run:
ipconfig

# Look for "IPv4 Address" under your active network adapter
# Example: 192.168.1.100
```

**Write down your IP:** ___________________

### Step 2: Setup Server

```powershell
# Navigate to server directory
cd C:\00-Code\Wanasishop\shoppad-interface\server

# Install dependencies
npm install

# Generate SSL certificates
node generate-certs-simple.js

# Start server
npm start
```

**Expected Output:**
```
🚀 HTTPS Weight Server Started Successfully!
📡 Server: https://localhost:5050
```

**Keep this PowerShell window open!**

### Step 3: Configure Windows Firewall

**Option A: Using PowerShell (Administrator)**

```powershell
# Run PowerShell as Administrator
# Right-click PowerShell → "Run as Administrator"

# Add firewall rule
New-NetFirewallRule -DisplayName "ShopPad Server" -Direction Inbound -LocalPort 5050 -Protocol TCP -Action Allow
```

**Option B: Using GUI**

1. Open **Windows Defender Firewall**
   - Press `Win + R`
   - Type: `wf.msc`
   - Press Enter

2. Click **Inbound Rules** → **New Rule**

3. Select **Port** → Next

4. Select **TCP** and enter port **5050** → Next

5. Select **Allow the connection** → Next

6. Check all profiles (Domain, Private, Public) → Next

7. Name: **ShopPad Server** → Finish

### Step 4: Test Server

```powershell
# Open a new PowerShell window
# Test server status
curl.exe -k https://localhost:5050/status

# Expected output:
# {"success":true,"status":"online",...}
```

### Step 5: Configure ESP32/ESP8266

1. **Open Arduino IDE**

2. **Open firmware:**
   - File → Open
   - Navigate to: `C:\00-Code\Wanasishop\shoppad-interface\sketch_oct19a\ESP32-We\ESP32-We.ino`

3. **Update WiFi credentials** (Lines 44-45):
   ```cpp
   const char* WIFI_SSID = "ABC";          // Your WiFi name
   const char* WIFI_PASSWORD = "ahmad123";  // Your WiFi password
   ```

4. **Update server IP** (Line 48):
   ```cpp
   const char* SERVER_HOST = "192.168.1.100";  // Your PC's IP from Step 1
   ```

5. **Save** (Ctrl+S)

### Step 6: Install Arduino Libraries

1. **Sketch** → **Include Library** → **Manage Libraries**

2. Install:
   - Search: **HX711** → Install "HX711 by Bogdan Necula"
   - Search: **ArduinoJson** → Install "ArduinoJson by Benoit Blanchon" (v6.x)

### Step 7: Upload to ESP32/ESP8266

1. **Connect ESP32/ESP8266** via USB

2. **Select Board:**
   - Tools → Board → ESP32 Dev Module (or your board)

3. **Select Port:**
   - Tools → Port → COM3 (or your COM port)

4. **Upload:**
   - Click Upload (→) or Ctrl+U

5. **Open Serial Monitor:**
   - Tools → Serial Monitor
   - Set baud rate: **115200**

### Step 8: Verify

**In Serial Monitor, you should see:**
```
✅ WiFi connected successfully!
✅ Connected to server
✅ Data sent successfully!
```

**In server PowerShell window, you should see:**
```
[INFO] Weight data received { weight: 12.34, ... }
```

---

## 🧪 Testing

### Run Automated Tests

```powershell
# In server directory
npm test
```

**Expected Output:**
```
✅ All tests passed!
Passed: 10
Failed: 0
```

### View Weight Data

```powershell
# In server directory
npm run logs
```

---

## 🔧 Troubleshooting

### Issue: "npm is not recognized"

**Solution:**
1. Install Node.js from https://nodejs.org/
2. Restart PowerShell
3. Verify: `node --version`

### Issue: "Port 5050 is already in use"

**Solution:**
```powershell
# Find process using port 5050
netstat -ano | findstr :5050

# Kill the process (replace <PID> with actual PID)
taskkill /PID <PID> /F
```

### Issue: "Cannot connect to COM port"

**Solution:**
1. Check Device Manager (Win + X → Device Manager)
2. Look under "Ports (COM & LPT)"
3. Install USB drivers if needed
4. Try different USB cable/port

### Issue: "Upload failed" in Arduino IDE

**Solution:**
1. Hold BOOT button during upload (some boards)
2. Select correct board type
3. Select correct COM port
4. Reduce upload speed: Tools → Upload Speed → 115200

### Issue: ESP32 cannot connect to WiFi

**Solution:**
1. Verify SSID and password (case-sensitive!)
2. Ensure WiFi is 2.4GHz (ESP8266 requirement)
3. Check WiFi signal strength
4. Restart router if needed

### Issue: ESP32 cannot connect to server

**Solution:**
1. Verify server is running
2. Check IP address is correct
3. Verify firewall rule is active
4. Test with: `curl.exe -k https://<YOUR_IP>:5050/status`

---

## 📊 Useful PowerShell Commands

### Server Management

```powershell
# Start server
cd C:\00-Code\Wanasishop\shoppad-interface\server
npm start

# Run tests
npm test

# View logs
npm run logs

# Clean old logs
npm run clean-logs

# Regenerate certificates
node generate-certs-simple.js
```

### Network Diagnostics

```powershell
# Find your IP address
ipconfig

# Test server connectivity
curl.exe -k https://localhost:5050/status

# Check if port is open
netstat -ano | findstr :5050

# Test from another device on same network
curl.exe -k https://<YOUR_IP>:5050/status
```

### Firewall Management

```powershell
# List firewall rules (Administrator)
Get-NetFirewallRule -DisplayName "ShopPad*"

# Remove firewall rule (Administrator)
Remove-NetFirewallRule -DisplayName "ShopPad Server"

# Add firewall rule (Administrator)
New-NetFirewallRule -DisplayName "ShopPad Server" -Direction Inbound -LocalPort 5050 -Protocol TCP -Action Allow
```

---

## 🔄 Starting Server on Boot (Optional)

### Using Task Scheduler

1. **Open Task Scheduler**
   - Press `Win + R`
   - Type: `taskschd.msc`
   - Press Enter

2. **Create Basic Task**
   - Actions → Create Basic Task
   - Name: "ShopPad Server"
   - Trigger: "When I log on"
   - Action: "Start a program"
   - Program: `C:\Program Files\nodejs\node.exe`
   - Arguments: `server.js`
   - Start in: `C:\00-Code\Wanasishop\shoppad-interface\server`

### Using PM2 (Recommended)

```powershell
# Install PM2 globally
npm install -g pm2

# Navigate to server directory
cd C:\00-Code\Wanasishop\shoppad-interface\server

# Start server with PM2
pm2 start server.js --name shoppad-server

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Follow the instructions shown
```

---

## 📁 File Locations

```
C:\00-Code\Wanasishop\shoppad-interface\
├── server\                    # Server files
│   ├── server.js             # Main server
│   ├── ssl\                  # SSL certificates
│   ├── logs\                 # Server logs
│   └── data\                 # Weight data
│
└── sketch_oct19a\            # ESP32 firmware
    └── ESP32-We\
        └── ESP32-We.ino      # Arduino sketch
```

---

## 🆘 Getting Help

1. **Check Serial Monitor** for ESP32 errors
2. **Check server logs** in PowerShell window
3. **Run tests:** `npm test`
4. **Review documentation:**
   - [README.md](README.md)
   - [QUICKSTART.md](QUICKSTART.md)
   - [sketch_oct19a/ESP32-We/README.md](sketch_oct19a/ESP32-We/README.md)

---

## ✅ Verification Checklist

- [ ] Node.js installed and working
- [ ] Arduino IDE installed
- [ ] USB drivers installed (if needed)
- [ ] Server dependencies installed (`npm install`)
- [ ] SSL certificates generated
- [ ] Firewall rule added for port 5050
- [ ] Server starts without errors
- [ ] Tests pass (`npm test`)
- [ ] ESP32 libraries installed
- [ ] ESP32 firmware configured
- [ ] ESP32 firmware uploaded
- [ ] ESP32 connects to WiFi
- [ ] ESP32 sends data to server
- [ ] Server receives and logs data

---

**Windows Version Tested:** Windows 10/11  
**PowerShell Version:** 5.1+  
**Last Updated:** 2025-10-20

