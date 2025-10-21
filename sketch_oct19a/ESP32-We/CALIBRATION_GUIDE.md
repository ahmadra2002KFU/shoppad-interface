# 🎯 HX711 Load Cell Calibration Guide

Complete guide to calibrate your weight sensor for accurate readings.

---

## 📊 **Current Issue**

- **Current Reading:** 66-68 kg
- **Actual Weight:** 205 grams (0.205 kg)
- **Error Factor:** ~330x too high
- **Current Calibration Factor:** 10.0

---

## 🔧 **Quick Calibration**

### **Method 1: Calculate New Calibration Factor**

Based on your readings:

```
Current Reading: 67 kg (average)
Actual Weight: 0.205 kg
Error Ratio: 67 / 0.205 = 326.83

New Calibration Factor = Current Factor × Error Ratio
New Calibration Factor = 10.0 × 326.83 = 3268.3
```

**Try this value first:** `3268.3`

---

### **Method 2: Step-by-Step Calibration**

#### **Step 1: Get Raw Reading**

Upload this test code to see raw values:

```cpp
void setup() {
  Serial.begin(115200);
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale();  // No calibration factor
  scale.tare();       // Reset to zero
}

void loop() {
  if (scale.is_ready()) {
    long reading = scale.read_average(10);
    Serial.print("Raw reading: ");
    Serial.println(reading);
  }
  delay(1000);
}
```

#### **Step 2: Calculate Calibration Factor**

1. **Remove all weight** from scale
2. **Press tare** (reset to zero)
3. **Place known weight** (e.g., 205 grams)
4. **Note the raw reading** (e.g., 123456)

```
Calibration Factor = Raw Reading / Known Weight (in grams)
Calibration Factor = 123456 / 205 = 602.2
```

#### **Step 3: Update Code**

```cpp
const float CALIBRATION_FACTOR = 602.2;  // Your calculated value
```

---

## 🎯 **Recommended Calibration Factor**

Based on your current readings, try this:

```cpp
const float CALIBRATION_FACTOR = 3268.3;  // Updated from 10.0
```

Or try these common values for different load cells:

| Load Cell Type | Typical Range |
|----------------|---------------|
| **5kg load cell** | 400 - 600 |
| **10kg load cell** | 2000 - 2500 |
| **20kg load cell** | 3000 - 4000 |
| **50kg load cell** | 7000 - 9000 |

---

## 📝 **Full Calibration Procedure**

### **What You Need:**
- Known weights (e.g., 100g, 200g, 500g, 1kg)
- Serial Monitor
- Calculator

### **Steps:**

#### **1. Zero the Scale**

```cpp
void setup() {
  Serial.begin(115200);
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  
  Serial.println("Remove all weight from scale");
  Serial.println("Press any key when ready...");
  while (!Serial.available()) {}
  
  scale.set_scale();
  scale.tare();
  Serial.println("Scale zeroed!");
}
```

#### **2. Test with Known Weight**

```cpp
void loop() {
  if (scale.is_ready()) {
    long raw = scale.read_average(10);
    Serial.print("Raw: ");
    Serial.println(raw);
    
    // Test different calibration factors
    scale.set_scale(100);
    Serial.print("With 100: ");
    Serial.println(scale.get_units(10));
    
    scale.set_scale(500);
    Serial.print("With 500: ");
    Serial.println(scale.get_units(10));
    
    scale.set_scale(1000);
    Serial.print("With 1000: ");
    Serial.println(scale.get_units(10));
    
    scale.set_scale(3000);
    Serial.print("With 3000: ");
    Serial.println(scale.get_units(10));
  }
  delay(2000);
}
```

#### **3. Find the Right Factor**

Place 205g on the scale and see which calibration factor gives you ~0.205 kg (or 205 if measuring in grams).

---

## 🔢 **Quick Fix for Your Case**

Update line 61 in `ESP32-We.ino`:

### **Current:**
```cpp
const float CALIBRATION_FACTOR = 10.0;  // Adjust based on your calibration
```

### **Change to:**
```cpp
const float CALIBRATION_FACTOR = 3268.3;  // Calibrated for 205g test weight
```

---

## 🧪 **Testing After Calibration**

After updating the calibration factor:

