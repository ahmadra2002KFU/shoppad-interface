# ESP32/ESP8266 Weight Sensor + NFC Auto-Payment Firmware

Production-ready firmware for ESP32/ESP8266 with HX711 load cell integration, RFID RC522 NFC reader, and HTTPS communication for smart cart systems.

## 💳 Payment Methods

This firmware supports **two payment methods**:

1. **NFC Card Payment (Auto-Pay)**
   - User taps their linked NFC card on the reader
   - System automatically processes payment
   - Requires NFC card to be linked to user account
   - Fastest checkout experience

2. **Phone App Payment (Manual)**
   - User completes checkout via smartphone app
   - No hardware interaction required
   - Works for any authenticated user

## 📋 Hardware Requirements

### Required Components
- **ESP32** or **ESP8266** development board
- **HX711** Load Cell Amplifier module
- **Load Cell** (weight sensor) - any capacity
- **RFID RC522** NFC reader module
- **USB Cable** for programming
- **Breadboard and jumper wires** (optional)

### Recommended Boards
- **ESP32**: ESP32 DevKit V1, ESP32-WROOM-32
- **ESP8266**: NodeMCU, Wemos D1 Mini

## 🔌 Wiring Diagram

### ESP32 Connections
```
HX711          ESP32
━━━━━━━━━━━━━━━━━━━━━━━
VCC     →      3.3V or 5V
GND     →      GND
DOUT    →      GPIO 16
SCK     →      GPIO 4

Load Cell      HX711
━━━━━━━━━━━━━━━━━━━━━━━
E+      →      E+
E-      →      E-
A+      →      A+
A-      →      A-
```

### ESP8266 Connections
```
HX711          ESP8266
━━━━━━━━━━━━━━━━━━━━━━━
VCC     →      3.3V
GND     →      GND
DOUT    →      D5 (GPIO 14)
SCK     →      D6 (GPIO 12)
```

**Note:** For ESP8266, you may need to change the pin definitions in the code:
```cpp
const int LOADCELL_DOUT_PIN = 14;  // D5
const int LOADCELL_SCK_PIN = 12;   // D6
```

## 🛠️ Software Setup

### 1. Install Arduino IDE

Download and install from: https://www.arduino.cc/en/software

### 2. Install Board Support

#### For ESP32:
1. Open Arduino IDE
2. Go to `File` → `Preferences`
3. Add this URL to "Additional Board Manager URLs":
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Go to `Tools` → `Board` → `Boards Manager`
5. Search for "ESP32" and install "esp32 by Espressif Systems"

#### For ESP8266:
1. Add this URL to "Additional Board Manager URLs":
   ```
   http://arduino.esp8266.com/stable/package_esp8266com_index.json
   ```
2. Go to `Tools` → `Board` → `Boards Manager`
3. Search for "ESP8266" and install "esp8266 by ESP8266 Community"

### 3. Install Required Libraries

Go to `Sketch` → `Include Library` → `Manage Libraries` and install:

- **HX711** by Bogdan Necula
  - Version: Latest
  - Used for: Load cell communication

- **ArduinoJson** by Benoit Blanchon
  - Version: 6.x (NOT 7.x)
  - Used for: JSON serialization

## ⚙️ Configuration

### 1. WiFi Settings

Update lines 44-45 in `ESP32-We.ino`:

```cpp
const char* WIFI_SSID = "ABC";          // Your WiFi network name
const char* WIFI_PASSWORD = "ahmad123";  // Your WiFi password
```

**Important Notes:**
- ESP8266 only supports 2.4GHz WiFi networks
- SSID and password are case-sensitive
- Special characters in password may need escaping

### 2. Server Configuration

Update line 48 with your PC's IP address:

```cpp
const char* SERVER_HOST = "192.168.1.100";  // Your PC's IP address
```

**How to find your PC's IP:**
- Windows: Run `ipconfig` in Command Prompt
- Linux/Mac: Run `ifconfig` or `ip addr show`
- Look for IPv4 address on your active network adapter

### 3. HX711 Pin Configuration

Default pins (lines 51-52):
```cpp
const int LOADCELL_DOUT_PIN = 16;  // Data pin
const int LOADCELL_SCK_PIN = 4;    // Clock pin
```

Change these if you use different GPIO pins.

### 4. Timing Configuration

Default settings (lines 55-56):
```cpp
const unsigned long SEND_INTERVAL = 10000;      // 10 seconds
const unsigned long WIFI_RETRY_INTERVAL = 5000; // 5 seconds
```

### 5. Calibration Factor

Line 59:
```cpp
const float CALIBRATION_FACTOR = 10.0;  // Adjust based on your calibration
```

