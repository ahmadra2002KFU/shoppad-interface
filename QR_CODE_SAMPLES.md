# 📱 QR Code Samples for Testing

Ready-to-use QR code data for testing the ShopPad scanner.

---

## 🎯 **How to Generate QR Codes**

1. Visit: https://www.qr-code-generator.com/
2. Select "Text" type
3. Copy one of the JSON samples below
4. Paste into the text field
5. Download or print the QR code
6. Scan with ShopPad app

---

## ✅ **Valid Product Samples**

### **Sample 1: Fresh Tomatoes (Complete Data)**

```json
{"id":"1","name":"Fresh Tomatoes","price":11.25,"category":"Fresh Produce","weight":0.5,"barcode":"1234567890123"}
```

**Expected Result:**
- Product: Fresh Tomatoes
- Price: 11.25 SAR
- Category: Fresh Produce
- Weight: 0.5 kg

---

### **Sample 2: Organic Potatoes**

```json
{"id":"2","name":"Organic Potatoes","price":13.12,"category":"Fresh Produce","weight":1.0,"barcode":"1234567890124"}
```

**Expected Result:**
- Product: Organic Potatoes
- Price: 13.12 SAR
- Category: Fresh Produce
- Weight: 1.0 kg

---

### **Sample 3: Red Apples**

```json
{"id":"3","name":"Red Apples","price":18.75,"category":"Fresh Produce","weight":0.8,"barcode":"1234567890125"}
```

**Expected Result:**
- Product: Red Apples
- Price: 18.75 SAR
- Category: Fresh Produce
- Weight: 0.8 kg

---

### **Sample 4: Fresh Bananas**

```json
{"id":"4","name":"Fresh Bananas","price":9.50,"category":"Fresh Produce","weight":0.6,"barcode":"1234567890126"}
```

**Expected Result:**
- Product: Fresh Bananas
- Price: 9.50 SAR
- Category: Fresh Produce
- Weight: 0.6 kg

---

### **Sample 5: Whole Milk**

```json
{"id":"6","name":"Whole Milk","price":15.00,"category":"Dairy","weight":1.0,"barcode":"2234567890123"}
```

**Expected Result:**
- Product: Whole Milk
- Price: 15.00 SAR
- Category: Dairy
- Weight: 1.0 kg

---

### **Sample 6: Fresh Bread**

```json
{"id":"7","name":"Fresh Bread","price":6.50,"category":"Bakery","weight":0.4,"barcode":"3234567890123"}
```

**Expected Result:**
- Product: Fresh Bread
- Price: 6.50 SAR
- Category: Bakery
- Weight: 0.4 kg

---

### **Sample 7: Orange Juice**

```json
{"id":"10","name":"Orange Juice","price":18.75,"category":"Beverages","weight":1.0,"barcode":"4234567890123"}
```

**Expected Result:**
- Product: Orange Juice
- Price: 18.75 SAR
- Category: Beverages
- Weight: 1.0 kg

---

### **Sample 8: Minimal Product (Required Fields Only)**

```json
{"id":"test-1","name":"Test Product","price":9.99}
```

**Expected Result:**
- Product: Test Product
- Price: 9.99 SAR
- Category: Other (default)
- Weight: undefined

---

### **Sample 9: High-Value Product**

```json
{"id":"20","name":"Cookware Set","price":299.99,"category":"Kitchen","barcode":"9234567890123"}
```

**Expected Result:**
- Product: Cookware Set
- Price: 299.99 SAR
- Category: Kitchen
- No weight

---

### **Sample 10: Clothing Item**

```json
{"id":"18","name":"Cotton T-Shirt","price":75.00,"category":"Clothing","barcode":"8234567890123"}
```

**Expected Result:**
- Product: Cotton T-Shirt
- Price: 75.00 SAR
- Category: Clothing
- No weight

---

## ❌ **Invalid Samples (For Error Testing)**

### **Invalid 1: Missing Name**

```json
{"id":"1","price":11.25}
```

**Expected Error:** "Invalid QR code format: missing required fields (id, name, price)"

---

### **Invalid 2: Missing Price**

```json
{"id":"1","name":"Test Product"}
```

**Expected Error:** "Invalid QR code format: missing required fields (id, name, price)"

---

### **Invalid 3: Missing ID**

```json
{"name":"Test Product","price":11.25}
```

**Expected Error:** "Invalid QR code format: missing required fields (id, name, price)"

---

### **Invalid 4: Negative Price**

```json
{"id":"1","name":"Test Product","price":-5.00}
```

**Expected Error:** "Invalid price: must be greater than 0"

---

### **Invalid 5: Zero Price**

```json
{"id":"1","name":"Test Product","price":0}
```

