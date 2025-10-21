# 🧪 QR Code Scanner Testing Guide

Step-by-step guide to test the QR code scanning functionality.

---

## 🎯 **Quick Start Testing**

### **Step 1: Generate Test QR Codes**

Visit any QR code generator (recommended: https://www.qr-code-generator.com/)

Use these test data samples:

#### **Test Product 1: Fresh Tomatoes**
```json
{"id":"1","name":"Fresh Tomatoes","price":11.25,"category":"Fresh Produce","weight":0.5}
```

#### **Test Product 2: Organic Potatoes**
```json
{"id":"2","name":"Organic Potatoes","price":13.12,"category":"Fresh Produce","weight":1.0}
```

#### **Test Product 3: Red Apples**
```json
{"id":"3","name":"Red Apples","price":18.75,"category":"Fresh Produce","weight":0.8}
```

#### **Test Product 4: Minimal Data**
```json
{"id":"test-1","name":"Test Product","price":9.99}
```

### **Step 2: Open the Application**

1. Navigate to: `http://138.68.137.154:8080/`
2. You should see the shopping page with products

### **Step 3: Start Scanner**

1. Click the **"Scan QR Code"** button (top section)
2. Allow camera access when prompted
3. You should see the camera feed

### **Step 4: Scan QR Code**

1. Hold the QR code in front of the camera
2. Position it within the scanning frame
3. Wait for the beep sound
4. Product should be added to cart automatically
5. Scanner should close

### **Step 5: Verify**

1. Check the cart (right panel)
2. Product should appear with correct:
   - Name
   - Price
   - Quantity (1)

---

## 📋 **Test Cases**

### **✅ Test Case 1: Valid QR Code**

**Input:**
```json
{"id":"1","name":"Fresh Tomatoes","price":11.25,"category":"Fresh Produce","weight":0.5}
```

**Expected Result:**
- ✅ Scanner detects QR code
- ✅ Beep sound plays
- ✅ Success toast: "Product Added! Fresh Tomatoes - 11.25 SAR"
- ✅ Product appears in cart
- ✅ Scanner closes automatically

---

### **✅ Test Case 2: Minimal Valid QR Code**

**Input:**
```json
{"id":"test-1","name":"Test Product","price":9.99}
```

**Expected Result:**
- ✅ Scanner detects QR code
- ✅ Product added with default category "Other"
- ✅ No weight specified (weight: undefined)
- ✅ Default placeholder image used

---

### **❌ Test Case 3: Invalid JSON**

**Input:**
```
This is not JSON
```

**Expected Result:**
- ❌ Error toast: "Invalid QR Code - Failed to parse QR code"
- ❌ Scanner remains open
- ❌ No product added to cart

---

### **❌ Test Case 4: Missing Required Field (name)**

**Input:**
```json
{"id":"1","price":11.25}
```

**Expected Result:**
- ❌ Error toast: "Invalid QR Code - missing required fields (id, name, price)"
- ❌ Scanner remains open
- ❌ No product added to cart

---

### **❌ Test Case 5: Missing Required Field (price)**

**Input:**
```json
{"id":"1","name":"Test Product"}
```

**Expected Result:**
- ❌ Error toast: "Invalid QR Code - missing required fields (id, name, price)"
- ❌ Scanner remains open
- ❌ No product added to cart

---

### **❌ Test Case 6: Invalid Price (negative)**

**Input:**
```json
{"id":"1","name":"Test Product","price":-5.00}
```

**Expected Result:**
- ❌ Error toast: "Invalid QR Code - Invalid price: must be greater than 0"
- ❌ Scanner remains open
- ❌ No product added to cart

---

### **❌ Test Case 7: Invalid Price (zero)**

**Input:**
```json
{"id":"1","name":"Test Product","price":0}
```

**Expected Result:**
- ❌ Error toast: "Invalid QR Code - Invalid price: must be greater than 0"
- ❌ Scanner remains open
- ❌ No product added to cart

---

### **✅ Test Case 8: Duplicate Scan Prevention**

**Steps:**
1. Scan a QR code successfully
2. Immediately scan the same QR code again

**Expected Result:**
- ✅ First scan: Product added
- ✅ Second scan: Ignored (duplicate prevention)
- ✅ Scanner closes after first scan

---

### **✅ Test Case 9: Multiple Different Products**

**Steps:**
1. Scan Product 1 QR code
2. Open scanner again
3. Scan Product 2 QR code
4. Open scanner again
5. Scan Product 3 QR code

**Expected Result:**
- ✅ All 3 products added to cart
- ✅ Cart shows 3 items
- ✅ Each product has quantity: 1

---

### **✅ Test Case 10: Same Product Multiple Times**

**Steps:**
1. Scan Product 1 QR code
2. Open scanner again
3. Scan Product 1 QR code again

**Expected Result:**
- ✅ Product quantity increases to 2
- ✅ Cart shows 1 unique item with quantity: 2

---

## 🔧 **Advanced Testing**

### **Test Case 11: Weight Validation (Enabled)**

**Prerequisites:**
- ESP32 weight sensor connected and working
- Weight validation enabled in code

**Steps:**
1. Place 500g item on scale
2. Wait for weight to stabilize (~0.50 kg)
3. Scan QR code with `"weight": 0.5`

**Expected Result:**
- ✅ Weight matches (within 50g tolerance)
- ✅ Product added successfully

**Negative Test:**
1. Place 500g item on scale
2. Scan QR code with `"weight": 1.0`

**Expected Result:**
- ❌ Error toast: "Weight Mismatch - Expected 1.00 kg, got 0.50 kg"
- ❌ Product not added

---

### **Test Case 12: Camera Permission Denied**

**Steps:**
1. Click "Scan QR Code"
2. Deny camera permission when prompted

**Expected Result:**
- ❌ Error message: "No cameras found on this device" or "Permission denied"
- ❌ Scanner shows error state
- ❌ Close button available

---

### **Test Case 13: Mobile Device Testing**

**Steps:**
1. Open on mobile device: `http://138.68.137.154:8080/`
2. Click "Scan QR Code"
3. Scanner should use back camera

**Expected Result:**
- ✅ Back camera selected automatically
- ✅ Scanner works in portrait and landscape
- ✅ Touch-friendly UI
- ✅ Responsive design

---

### **Test Case 14: Language Switching**

**Steps:**
1. Click language toggle (top right)
2. Switch to Arabic
3. Open QR scanner

**Expected Result:**
- ✅ All text in Arabic
- ✅ RTL layout
- ✅ Scanner still functional
- ✅ Toast messages in Arabic

---

## 📊 **Performance Testing**

### **Test Case 15: Scan Speed**

**Metric:** Time from QR code visible to product added

**Expected:** < 1 second

**How to Test:**
1. Start timer when QR code enters frame
2. Stop timer when beep sounds
3. Should be under 1 second

---

### **Test Case 16: Camera Startup Time**

**Metric:** Time from clicking "Scan QR Code" to camera feed visible

**Expected:** 1-2 seconds

**How to Test:**
1. Start timer when clicking button
2. Stop timer when camera feed appears
3. Should be 1-2 seconds

---

### **Test Case 17: Multiple Scans Performance**

**Steps:**
1. Scan 10 different products in succession
2. Monitor for slowdowns or errors

**Expected Result:**
- ✅ All scans successful
- ✅ No performance degradation
- ✅ No memory leaks

---

## 🐛 **Error Handling Testing**

### **Test Case 18: Poor Lighting**

**Steps:**
1. Test in low light conditions
2. Try to scan QR code

**Expected Result:**
- ⚠️ May take longer to detect
- ⚠️ May require better positioning
- ✅ Should eventually detect if QR code is clear

---

### **Test Case 19: Blurry QR Code**

**Steps:**
1. Print QR code at low resolution
2. Try to scan

**Expected Result:**
- ⚠️ May fail to detect
- ⚠️ No error message (just keeps scanning)
- ✅ Use higher quality QR code

---

### **Test Case 20: Scanner Close During Scan**

**Steps:**
1. Open scanner
2. Click close button while scanning

**Expected Result:**
- ✅ Scanner closes immediately
- ✅ Camera stops
- ✅ No errors in console

---

## 📱 **Browser Compatibility Testing**

Test on multiple browsers:

| Browser | Desktop | Mobile | Status |
|---------|---------|--------|--------|
| Chrome | ✅ | ✅ | Recommended |
| Firefox | ✅ | ✅ | Supported |
| Safari | ✅ | ✅ | Supported |
| Edge | ✅ | ✅ | Supported |
| Opera | ✅ | ⚠️ | May work |

---

## 🔍 **Debugging**

### **Enable Console Logging**

Open browser console (F12) to see:
- Scanner initialization
- QR code detection attempts
- Parse results
- Errors

### **Common Console Messages**

**Success:**
```
QR Scan success: {"id":"1","name":"Fresh Tomatoes",...}
Product added to cart: Fresh Tomatoes
```

**Error:**
```
QR Scan error: Invalid QR code format
Failed to parse QR code: Unexpected token
```

---

## ✅ **Test Checklist**

Use this checklist to verify all functionality:

**Basic Functionality:**
- [ ] Scanner opens when clicking "Scan QR Code"
- [ ] Camera feed is visible
- [ ] QR code is detected
- [ ] Beep sound plays on success
- [ ] Product added to cart
- [ ] Scanner closes automatically
- [ ] Toast notification shows

**Error Handling:**
- [ ] Invalid JSON shows error
- [ ] Missing fields show error
- [ ] Invalid price shows error
- [ ] Camera permission denied handled
- [ ] Close button works

**Integration:**
- [ ] Cart updates correctly
- [ ] Weight sensor integration works (if enabled)
- [ ] Language switching works
- [ ] Mobile responsive

**Performance:**
- [ ] Scan speed < 1 second
- [ ] Camera startup < 2 seconds
- [ ] No memory leaks
- [ ] Multiple scans work smoothly

---

## 📞 **Support**

If you encounter issues:

1. Check browser console for errors
2. Verify camera permissions
3. Test with different QR codes
4. Try different browser
5. Check network connection
6. Verify server is running

---

## 🎉 **Success Criteria**

The QR scanner is working correctly if:

✅ All basic test cases pass
✅ Error handling works as expected
✅ Performance meets requirements
✅ Mobile and desktop both work
✅ Multi-language support functional
✅ Integration with cart seamless

---

**Happy Testing!** 🚀