See [Calibration Guide](#calibration-guide) below.

## 📤 Upload Firmware

### 1. Connect ESP32/ESP8266

Connect your board to PC via USB cable.

### 2. Select Board

Go to `Tools` → `Board` and select:
- For ESP32: "ESP32 Dev Module" or your specific board
- For ESP8266: "NodeMCU 1.0" or your specific board

### 3. Select Port

Go to `Tools` → `Port` and select the COM port (Windows) or /dev/ttyUSB* (Linux/Mac)

### 4. Configure Upload Settings (ESP32)

Recommended settings:
- Upload Speed: 115200
- Flash Frequency: 80MHz
- Flash Mode: QIO
- Flash Size: 4MB
- Partition Scheme: Default

### 5. Upload

Click the **Upload** button (→) or press `Ctrl+U`

**Troubleshooting Upload:**
- If upload fails, try holding the BOOT button during upload
- Reduce upload speed to 57600 if issues persist
- Install USB drivers (CP2102, CH340, etc.)

## 🔍 Monitoring

### Serial Monitor

1. Open Serial Monitor: `Tools` → `Serial Monitor`
2. Set baud rate to **115200**
3. You should see:

```
╔════════════════════════════════════════════════════════╗
║   ESP32/ESP8266 Weight Sensor - HTTPS Client          ║
║   Version: 1.0.0                                       ║
╚════════════════════════════════════════════════════════╝

Board Type: ESP32

🔧 Initializing HX711 load cell...
✅ HX711 initialized successfully
✅ Scale tared (zeroed)
📡 Connecting to WiFi...
   SSID: ABC
...........
✅ WiFi connected successfully!
   IP Address: 192.168.1.50
   Signal Strength: -45 dBm

✅ Setup complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📤 Sending weight data to server...
   Weight: 12.34 kg
   Connecting to 192.168.1.100:5050...
✅ Connected to server
   Request sent
✅ Data sent successfully!
```

## 🎯 Calibration Guide

### Step 1: Tare (Zero) the Scale

The firmware automatically tares on startup. Ensure nothing is on the scale when powering on.

### Step 2: Find Calibration Factor

1. Place a known weight on the scale (e.g., 1 kg)
2. Note the raw reading from Serial Monitor
3. Calculate: `CALIBRATION_FACTOR = raw_reading / known_weight`
4. Update line 59 in the code
5. Re-upload firmware

### Step 3: Verify

Place different known weights and verify accuracy.

## 🐛 Troubleshooting

### WiFi Issues

**Problem:** WiFi connection failed
- ✅ Check SSID and password
- ✅ Ensure 2.4GHz network (for ESP8266)
- ✅ Check WiFi signal strength
- ✅ Restart router if needed

**Problem:** WiFi keeps disconnecting
- ✅ Check power supply (use quality USB cable)
- ✅ Reduce distance to router
- ✅ Check for WiFi interference

### HX711 Issues

**Problem:** "HX711 not ready"
- ✅ Check all wiring connections
- ✅ Verify HX711 has power (LED should be on)
- ✅ Test with multimeter: VCC should be 3.3V or 5V
- ✅ Try different GPIO pins

**Problem:** Unstable readings
- ✅ Ensure stable power supply
- ✅ Keep wires short and away from noise sources
- ✅ Add 100nF capacitor between VCC and GND
- ✅ Shield cables if possible

### Server Connection Issues

**Problem:** Cannot connect to server
- ✅ Verify server is running
- ✅ Check SERVER_HOST IP is correct
- ✅ Ensure ESP and PC on same network
- ✅ Test with: `ping <SERVER_IP>` from another device
- ✅ Check Windows Firewall allows port 5050

**Problem:** "Server response timeout"
- ✅ Increase timeout in code (line 274)
- ✅ Check server logs for errors
- ✅ Verify SSL certificates are valid

## 🔒 Security Notes

### Development Mode

Current configuration uses `client.setInsecure()` which skips SSL certificate validation. This is acceptable for local development.

### Production Mode

For production, implement certificate validation:

```cpp
// Option 1: Use certificate fingerprint
const char* fingerprint = "AA BB CC DD EE FF 00 11 22 33 44 55 66 77 88 99 AA BB CC DD";
client.setFingerprint(fingerprint);

// Option 2: Use root CA certificate
const char* rootCA = "-----BEGIN CERTIFICATE-----\n...";
client.setCACert(rootCA);
```

## 📊 Performance

- **WiFi Connection Time:** ~2-5 seconds
- **Weight Reading Time:** ~100ms (10 samples average)
- **HTTPS Request Time:** ~500-1000ms
- **Total Cycle Time:** ~10 seconds (configurable)
- **Power Consumption:** ~80-150mA (ESP32), ~70-120mA (ESP8266)

## 🔄 Firmware Updates

To update the firmware:

1. Make changes to `ESP32-We.ino`
2. Increment version number (line 18)
3. Upload to ESP32/ESP8266
4. Monitor Serial output to verify

## 📝 Code Structure

```cpp
// Configuration Section (Lines 40-60)
- WiFi credentials
- Server settings
- Pin definitions
- Timing configuration

// Setup Function (Lines 82-122)
- Serial initialization
- HX711 initialization
- WiFi client configuration
- WiFi connection

// Main Loop (Lines 128-174)
- WiFi connection monitoring
- Periodic weight data transmission
- Status reporting

// Helper Functions
- connectToWiFi()    - WiFi connection handler
- getWeight()        - Read weight from HX711
- sendWeightData()   - Send data via HTTPS
- printStatus()      - Display status information
```

## 🆘 Support

For issues:
1. Check Serial Monitor output
2. Review [Troubleshooting](#troubleshooting) section
3. Check main README.md
4. Open GitHub issue with Serial Monitor logs

---

**Version:** 2.0.0
**Last Updated:** 2025-12-11
**Compatible with:** ESP32, ESP8266

## 🔄 Version History

- **v2.0.0** (2025-12-11): Added NFC auto-payment support, two payment methods
- **v1.6.0** (2025-10-21): Added RFID RC522 NFC detection
- **v1.0.0** (2025-10-20): Initial release with weight sensor

