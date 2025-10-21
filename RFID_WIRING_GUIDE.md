# 🔌 RFID RC522 Wiring Guide - GPIO 33 Power Configuration

Complete wiring guide for connecting the RFID RC522 module to ESP32 using GPIO 33 as a power supply pin.

---

## 📋 Overview

This guide shows how to wire the RFID RC522 module to an ESP32 microcontroller using **GPIO 33 as a dedicated 3.3V power supply**. This configuration is useful when your ESP32 development board has limited dedicated 3.3V power pins.

---

## ⚡ Why Use GPIO 33 as Power Supply?

### Problem
Many ESP32 development boards have limited 3.3V power pins, and you may need them for other components (like the HX711 load cell in this project).

### Solution
Configure GPIO 33 as an OUTPUT pin set to HIGH (3.3V) to serve as a dedicated power source for the RFID RC522 module.

### Benefits
- ✅ Frees up dedicated 3.3V pins for other components
- ✅ GPIO 33 can safely provide 13-26mA required by RFID RC522
- ✅ Firmware-controlled power (can be turned on/off if needed)
- ✅ No additional hardware required

### Safety
- ✅ ESP32 GPIO pins can safely source up to 40mA
- ✅ RFID RC522 typical current: 13-26mA (well within limits)
- ✅ GPIO 33 is set to HIGH before RFID initialization
- ✅ 100ms delay allows power to stabilize

---

## 🔧 Complete Wiring Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    RFID RC522 Module                        │
│                                                             │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐    │
│  │ SDA │  │ SCK │  │MOSI │  │MISO │  │ IRQ │  │ GND │    │
│  └──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘    │
│     │        │        │        │        │        │         │
│  ┌──┴──┐  ┌─┴───┐                                          │
│  │ RST │  │3.3V │                                          │
│  └──┬──┘  └──┬──┘                                          │
└─────┼────────┼─────────────────────────────────────────────┘
      │        │
      │        │
      ▼        ▼
┌─────────────────────────────────────────────────────────────┐
│                      ESP32 Board                            │
│                                                             │
│  GPIO 5   GPIO 18  GPIO 23  GPIO 19   N/C     GND          │
│    │        │        │        │        │        │           │
│    └────────┴────────┴────────┴────────┴────────┘           │
│                                                             │
│  GPIO 27   GPIO 33                                          │
│    │         │                                              │
│    └─────────┘                                              │
│                                                             │
│  (GPIO 33 configured as OUTPUT HIGH = 3.3V)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Pin Connection Table

| RFID RC522 Pin | Wire Color (Typical) | ESP32 Pin | Pin Type | Description |
|----------------|---------------------|-----------|----------|-------------|
| **SDA (SS)**   | Orange/Yellow       | **GPIO 5** | SPI | Chip Select (Slave Select) |
| **SCK**        | Green               | **GPIO 18** | SPI | SPI Clock |
| **MOSI**       | Blue                | **GPIO 23** | SPI | Master Out Slave In |
| **MISO**       | Purple              | **GPIO 19** | SPI | Master In Slave Out |
| **IRQ**        | -                   | **Not Connected** | - | Interrupt (not used) |
| **GND**        | Black               | **GND** | Power | Ground |
| **RST**        | White               | **GPIO 27** | Digital | Reset |
| **3.3V**       | Red                 | **GPIO 33** | **Power Output** | **3.3V Power Supply** |

---

## 🔌 Step-by-Step Wiring Instructions

### Step 1: Prepare Components
- [ ] ESP32 development board
- [ ] RFID RC522 module
- [ ] 8 jumper wires (male-to-female recommended)
- [ ] Breadboard (optional, for organization)
- [ ] Multimeter (for voltage verification)

### Step 2: Connect SPI Pins
1. **SDA (SS)** → Connect RFID SDA to ESP32 GPIO 5
2. **SCK** → Connect RFID SCK to ESP32 GPIO 18
3. **MOSI** → Connect RFID MOSI to ESP32 GPIO 23
4. **MISO** → Connect RFID MISO to ESP32 GPIO 19

### Step 3: Connect Control Pins
5. **RST** → Connect RFID RST to ESP32 GPIO 27
6. **IRQ** → Leave disconnected (not used in this project)

### Step 4: Connect Power Pins
7. **GND** → Connect RFID GND to ESP32 GND
8. **3.3V** → Connect RFID 3.3V to ESP32 **GPIO 33** ⚠️

**⚠️ CRITICAL:** Connect the RFID 3.3V pin to GPIO 33, NOT to the ESP32's 3.3V power pin!

### Step 5: Verify Connections
- [ ] Double-check all connections against the table above
- [ ] Ensure no loose wires
- [ ] Verify GPIO 33 is connected to RFID 3.3V pin
- [ ] Ensure GND is properly connected

---

## 🧪 Testing GPIO 33 Power Output

### Before Connecting RFID Module

**Test 1: Verify GPIO 33 Voltage**
1. Upload the firmware to ESP32
2. Open Serial Monitor (115200 baud)
3. Look for: `✅ GPIO 33 set to HIGH (3.3V) for RFID power`
4. Use multimeter to measure voltage between GPIO 33 and GND
5. Expected reading: **3.2V - 3.4V** (typically 3.3V)

**Test 2: Verify Current Capability**
1. Connect a 330Ω resistor between GPIO 33 and GND
2. Measure voltage across resistor
3. Calculate current: I = V / R
4. Expected: ~10mA (well within GPIO limits)
5. Remove resistor before connecting RFID

### After Connecting RFID Module

**Test 3: Verify RFID Power**
1. Connect RFID module as per wiring diagram
2. Upload firmware and open Serial Monitor
3. Look for successful RFID initialization
4. Measure voltage at RFID 3.3V pin: should be ~3.3V
5. RFID LED should light up (if module has one)

