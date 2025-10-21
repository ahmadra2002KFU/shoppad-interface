# ⚡ QR Code Scanner - Quick Start Guide

Get started with QR code scanning in 5 minutes!

---

## 🚀 **For Users (Customers)**

### **Step 1: Open the App**
Navigate to: `http://138.68.137.154:8080/`

### **Step 2: Click "Scan QR Code"**
Look for the button at the top of the page

### **Step 3: Allow Camera Access**
Click "Allow" when browser asks for camera permission

### **Step 4: Scan a Product**
Position the QR code within the camera frame

### **Step 5: Done!**
Product automatically added to cart with a beep sound

---

## 🛠️ **For Developers (Deployment)**

### **Quick Deploy to DigitalOcean**

```bash
# 1. SSH into Droplet
ssh root@138.68.137.154

# 2. Navigate to project
cd /WanasishShop/shoppad-interface

# 3. Pull latest code
git pull origin main

# 4. Install dependencies
npm install

# 5. Build
npm run build

# 6. Restart server
pm2 restart shoppad-frontend

# 7. Verify
pm2 status
```

**Done!** Visit `http://138.68.137.154:8080/` to test.

---

## 📱 **Generate Test QR Code**

### **Quick Test**

1. Go to: https://www.qr-code-generator.com/
2. Select "Text" type
3. Paste this:
   ```json
   {"id":"1","name":"Fresh Tomatoes","price":11.25,"weight":0.5}
   ```
4. Download QR code
5. Scan with the app

---

## ✅ **Verify It Works**

1. ✅ Scanner opens when clicking button
2. ✅ Camera feed is visible
3. ✅ QR code is detected
4. ✅ Beep sound plays
5. ✅ Product appears in cart
6. ✅ Scanner closes automatically

---

## 🐛 **Quick Troubleshooting**

### **Camera doesn't start?**
- Allow camera permission in browser
- Try different browser (Chrome recommended)
- Check if HTTPS is enabled

### **QR code not detected?**
- Ensure good lighting
- Hold QR code steady
- Distance: 15-30cm from camera
- Use high-quality QR code (min 3cm x 3cm)

### **"Invalid QR Code" error?**
- Verify JSON format is correct
- Check required fields: id, name, price
- Use sample QR codes for testing

---

## 📚 **More Information**

- **Full Documentation:** See `QR_CODE_INTEGRATION.md`
- **Testing Guide:** See `QR_CODE_TESTING_GUIDE.md`
- **Sample QR Codes:** See `QR_CODE_SAMPLES.md`
- **Deployment Guide:** See `QR_CODE_DEPLOYMENT.md`

---

## 🎯 **QR Code Format (Quick Reference)**

### **Minimal (Required Fields Only)**
```json
{"id":"1","name":"Product Name","price":9.99}
```

### **Complete (All Fields)**
```json
{
  "id":"1",
  "name":"Product Name",
  "price":9.99,
  "category":"Category",
  "weight":0.5,
  "barcode":"1234567890123"
}
```

---

## 💡 **Pro Tips**

1. **Print QR codes** at 300 DPI or higher
2. **Minimum size:** 3cm x 3cm
3. **Laminate** for durability
4. **Good lighting** improves scan speed
5. **Test first** with sample QR codes

---

## 📞 **Need Help?**

1. Check browser console (F12) for errors
2. Review documentation files
3. Test with sample QR codes
4. Verify camera permissions

---

**That's it! You're ready to scan QR codes!** 🎉

