# 🚀 Barcode Scanner Deployment Guide

Complete deployment guide for the barcode scanning feature.

---

## 📋 **Quick Deployment**

### **5-Minute Deploy**

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

**Test:** Visit `http://138.68.137.154:8080/` and click "Scan Barcode"

---

## 📦 **Prerequisites**

### **Server Requirements**

- ✅ Node.js 18+ installed
- ✅ npm 9+ installed
- ✅ Git installed
- ✅ PM2 process manager
- ✅ Sufficient disk space (~500 MB)

### **Dependencies**

New packages added:
- `@zxing/library` - Barcode detection
- `@zxing/browser` - Browser integration

---

## 🔧 **Detailed Deployment Steps**

### **Step 1: Backup Current Production**

```bash
# SSH into Droplet
ssh root@138.68.137.154

# Create backup
cd /WanasishShop
tar -czf shoppad-backup-$(date +%Y%m%d-%H%M%S).tar.gz shoppad-interface/

# Verify backup
ls -lh shoppad-backup-*.tar.gz
```

**Checklist:**
- [ ] Backup created
- [ ] Backup size verified (should be ~100-200 MB)

---

### **Step 2: Pull Latest Code**

```bash
# Navigate to project
cd /WanasishShop/shoppad-interface

# Check current status
git status

# Stash any local changes
git stash

# Pull latest code
git pull origin main

# Verify pull
git log -1
```

**Checklist:**
- [ ] Git pull successful
- [ ] Latest commit matches local repository
- [ ] No merge conflicts

---

### **Step 3: Install Dependencies**

```bash
# Install new dependencies
npm install

# Verify @zxing packages installed
npm list @zxing/library
npm list @zxing/browser
```

**Expected Output:**
```
shoppad-interface@0.0.0
├── @zxing/browser@0.1.4
└── @zxing/library@0.21.3
```

**Checklist:**
- [ ] `npm install` completed successfully
- [ ] `@zxing/library` installed
- [ ] `@zxing/browser` installed
- [ ] No dependency errors

---

### **Step 4: Build Frontend**

```bash
# Build for production
npm run build

# Check build output
ls -lh dist/
```

**Expected Output:**
```
✓ built in ~8 seconds
dist/assets/index-*.js  ~1.1 MB
```

**Checklist:**
- [ ] Build completed successfully
- [ ] `dist/` folder created
- [ ] No build errors
- [ ] Bundle size reasonable (~1.1 MB)

---

### **Step 5: Restart Server**

```bash
# Check current PM2 status
pm2 status

# Restart frontend
pm2 restart shoppad-frontend

# Save PM2 configuration
pm2 save

# Check logs
pm2 logs shoppad-frontend --lines 20
```

**Checklist:**
- [ ] PM2 restart successful
- [ ] Server status: `online`
- [ ] No errors in logs
- [ ] Server responding

---

### **Step 6: Verify Deployment**

```bash
# Test from server
curl http://localhost:8080

# Check if barcode scanner files exist
ls -la src/components/BarcodeScanner.tsx
ls -la src/hooks/useBarcodeScanner.ts
ls -la src/utils/barcodeParser.ts
ls -la src/types/barcode.ts
```

**Checklist:**
- [ ] Server responds to curl
- [ ] All barcode scanner files present
- [ ] No 404 errors

---

## 🧪 **Post-Deployment Testing**

### **Test 1: Frontend Access**

**Action:** Open `http://138.68.137.154:8080/` in browser

**Verify:**
- [ ] Page loads successfully
- [ ] No console errors (F12)
- [ ] UI renders correctly
- [ ] "Scan Barcode" button visible

---

### **Test 2: Barcode Scanner Opens**

**Action:** Click "Scan Barcode" button

**Verify:**
- [ ] Scanner modal opens
- [ ] Camera permission prompt appears
- [ ] No JavaScript errors

---

### **Test 3: Camera Access**

**Action:** Allow camera access

**Verify:**
- [ ] Camera feed starts
- [ ] Video preview visible
- [ ] Scanning indicator shows
- [ ] No errors in console

---

### **Test 4: Barcode Scanning**

**Action:** Scan test barcode `6001234567890`

**Verify:**
- [ ] Barcode detected
- [ ] Beep sound plays
- [ ] Success message shows
- [ ] "Fresh Tomatoes" added to cart
- [ ] Scanner closes automatically

---

### **Test 5: Mobile Testing**

**Action:** Open on mobile device

**Verify:**
- [ ] Page responsive on mobile
- [ ] "Scan Barcode" button accessible
- [ ] Camera opens (back camera)
- [ ] Barcode scanning works
- [ ] Touch interactions work

---

## 🔍 **Verification Checklist**

### **Server Health**