---

## ⚙️ Firmware Configuration

The firmware automatically configures GPIO 33 during setup:

```cpp
// Pin definitions
const int RFID_SS_PIN = 5;     // SDA/SS pin
const int RFID_RST_PIN = 27;   // RST pin
const int RFID_VCC_PIN = 33;   // Power supply pin (3.3V output)

void setup() {
  // Configure GPIO 33 as power supply for RFID module
  pinMode(RFID_VCC_PIN, OUTPUT);
  digitalWrite(RFID_VCC_PIN, HIGH);  // Set to 3.3V
  delay(100);  // Allow power to stabilize
  
  // Initialize RFID module
  SPI.begin();
  rfid.PCD_Init();
  // ...
}
```

**Key Points:**
- GPIO 33 is set to OUTPUT mode
- Pin is set to HIGH (3.3V) before RFID initialization
- 100ms delay allows power to stabilize
- RFID module initializes after power is stable

---

## 🔍 Troubleshooting

### Issue: RFID Not Detected

**Check List:**
1. ✅ Verify GPIO 33 is connected to RFID 3.3V pin (not to ESP32 3.3V pin)
2. ✅ Measure voltage at GPIO 33: should be ~3.3V
3. ✅ Check Serial Monitor for: `✅ GPIO 33 set to HIGH (3.3V) for RFID power`
4. ✅ Verify all SPI connections (SDA, SCK, MOSI, MISO)
5. ✅ Check GND connection
6. ✅ Verify RST connection to GPIO 27

### Issue: Low Voltage at GPIO 33

**Possible Causes:**
- Loose connection
- Damaged GPIO pin
- Short circuit
- Excessive current draw

**Solutions:**
1. Check all connections with multimeter
2. Try a different GPIO pin (update firmware accordingly)
3. Verify RFID module is not damaged
4. Add 100µF capacitor between GPIO 33 and GND for stability

### Issue: RFID Initialization Failed

**Serial Monitor Shows:**
```
❌ RFID RC522 initialization failed!
   Check wiring and connections
```

**Solutions:**
1. Verify GPIO 33 voltage is 3.3V
2. Check all SPI pin connections
3. Ensure firmware is uploaded correctly
4. Try power cycling the ESP32
5. Verify RFID module is not damaged

---

## 📐 Physical Layout Recommendations

### Breadboard Layout
```
┌─────────────────────────────────────┐
│         Breadboard                  │
│                                     │
│  [ESP32]                            │
│    │││││                            │
│    │││││                            │
│  ──┴┴┴┴┴──  Power Rails             │
│                                     │
│  [RFID RC522]                       │
│    │││││││                          │
│    │││││││                          │
│  ──┴┴┴┴┴┴┴──                        │
│                                     │
│  Jumper wires connecting pins       │
└─────────────────────────────────────┘
```

### Cable Management
- Use different colored wires for easy identification
- Keep wires short to minimize interference
- Route power wires away from signal wires
- Label wires if needed for maintenance

### Mounting
- Secure ESP32 to prevent movement
- Mount RFID module flat and stable
- Ensure RFID antenna is not obstructed
- Keep metal objects away from RFID antenna

---

## 🔋 Power Consumption

### RFID RC522 Current Draw
- **Idle:** ~13mA
- **Reading:** ~26mA
- **Peak:** ~30mA (brief spikes)

### ESP32 GPIO Specifications
- **Maximum per pin:** 40mA
- **Recommended:** < 30mA
- **GPIO 33 output:** ~3.3V @ 40mA max

### Safety Margin
- RFID typical: 13-26mA
- GPIO 33 max: 40mA
- **Safety margin:** 14-27mA (35-67% headroom) ✅

---

## 📝 Additional Notes

### Alternative Power Pins
If GPIO 33 is not available, you can use these alternative pins:
- GPIO 32
- GPIO 25
- GPIO 26
- GPIO 14
- GPIO 12

**To change:** Update `RFID_VCC_PIN` in the firmware and re-upload.

### Adding Capacitor (Optional but Recommended)
For improved power stability:
1. Add 100µF electrolytic capacitor
2. Connect between GPIO 33 (+) and GND (-)
3. Place close to RFID module
4. Observe polarity (+ to GPIO 33, - to GND)

### Multiple RFID Modules
If using multiple RFID modules:
- Each module needs its own SS pin
- All modules can share SPI pins (SCK, MOSI, MISO)
- Each module can have its own power pin (GPIO 33, 32, etc.)
- Update firmware to handle multiple modules

---

## ✅ Final Checklist

Before powering on:
- [ ] All 8 connections verified
- [ ] GPIO 33 connected to RFID 3.3V (not ESP32 3.3V)
- [ ] GND properly connected
- [ ] No loose wires
- [ ] Firmware uploaded with correct pin configuration
- [ ] Serial Monitor ready (115200 baud)
- [ ] Multimeter available for testing

After powering on:
- [ ] GPIO 33 voltage verified (~3.3V)
- [ ] RFID initialization successful
- [ ] Firmware version displayed
- [ ] NFC card detection working
- [ ] No error messages in Serial Monitor

---

## 📚 Related Documentation

- [RFID_INTEGRATION.md](RFID_INTEGRATION.md) - Complete integration guide
- [RFID_TESTING_GUIDE.md](RFID_TESTING_GUIDE.md) - Testing procedures
- [RFID_DEPLOYMENT.md](RFID_DEPLOYMENT.md) - Deployment guide
- [CHANGELOG.md](CHANGELOG.md) - Version history

---

**Version:** 1.6.0  
**Last Updated:** 2025-10-21  
**Author:** ShopPad Team

**⚠️ Important:** Always verify GPIO 33 voltage before connecting the RFID module to prevent damage!

