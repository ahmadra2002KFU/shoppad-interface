# 🚀 Quick Start Guide - ShopPad Interface

Get your ESP32/ESP8266 weight sensor system up and running in 15 minutes!

## ⚡ Prerequisites Checklist

Before starting, ensure you have:

- [ ] ESP32 or ESP8266 board
- [ ] HX711 load cell amplifier
- [ ] Load cell (weight sensor)
- [ ] USB cable
- [ ] Arduino IDE installed
- [ ] Node.js v18+ installed
- [ ] WiFi network (2.4GHz for ESP8266)
- [ ] Your PC's IP address

---

## 📝 Step-by-Step Setup

### Step 1: Find Your PC's IP Address (2 minutes)

**Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" - it will look like `192.168.1.100`

**Write it down:** ___________________

---

### Step 2: Setup the Server (5 minutes)

```bash
# 1. Navigate to server directory
cd server

# 2. Install dependencies
npm install

# 3. Generate SSL certificates
npm run generate-certs

# 4. Start the server
npm start
```

✅ **Success Check:** You should see:
```
🚀 HTTPS Weight Server Started Successfully!
📡 Server: https://localhost:5050
```

**Keep this terminal window open!**

---

### Step 3: Configure ESP32/ESP8266 (3 minutes)

1. **Open Arduino IDE**

2. **Open the firmware:**
   - File → Open
   - Navigate to `sketch_oct19a/ESP32-We/ESP32-We.ino`

3. **Update WiFi credentials** (Lines 44-45):
   ```cpp
   const char* WIFI_SSID = "ABC";          // ← Your WiFi name
   const char* WIFI_PASSWORD = "ahmad123";  // ← Your WiFi password
   ```

4. **Update server IP** (Line 48):
   ```cpp
   const char* SERVER_HOST = "192.168.1.100";  // ← Your PC's IP from Step 1
   ```

5. **Save the file** (Ctrl+S)

---

### Step 4: Install Arduino Libraries (2 minutes)

1. Go to `Sketch` → `Include Library` → `Manage Libraries`

2. Install these libraries:
   - Search "**HX711**" → Install "HX711 by Bogdan Necula"
   - Search "**ArduinoJson**" → Install "ArduinoJson by Benoit Blanchon" (v6.x)

---

### Step 5: Upload to ESP32/ESP8266 (3 minutes)

1. **Connect your board** via USB

2. **Select board:**
   - Tools → Board → ESP32 Dev Module (or your ESP32 model)
   - OR: Tools → Board → NodeMCU 1.0 (for ESP8266)

3. **Select port:**
   - Tools → Port → Select your COM port

4. **Upload:**
   - Click Upload button (→) or press Ctrl+U
   - Wait for "Done uploading"

---

### Step 6: Monitor and Test (2 minutes)

1. **Open Serial Monitor:**
   - Tools → Serial Monitor
   - Set baud rate to **115200**

2. **Watch for success messages:**
   ```
   ✅ WiFi connected successfully!
   ✅ Connected to server
   ✅ Data sent successfully!
   ```

3. **Check server terminal:**
   You should see incoming weight data logged!

---

## ✅ Verification Checklist

- [ ] Server is running on port 5050
- [ ] ESP32/ESP8266 connected to WiFi
- [ ] ESP32/ESP8266 sending data every 10 seconds
- [ ] Server receiving and logging data
- [ ] No error messages in Serial Monitor

---

## 🎉 Success!

Your system is now running! Here's what's happening:

1. **ESP32/ESP8266** reads weight from HX711 sensor
2. **Every 10 seconds**, it sends data via HTTPS to your server
3. **Server** receives, validates, and stores the data
4. **Logs** are saved in `server/logs/` and `server/data/`

---

## 📊 View Your Data

### Option 1: View Recent Readings
```bash
cd server
npm run logs
```

### Option 2: Check Server Status
Open browser: `https://localhost:5050/status`

(Click "Advanced" → "Proceed" to bypass certificate warning)

### Option 3: Get Statistics
```bash
curl -k https://localhost:5050/stats
```

---

## 🔧 Common Issues & Quick Fixes

### ❌ "WiFi connection failed"
- Double-check SSID and password (case-sensitive!)
- Ensure WiFi is 2.4GHz (for ESP8266)
- Move ESP closer to router

### ❌ "Cannot connect to server"
- Verify server is running (check terminal)
- Confirm IP address is correct
- Check Windows Firewall (see main README)

### ❌ "HX711 not ready"
- Check wiring: DOUT → GPIO16, SCK → GPIO4
- Verify HX711 has power (LED on)
- Try different GPIO pins

### ❌ "Module not found" (Server)
```bash
cd server
rm -rf node_modules
npm install
```

### ❌ "Port 5050 already in use"
```bash
# Windows
netstat -ano | findstr :5050
taskkill /PID <PID> /F
```

---

## 🎯 Next Steps

Now that your system is running:

1. **Calibrate the sensor** - See `sketch_oct19a/ESP32-We/README.md`
2. **Customize settings** - Adjust intervals, add features
3. **View full documentation** - Check main `README.md`
4. **Deploy to production** - See production deployment guide

---

## 📚 Additional Resources

- **Full Documentation:** [README.md](README.md)
- **ESP32 Guide:** [sketch_oct19a/ESP32-We/README.md](sketch_oct19a/ESP32-We/README.md)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)
- **Troubleshooting:** See main README.md

---

## 🆘 Need Help?

1. Check Serial Monitor for error messages
2. Review server logs: `server/logs/`
3. Read troubleshooting section in main README
4. Open GitHub issue with logs

---

**Estimated Total Time:** 15 minutes  
**Difficulty:** Beginner-friendly  
**Last Updated:** 2025-10-20

---

**Happy Building! 🎉**

