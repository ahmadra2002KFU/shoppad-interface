# 🚀 QR Code Scanner Deployment Guide

Complete guide to deploy the QR code scanner feature to DigitalOcean Droplet.

---

## 📋 **Prerequisites**

- ✅ DigitalOcean Droplet running (138.68.137.154)
- ✅ Node.js 18+ installed
- ✅ Git installed
- ✅ SSH access to Droplet
- ✅ Frontend already deployed and running

---

## 🎯 **Quick Deployment**

### **Step 1: SSH into Droplet**

```bash
ssh root@138.68.137.154
```

---

### **Step 2: Navigate to Project**

```bash
cd /WanasishShop/shoppad-interface
```

---

### **Step 3: Pull Latest Changes**

```bash
# Stash any local changes
git stash

# Pull latest code
git pull origin main

# If you stashed changes, apply them back
git stash pop
```

---

### **Step 4: Install Dependencies**

```bash
# Install new dependency (html5-qrcode)
npm install
```

**Expected output:**
```
added 72 packages, and audited 452 packages in 2s
```

---

### **Step 5: Build Frontend**

```bash
# Build for production
npm run build
```

**Expected output:**
```
vite v5.4.19 building for production...
✓ built in 5.23s
```

---

### **Step 6: Restart Frontend Server**

If using PM2:

```bash
# Restart the frontend process
pm2 restart shoppad-frontend

# Or if not using PM2, restart the dev server
# Press Ctrl+C to stop current server
npm run dev
```

---

### **Step 7: Verify Deployment**

```bash
# Check if server is running
pm2 status

# Check logs
pm2 logs shoppad-frontend --lines 20
```

---

### **Step 8: Test in Browser**

1. Open: `http://138.68.137.154:8080/`
2. Click "Scan QR Code" button
3. Allow camera access
4. Test with sample QR code

---

## 🔧 **Detailed Deployment Steps**

### **Option 1: Using Git (Recommended)**

```bash
# 1. SSH into Droplet
ssh root@138.68.137.154

# 2. Navigate to project
cd /WanasishShop/shoppad-interface

# 3. Check current status
git status

# 4. Stash local changes (if any)
git stash

# 5. Pull latest code
git pull origin main

# 6. Install dependencies
npm install

# 7. Build for production
npm run build

# 8. Restart server
pm2 restart shoppad-frontend

# 9. Save PM2 configuration
pm2 save

# 10. Check status
pm2 status
pm2 logs shoppad-frontend --lines 20
```

---

### **Option 2: Manual File Upload**

If Git is not available:

```bash
# On your local machine, create a zip of the new files
# Upload to Droplet using SCP

# From local machine:
scp -r src/components/QRScanner.tsx root@138.68.137.154:/WanasishShop/shoppad-interface/src/components/
scp -r src/hooks/useQRScanner.ts root@138.68.137.154:/WanasishShop/shoppad-interface/src/hooks/
scp -r src/utils/qrCodeParser.ts root@138.68.137.154:/WanasishShop/shoppad-interface/src/utils/
scp -r src/types/qrcode.ts root@138.68.137.154:/WanasishShop/shoppad-interface/src/types/

# Then SSH and install dependencies
ssh root@138.68.137.154
cd /WanasishShop/shoppad-interface
npm install
npm run build
pm2 restart shoppad-frontend
```

---

## 🔍 **Verification Checklist**

After deployment, verify:

### **1. Server Status**

```bash
pm2 status
```

**Expected:**
```
┌─────┬──────────────────┬─────────┬─────────┬─────────┐
│ id  │ name             │ status  │ restart │ uptime  │
├─────┼──────────────────┼─────────┼─────────┼─────────┤
│ 0   │ shoppad-frontend │ online  │ 0       │ 5m      │
└─────┴──────────────────┴─────────┴─────────┴─────────┘
```

---

### **2. Check Logs**

```bash
pm2 logs shoppad-frontend --lines 50
```

**Look for:**
- No errors
- Server running on port 8080
- No build errors

---

### **3. Test Frontend**

```bash
# From Droplet
curl http://localhost:8080

# Should return HTML
```

---

### **4. Test from Browser**

