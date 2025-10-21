# 🚀 Render.com Deployment Guide

Complete guide to deploy the ShopPad Weight Server to Render.com for cloud hosting.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Step 1: Prepare Your Repository](#step-1-prepare-your-repository)
- [Step 2: Create Render.com Account](#step-2-create-rendercom-account)
- [Step 3: Deploy the Server](#step-3-deploy-the-server)
- [Step 4: Configure Environment Variables](#step-4-configure-environment-variables)
- [Step 5: Update ESP32 Code](#step-5-update-esp32-code)
- [Step 6: Update Frontend Code](#step-6-update-frontend-code)
- [Step 7: Test the Deployment](#step-7-test-the-deployment)
- [Troubleshooting](#troubleshooting)
- [Cost & Limitations](#cost--limitations)

---

## ✅ Prerequisites

- [x] GitHub account
- [x] Git installed locally
- [x] Server code prepared (already done!)
- [x] ESP32/ESP8266 device ready
- [x] React frontend ready

---

## 📝 Step 1: Prepare Your Repository

### 1.1 Commit All Changes

```powershell
# Make sure you're in the project root
cd c:\00-Code\Wanasishop\shoppad-interface

# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "Prepare server for Render.com deployment"

# Push to GitHub
git push origin main
```

### 1.2 Verify Files

Make sure these files exist in your repository:
- ✅ `render.yaml` - Render.com configuration
- ✅ `server/server.js` - Updated server code
- ✅ `server/config.js` - Updated configuration
- ✅ `server/package.json` - Dependencies
- ✅ `server/.gitignore` - Ignore sensitive files

---

## 🌐 Step 2: Create Render.com Account

1. **Go to:** https://render.com/
2. **Click:** "Get Started for Free"
3. **Sign up with GitHub** (recommended for easy deployment)
4. **Authorize Render** to access your GitHub repositories

---

## 🚀 Step 3: Deploy the Server

### 3.1 Create New Web Service

1. **Go to Render Dashboard:** https://dashboard.render.com/
2. **Click:** "New +" → "Web Service"
3. **Connect Repository:**
   - Select your GitHub repository: `shoppad-interface`
   - Click "Connect"

### 3.2 Configure Web Service

Fill in the following details:

| Field | Value |
|-------|-------|
| **Name** | `shoppad-weight-server` (or your choice) |
| **Region** | Choose closest to you (e.g., Oregon, Frankfurt) |
| **Branch** | `main` |
| **Root Directory** | Leave empty |
| **Environment** | `Node` |
| **Build Command** | `cd server && npm install` |
| **Start Command** | `cd server && npm start` |
| **Plan** | `Free` |

### 3.3 Advanced Settings (Optional)

- **Auto-Deploy:** Yes (deploy on git push)
- **Health Check Path:** `/status`

### 3.4 Create Web Service

Click **"Create Web Service"** button at the bottom.

Render.com will now:
1. Clone your repository
2. Run the build command
3. Start your server
4. Assign a URL (e.g., `https://shoppad-weight-server.onrender.com`)

**⏱️ This takes 2-5 minutes.**

---

## ⚙️ Step 4: Configure Environment Variables

### 4.1 Go to Environment Tab

1. In your Render dashboard, click on your service
2. Go to **"Environment"** tab
3. Add the following environment variables:

### 4.2 Required Environment Variables

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Production mode |
| `USE_HTTPS` | `false` | Render handles SSL |
| `PORT` | `10000` | Render default (auto-set) |
| `HOST` | `0.0.0.0` | Listen on all interfaces |
| `LOG_RETENTION_DAYS` | `30` | Keep logs for 30 days |
| `RATE_LIMIT_MAX_REQUESTS` | `1000` | Max requests per minute |
| `MAX_DATA_ENTRIES` | `50000` | Max data entries |

### 4.3 CORS Configuration

Add your frontend URL to allowed origins:

| Key | Value |
|-----|-------|
| `ALLOWED_ORIGINS` | `https://your-frontend-url.com,http://localhost:8080` |

**Note:** Replace `your-frontend-url.com` with your actual frontend URL (if deployed).

### 4.4 Save Changes

Click **"Save Changes"** - this will trigger a redeploy.

---

## 📱 Step 5: Update ESP32 Code

### 5.1 Get Your Render URL

After deployment, you'll get a URL like:
```
https://shoppad-weight-server.onrender.com
```

### 5.2 Update ESP32 Firmware

Open `sketch_oct19a/ESP32-We/ESP32-We.ino` and update:

```cpp
// OLD (Local server)
const char* SERVER_HOST = "10.232.200.83";
const int SERVER_PORT = 5050;

// NEW (Render.com server)
const char* SERVER_HOST = "shoppad-weight-server.onrender.com";
const int SERVER_PORT = 443;  // HTTPS port
```

### 5.3 Upload to ESP32

1. Open Arduino IDE
2. Select your ESP32 board
3. Select correct COM port
4. Click Upload

### 5.4 Monitor Serial Output

Open Serial Monitor (115200 baud) and verify:
```
✅ WiFi connected
✅ Connecting to server...
✅ HTTP Response code: 200
✅ Weight sent successfully
```

---

## 🎨 Step 6: Update Frontend Code

### 6.1 Update API Configuration

Edit `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  // OLD (Local server)
  // SERVER_URL: 'https://localhost:5050',
  
  // NEW (Render.com server)
  SERVER_URL: 'https://shoppad-weight-server.onrender.com',
  
  POLL_INTERVAL: 3000,
  TIMEOUT: 5000,
  ENABLED: true,
};
```

### 6.2 Test Locally

```powershell
npm run dev
```

Open http://localhost:8080/ and verify:
- ✅ Green "Live" badge showing
- ✅ Weight data updating
- ✅ No console errors

### 6.3 Deploy Frontend (Optional)

If you want to deploy the frontend to Vercel/Netlify:

**Vercel:**
```powershell
npm install -g vercel
vercel
```

**Netlify:**
```powershell
npm install -g netlify-cli
netlify deploy
```

---

## 🧪 Step 7: Test the Deployment

### 7.1 Test Server Health

Open in browser:
```
https://shoppad-weight-server.onrender.com/status
```

Expected response:
```json
{
  "status": "online",
  "timestamp": "2025-10-20T...",
  "uptime": 123.45,
  "environment": "production"
}
```

### 7.2 Test ESP32 Connection

1. Power on ESP32
2. Check Serial Monitor for successful connection
3. Verify weight data is being sent

### 7.3 Test Frontend Integration

1. Open your frontend
2. Verify WeightDisplay shows live data
3. Check that weight updates every 3 seconds

### 7.4 Test API Endpoints

**Get Latest Weight:**
```
https://shoppad-weight-server.onrender.com/logs?limit=1
```

**Get Statistics:**
```
https://shoppad-weight-server.onrender.com/stats
```

---

## 🐛 Troubleshooting

### Issue: Server Not Starting

**Check Logs:**
1. Go to Render Dashboard
2. Click on your service
3. Go to "Logs" tab
4. Look for error messages

**Common Fixes:**
- Verify build command is correct
- Check that all dependencies are in `package.json`
- Ensure `NODE_ENV=production` is set

### Issue: ESP32 Can't Connect

**Symptoms:** ESP32 shows connection errors

**Solutions:**
1. Verify SERVER_HOST is correct (no `https://` prefix)
2. Verify PORT is 443 (HTTPS)
3. Check that server is running (visit /status)
4. Ensure ESP32 has internet connection

### Issue: Frontend Shows "Offline"

**Solutions:**
1. Check CORS configuration (add frontend URL to ALLOWED_ORIGINS)
2. Verify API_CONFIG.SERVER_URL is correct
3. Check browser console for errors
4. Test server URL directly in browser

### Issue: Free Tier Spinning Down

**Problem:** Render free tier spins down after 15 minutes of inactivity

**Solution:** ESP32 sending data every 10 seconds keeps it active! ✅

**Alternative:** Upgrade to paid plan ($7/month) for always-on service

### Issue: Build Fails

**Check:**
1. Node version (must be 18+)
2. Package.json has all dependencies
3. Build command is correct: `cd server && npm install`

---

## 💰 Cost & Limitations

### Free Tier

**Included:**
- ✅ 750 hours/month (enough for 24/7 with one service)
- ✅ Automatic SSL certificates
- ✅ Custom domains
- ✅ Auto-deploy from GitHub
- ✅ 512 MB RAM
- ✅ Shared CPU

**Limitations:**
- ⚠️ Spins down after 15 min inactivity (30s cold start)
  - **Not a problem for you!** ESP32 sends data every 10s
- ⚠️ Limited to 100 GB bandwidth/month
- ⚠️ Shared resources (slower performance)

### Paid Plan ($7/month)

**Benefits:**
- ✅ Always-on (no spin down)
- ✅ Faster performance
- ✅ More RAM (512 MB - 16 GB)
- ✅ Priority support

---

## 📊 Monitoring

### View Logs

**Real-time:**
1. Go to Render Dashboard
2. Click your service
3. Go to "Logs" tab

**Download Logs:**
- Logs are stored in the server (30-day retention)
- Access via `/log-files` endpoint

### Metrics

Render provides:
- CPU usage
- Memory usage
- Request count
- Response times
- Bandwidth usage

---

## 🔄 Updates & Redeployment

### Auto-Deploy

Every time you push to GitHub `main` branch, Render will automatically:
1. Pull latest code
2. Run build command
3. Restart server

### Manual Deploy

1. Go to Render Dashboard
2. Click your service
3. Click "Manual Deploy" → "Deploy latest commit"

---

## ✅ Success Checklist

- [ ] Server deployed to Render.com
- [ ] Environment variables configured
- [ ] Server health check passes (/status returns 200)
- [ ] ESP32 code updated with Render URL
- [ ] ESP32 successfully sending data
- [ ] Frontend updated with Render URL
- [ ] Frontend showing live weight data
- [ ] No errors in Render logs
- [ ] No errors in browser console

---

## 🎉 Congratulations!

Your ShopPad Weight Server is now running in the cloud! 🚀

**Your URLs:**
- **Server:** `https://shoppad-weight-server.onrender.com`
- **Health Check:** `https://shoppad-weight-server.onrender.com/status`
- **API Docs:** See README.md

**Next Steps:**
- Monitor server logs for any issues
- Consider upgrading to paid plan for better performance
- Set up custom domain (optional)
- Add monitoring/alerting (optional)

---

**Need Help?**
- Render Docs: https://render.com/docs
- Render Community: https://community.render.com/
- Project README: See main README.md