**Expected Error:** "Invalid price: must be greater than 0"

---

### **Invalid 6: Not JSON**

```
This is just plain text, not JSON
```

**Expected Error:** "Failed to parse QR code: Unexpected token..."

---

### **Invalid 7: Malformed JSON**

```json
{"id":"1","name":"Test Product","price":11.25
```

**Expected Error:** "Failed to parse QR code: Unexpected end of JSON input"

---

## 🔧 **Weight Validation Samples**

Use these with ESP32 weight sensor for testing weight validation.

### **Sample 1: 500g Product**

```json
{"id":"w1","name":"500g Product","price":10.00,"weight":0.5}
```

**Test:**
1. Place 500g item on scale
2. Wait for weight to stabilize (~0.50 kg)
3. Scan QR code
4. Should succeed (weight matches)

---

### **Sample 2: 1kg Product**

```json
{"id":"w2","name":"1kg Product","price":15.00,"weight":1.0}
```

**Test:**
1. Place 1kg item on scale
2. Wait for weight to stabilize (~1.00 kg)
3. Scan QR code
4. Should succeed (weight matches)

---

### **Sample 3: Weight Mismatch Test**

```json
{"id":"w3","name":"Heavy Product","price":20.00,"weight":2.0}
```

**Test:**
1. Place 500g item on scale (not 2kg)
2. Scan QR code
3. Should fail with "Weight Mismatch" error

---

## 📊 **Batch Testing Samples**

For testing multiple scans in succession.

### **Batch 1: Fruits**

```json
{"id":"f1","name":"Apples","price":18.75,"category":"Fresh Produce","weight":0.8}
```

```json
{"id":"f2","name":"Bananas","price":9.50,"category":"Fresh Produce","weight":0.6}
```

```json
{"id":"f3","name":"Oranges","price":15.00,"category":"Fresh Produce","weight":0.7}
```

---

### **Batch 2: Dairy**

```json
{"id":"d1","name":"Milk","price":15.00,"category":"Dairy","weight":1.0}
```

```json
{"id":"d2","name":"Cheese","price":28.50,"category":"Dairy","weight":0.5}
```

```json
{"id":"d3","name":"Yogurt","price":12.00,"category":"Dairy","weight":0.4}
```

---

## 🎨 **Custom Product Template**

Use this template to create your own products:

```json
{
  "id": "YOUR_PRODUCT_ID",
  "name": "YOUR_PRODUCT_NAME",
  "price": 0.00,
  "category": "YOUR_CATEGORY",
  "weight": 0.0,
  "barcode": "YOUR_BARCODE"
}
```

**Replace:**
- `YOUR_PRODUCT_ID` - Unique identifier (e.g., "prod-001")
- `YOUR_PRODUCT_NAME` - Product name (e.g., "Fresh Strawberries")
- `0.00` - Price in SAR (e.g., 25.50)
- `YOUR_CATEGORY` - Category (e.g., "Fresh Produce")
- `0.0` - Weight in kg (e.g., 0.5)
- `YOUR_BARCODE` - Barcode number (optional)

---

## 📱 **Mobile Testing Tips**

1. **Print QR codes** on paper for easier testing
2. **Good lighting** - Ensure adequate lighting
3. **Steady hand** - Hold phone steady
4. **Distance** - 15-30cm from QR code is optimal
5. **Focus** - Wait for camera to focus

---

## 🖨️ **Printing QR Codes**

### **Recommended Settings:**
- **Size:** At least 3cm x 3cm
- **Resolution:** 300 DPI or higher
- **Format:** PNG or PDF
- **Color:** Black on white background

### **Print Layout:**
- Print multiple QR codes on one page
- Add product name below each QR code
- Laminate for durability

---

## 🔍 **Verification**

After generating QR codes, verify they work:

1. **Scan with phone camera** - Should show the JSON text
2. **Copy and validate JSON** - Use jsonlint.com
3. **Test in ShopPad** - Scan with the app
4. **Check cart** - Verify product appears correctly

---

## 📞 **Support**

If QR codes don't work:

1. **Verify JSON format** - Use JSON validator
2. **Check required fields** - id, name, price must be present
3. **Regenerate QR code** - Try different generator
4. **Test with sample codes** - Use samples from this document
5. **Check camera permissions** - Ensure browser has camera access

---

## ✅ **Quick Test Checklist**

- [ ] Generate at least 3 valid QR codes
- [ ] Generate at least 2 invalid QR codes (for error testing)
- [ ] Print QR codes or display on another device
- [ ] Test scanning each QR code
- [ ] Verify products appear in cart
- [ ] Test error handling with invalid codes
- [ ] Test weight validation (if enabled)

---

**Happy Scanning!** 🎉