1. Open: `http://138.68.137.154:8080/`
2. Page should load without errors
3. Click "Scan QR Code"
4. Camera permission prompt should appear

---

### **5. Test QR Scanning**

1. Allow camera access
2. Generate test QR code (see QR_CODE_SAMPLES.md)
3. Scan QR code
4. Product should be added to cart

---

## 🐛 **Troubleshooting**

### **Issue 1: Dependencies Not Installed**

**Symptom:** Build fails with "Cannot find module 'html5-qrcode'"

**Solution:**
```bash
npm install html5-qrcode
npm run build
```

---

### **Issue 2: Build Errors**

**Symptom:** `npm run build` fails

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

### **Issue 3: Server Not Restarting**

**Symptom:** Changes not visible in browser

**Solution:**
```bash
# Force restart
pm2 delete shoppad-frontend
pm2 start npm --name shoppad-frontend -- run dev
pm2 save
```

---

### **Issue 4: Camera Not Working**

**Symptom:** Camera doesn't start or shows error

**Solution:**
1. Ensure HTTPS is enabled (camera API requires HTTPS)
2. Check browser permissions
3. Try different browser
4. Check console for errors

---

### **Issue 5: Port Already in Use**

**Symptom:** "EADDRINUSE: address already in use :::8080"

**Solution:**
```bash
# Find process using port 8080
sudo lsof -i :8080

# Kill the process
sudo kill -9 <PID>

# Restart server
pm2 restart shoppad-frontend
```

---

## 🔒 **HTTPS Configuration (Optional)**

For production, enable HTTPS for camera access:

### **Option 1: Using Nginx with Let's Encrypt**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate (requires domain name)
sudo certbot --nginx -d yourdomain.com

# Nginx will automatically configure HTTPS
```

---

### **Option 2: Self-Signed Certificate**

```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/nginx-selfsigned.key \
  -out /etc/ssl/certs/nginx-selfsigned.crt

# Configure Nginx to use certificate
# Edit /etc/nginx/sites-available/default
```

---

## 📊 **Performance Optimization**

### **1. Enable Gzip Compression**

In `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
});
```

---

### **2. Optimize Build**

```bash
# Build with optimization
npm run build

# Check build size
du -sh dist/
```

---

### **3. Enable Caching**

Configure Nginx to cache static assets:

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

---

## 🔄 **Rollback Procedure**

If deployment fails:

```bash
# 1. Revert to previous commit
git log --oneline  # Find previous commit hash
git reset --hard <previous-commit-hash>

# 2. Reinstall dependencies
npm install

# 3. Rebuild
npm run build

# 4. Restart server
pm2 restart shoppad-frontend
```

---

## 📈 **Monitoring**

### **Check Server Health**

```bash
# PM2 monitoring
pm2 monit

# Check memory usage
free -h

# Check disk space
df -h

# Check CPU usage
top
```

---

### **View Logs**

```bash
# Real-time logs
pm2 logs shoppad-frontend

# Last 100 lines
pm2 logs shoppad-frontend --lines 100

# Error logs only
pm2 logs shoppad-frontend --err
```

---

## ✅ **Post-Deployment Checklist**

- [ ] Code pulled from Git
- [ ] Dependencies installed (`npm install`)
- [ ] Build successful (`npm run build`)
- [ ] Server restarted (`pm2 restart`)
- [ ] Server status online (`pm2 status`)
- [ ] No errors in logs (`pm2 logs`)
- [ ] Frontend accessible (`http://138.68.137.154:8080/`)
- [ ] QR scanner button visible
- [ ] Camera access works
- [ ] QR code scanning works
- [ ] Products added to cart
- [ ] No console errors

---

## 🎉 **Success!**

Your QR code scanner is now deployed and ready to use!

**Access at:** `http://138.68.137.154:8080/`

**Next Steps:**
1. Generate product QR codes (see QR_CODE_SAMPLES.md)
2. Print QR codes for products
3. Test with real products
4. Train staff on usage
5. Monitor performance

---

## 📞 **Support**

If you encounter issues:

1. Check logs: `pm2 logs shoppad-frontend`
2. Verify dependencies: `npm list html5-qrcode`
3. Test locally first
4. Check browser console for errors
5. Verify camera permissions

---

**Deployment Complete!** 🚀