```bash
# Check PM2 status
pm2 status

# Check memory usage
pm2 monit

# Check logs
pm2 logs shoppad-frontend --lines 50
```

**Verify:**
- [ ] Server status: `online`
- [ ] Memory usage: < 200 MB
- [ ] CPU usage: < 10%
- [ ] No error logs

---

### **Network Connectivity**

```bash
# Test server endpoint
curl http://138.68.137.154:8080

# Test from external network (use phone on cellular data)
```

**Verify:**
- [ ] Server accessible from Droplet
- [ ] Server accessible from local network
- [ ] Server accessible from external network
- [ ] No firewall blocking

---

### **Browser Compatibility**

Test on multiple browsers:

- [ ] Chrome (Desktop)
- [ ] Chrome (Mobile)
- [ ] Firefox (Desktop)
- [ ] Firefox (Mobile)
- [ ] Safari (Desktop)
- [ ] Safari (Mobile)
- [ ] Edge (Desktop)

---

## 🐛 **Troubleshooting**

### **Issue: Build Fails**

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

### **Issue: Camera Not Working**

**Possible Causes:**
- HTTPS not enabled
- Browser permissions denied
- Camera in use by another app

**Solution:**
- [ ] Verify HTTPS enabled
- [ ] Check browser permissions
- [ ] Close other camera apps
- [ ] Try different browser

---

### **Issue: Barcode Not Detected**

**Possible Causes:**
- Poor lighting
- Low-quality barcode
- Barcode too small

**Solution:**
- [ ] Improve lighting
- [ ] Use high-quality barcode (300 DPI)
- [ ] Ensure barcode is at least 3cm wide
- [ ] Hold steady at 15-30cm distance

---

### **Issue: Server Not Responding**

**Solution:**
```bash
pm2 restart shoppad-frontend
pm2 logs shoppad-frontend
```

---

## 📊 **Performance Monitoring**

### **Metrics to Monitor**

| Metric | Target | Command |
|--------|--------|---------|
| Memory Usage | < 200 MB | `pm2 monit` |
| CPU Usage | < 10% | `pm2 monit` |
| Response Time | < 100ms | `curl -w "@-" http://localhost:8080` |
| Uptime | 99.9% | `pm2 status` |

---

## 🔄 **Rollback Procedure**

If deployment fails:

```bash
# 1. Stop current server
pm2 stop shoppad-frontend

# 2. Restore from backup
cd /WanasishShop
tar -xzf shoppad-backup-[timestamp].tar.gz

# 3. Reinstall dependencies
cd shoppad-interface
npm install

# 4. Rebuild
npm run build

# 5. Restart server
pm2 restart shoppad-frontend
```

---

## 📝 **Post-Deployment Tasks**

### **Immediate (Day 1)**

- [ ] Monitor server logs for errors
- [ ] Test with real barcodes
- [ ] Print product barcodes
- [ ] Train staff on usage

### **Short-term (Week 1)**

- [ ] Generate all product barcodes
- [ ] Print and laminate barcodes
- [ ] Place barcodes on products
- [ ] Gather user feedback
- [ ] Monitor performance metrics

### **Long-term (Month 1)**

- [ ] Analyze usage statistics
- [ ] Optimize based on feedback
- [ ] Plan future enhancements
- [ ] Update documentation

---

## ✅ **Deployment Checklist**

### **Pre-Deployment**

- [ ] Code tested locally
- [ ] Build successful
- [ ] All dependencies installed
- [ ] Documentation reviewed
- [ ] Backup created

### **Deployment**

- [ ] Code pulled from Git
- [ ] Dependencies installed
- [ ] Build completed
- [ ] Server restarted
- [ ] Logs checked

### **Post-Deployment**

- [ ] Frontend accessible
- [ ] Barcode scanner works
- [ ] Camera access works
- [ ] Products scannable
- [ ] Mobile tested
- [ ] No console errors

---

## 🎯 **Success Criteria**

- ✅ All deployment steps completed
- ✅ All tests passed
- ✅ No critical errors
- ✅ Server stable
- ✅ Barcode scanner functional
- ✅ Mobile compatible
- ✅ Performance acceptable

---

## 📞 **Support**

### **Technical Issues**
- Check: `BARCODE_INTEGRATION.md` (Troubleshooting section)
- Review: Server logs (`pm2 logs`)
- Test: Sample barcodes (`BARCODE_SAMPLES.md`)

### **Documentation**
- Integration: `BARCODE_INTEGRATION.md`
- Testing: `BARCODE_TESTING_GUIDE.md`
- Samples: `BARCODE_SAMPLES.md`

---

**Deployment Date:** _________________  
**Version:** 1.5.0  
**Status:** ✅ **READY**