1. **Upload the code**
2. **Remove all weight** from scale
3. **Wait for tare** (should show ~0 kg)
4. **Place 205g weight**
5. **Check reading** (should show ~0.20-0.21 kg)

### **Expected Output:**
```
📤 0.00 kg ✅  (no weight)
📤 0.20 kg ✅  (205g weight)
📤 0.41 kg ✅  (410g weight)
```

---

## 🎯 **Fine-Tuning**

If the reading is close but not exact:

### **Reading too high:**
```cpp
// If reading 0.25 kg instead of 0.205 kg
// Increase calibration factor by ~20%
const float CALIBRATION_FACTOR = 3922.0;  // 3268.3 × 1.2
```

### **Reading too low:**
```cpp
// If reading 0.15 kg instead of 0.205 kg
// Decrease calibration factor by ~25%
const float CALIBRATION_FACTOR = 2451.2;  // 3268.3 × 0.75
```

---

## 📊 **Calibration Formula**

```
New Factor = Current Factor × (Current Reading / Actual Weight)

Example:
Current Factor: 3268.3
Current Reading: 0.25 kg
Actual Weight: 0.205 kg

New Factor = 3268.3 × (0.25 / 0.205) = 3268.3 × 1.22 = 3987.3
```

---

## 🔧 **Advanced: Multi-Point Calibration**

For best accuracy, calibrate with multiple weights:

```cpp
// Test with different weights
// 100g → should read 0.10 kg
// 200g → should read 0.20 kg
// 500g → should read 0.50 kg
// 1000g → should read 1.00 kg

// Calculate average calibration factor
// Use the one that gives best results across all weights
```

---

## ⚠️ **Common Issues**

### **Reading is negative:**
- Load cell wires are reversed
- Swap the E+ and E- wires

### **Reading jumps around:**
- Poor connections
- Electrical interference
- Increase averaging: `scale.get_units(20)` instead of `scale.get_units(3)`

### **Reading doesn't change:**
- HX711 not connected properly
- Check DOUT and SCK pins
- Check power supply (3.3V or 5V)

### **Reading drifts over time:**
- Temperature changes
- Re-tare the scale periodically
- Use better quality load cell

---

## 📝 **Calibration Sketch**

Here's a complete calibration sketch you can use:

```cpp
#include <HX711.h>

const int LOADCELL_DOUT_PIN = 16;
const int LOADCELL_SCK_PIN = 4;

HX711 scale;

void setup() {
  Serial.begin(115200);
  Serial.println("HX711 Calibration");
  Serial.println("Remove all weight from scale");
  Serial.println();
  
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  
  Serial.println("Taring... remove any weights");
  delay(2000);
  scale.set_scale();
  scale.tare();
  Serial.println("Tare done!");
  
  Serial.println();
  Serial.println("Place known weight on scale");
  Serial.println("Enter weight in grams:");
}

void loop() {
  if (Serial.available()) {
    float knownWeight = Serial.parseFloat();
    
    Serial.print("Reading with known weight: ");
    Serial.print(knownWeight);
    Serial.println("g");
    
    delay(2000);
    
    long reading = scale.get_units(10);
    Serial.print("Raw reading: ");
    Serial.println(reading);
    
    float calibrationFactor = reading / knownWeight;
    Serial.print("Calibration factor: ");
    Serial.println(calibrationFactor, 2);
    
    Serial.println();
    Serial.println("Update your code with:");
    Serial.print("const float CALIBRATION_FACTOR = ");
    Serial.print(calibrationFactor, 2);
    Serial.println(";");
    
    // Test the calibration
    scale.set_scale(calibrationFactor);
    Serial.println();
    Serial.println("Testing calibration:");
    for (int i = 0; i < 5; i++) {
      Serial.print("Weight: ");
      Serial.print(scale.get_units(10), 2);
      Serial.println(" g");
      delay(1000);
    }
  }
}
```

---

## ✅ **Quick Summary**

1. **Update calibration factor** to `3268.3` (line 61)
2. **Upload code** to ESP32
3. **Test with 205g weight**
4. **Fine-tune** if needed

**Expected result:** Reading should show ~0.20-0.21 kg for 205g weight

---

**Good luck with calibration!** 🎯

