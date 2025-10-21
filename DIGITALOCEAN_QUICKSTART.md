# 🚀 DigitalOcean Quick Start Guide

**Get your ShopPad server running on DigitalOcean in 15 minutes!**

---

## 📋 What You'll Need

- DigitalOcean account ($6/month)
- Domain name (optional, ~$10/year)
- 15 minutes of your time

---

## ⚡ Quick Deployment (3 Steps)

### Step 1: Create Droplet (2 minutes)

1. Log in to [DigitalOcean](https://www.digitalocean.com)
2. Click **"Create" → "Droplets"**
3. Choose:
   - **Image:** Ubuntu 22.04 LTS
   - **Plan:** Basic $6/month (1GB RAM)
   - **Region:** Closest to you
   - **Authentication:** SSH Key or Password
4. Click **"Create Droplet"**
5. **Note your IP:** `164.92.123.45` (example)

### Step 2: Run Deployment Script (10 minutes)

```bash
# Connect to your Droplet
ssh root@YOUR_DROPLET_IP

# Create user and switch
adduser shoppad
usermod -aG sudo shoppad
su - shoppad

# Clone repository
git clone https://github.com/ahmadra2002KFU/shoppad-interface.git
cd shoppad-interface/server

# Run automated deployment
chmod +x deploy.sh
./deploy.sh
```

The script will automatically:
- ✅ Update system
- ✅ Install Node.js, Git, PM2, Nginx, Certbot
- ✅ Install dependencies
- ✅ Generate SSL certificates
- ✅ Configure firewall
- ✅ Start server with PM2

### Step 3: Configure & Test (3 minutes)

```bash
# Edit environment file
nano .env
# Update ALLOWED_ORIGINS with your domain

# Restart server
pm2 restart shoppad-server

# Test server
curl -k https://localhost:5050/status
```

**Expected response:**
```json
{"status":"online","timestamp":"..."}
```

---

## 🎯 Update Your Devices

### ESP32 Configuration

Edit `sketch_oct19a/ESP32-We/ESP32-We.ino`:

```cpp
// Change this line:
const char* SERVER_HOST = "10.232.200.83";

// To your Droplet IP:
const char* SERVER_HOST = "164.92.123.45";  // Your IP

// Or your domain:
const char* SERVER_HOST = "shoppad.yourdomain.com";
```

Upload to ESP32 and verify in Serial Monitor.

### Frontend Configuration

Edit `src/config/api.ts`:

```typescript
// Change this:
SERVER_URL: 'https://localhost:5050'

// To your Droplet:
SERVER_URL: 'https://164.92.123.45:5050'

// Or your domain:
SERVER_URL: 'https://shoppad.yourdomain.com'
```

---

## 🔒 Optional: Setup Domain & SSL (5 minutes)

### If You Have a Domain:

1. **Point domain to Droplet:**
   - Go to your domain registrar
   - Add A record: `shoppad.yourdomain.com` → `YOUR_DROPLET_IP`
   - Wait 5-30 minutes for DNS propagation

2. **Configure Nginx:**
```bash
sudo nano /etc/nginx/sites-available/shoppad
```

Copy content from `server/nginx-config.conf` and update domain.

3. **Get SSL Certificate:**
```bash
sudo ln -s /etc/nginx/sites-available/shoppad /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d shoppad.yourdomain.com
```

4. **Update ESP32 & Frontend:**
```cpp
const char* SERVER_HOST = "shoppad.yourdomain.com";
const int SERVER_PORT = 443;  // Standard HTTPS
```

---

## ✅ Verify Everything Works

### 1. Server Health
```bash
curl https://YOUR_DOMAIN_OR_IP:5050/status
```

### 2. ESP32 Connection
- Open Serial Monitor
- Should see: "WiFi connected" and "HTTP Response: 200"

### 3. Frontend Connection
- Open browser to your frontend
- WeightDisplay should show green "Live" badge
- Weight should update every 3 seconds

---

## 📊 Useful Commands

```bash
# View server logs
pm2 logs shoppad-server

# Restart server
pm2 restart shoppad-server

# Check server status
pm2 status

# Monitor resources
pm2 monit

# Update application
cd ~/shoppad-interface
git pull origin main
cd server
npm install
pm2 restart shoppad-server
```

---

## 🆘 Troubleshooting

### Server not accessible from outside

```bash
# Check firewall
sudo ufw status

# Allow port 5050
sudo ufw allow 5050/tcp
```

### ESP32 can't connect

```cpp
// Add this in setup() if using IP address:
client.setInsecure();  // Skip SSL validation
```

### Frontend shows "Offline"

1. Check CORS in `server/config.js`
2. Add your frontend domain to `ALLOWED_ORIGINS`
3. Restart server: `pm2 restart shoppad-server`

---

## 📚 Full Documentation

For detailed information, see:
- **[DIGITALOCEAN_DEPLOYMENT.md](DIGITALOCEAN_DEPLOYMENT.md)** - Complete deployment guide
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Step-by-step checklist
- **[README.md](README.md)** - Main documentation

---

## 💰 Cost Breakdown

| Item | Cost | Notes |
|------|------|-------|
| DigitalOcean Droplet | $6/month | 1GB RAM, 25GB SSD |
| Domain (optional) | $10-15/year | Any registrar |
| SSL Certificate | FREE | Let's Encrypt |
| **Total** | **~$6-8/month** | Production-ready |

---

## 🎉 You're Done!

Your ShopPad server is now running on DigitalOcean!

**Your Production Setup:**
- ✅ Server running 24/7
- ✅ HTTPS encryption
- ✅ Auto-restart on reboot
- ✅ Log management
- ✅ Firewall protection
- ✅ Production-ready

**Next Steps:**
- Set up automated backups
- Configure monitoring alerts
- Deploy frontend to Vercel/Netlify
- Add more ESP32 devices

---

**Need Help?**
- Check [DIGITALOCEAN_DEPLOYMENT.md](DIGITALOCEAN_DEPLOYMENT.md) for detailed steps
- Review [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for troubleshooting
- Check server logs: `pm2 logs shoppad-server`

