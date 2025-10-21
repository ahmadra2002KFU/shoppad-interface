# 🚀 DigitalOcean Droplet Deployment Guide

Complete guide to deploy the ShopPad Interface HTTPS server on a DigitalOcean Droplet.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Create DigitalOcean Droplet](#create-digitalocean-droplet)
3. [Initial Server Setup](#initial-server-setup)
4. [Install Dependencies](#install-dependencies)
5. [Deploy Application](#deploy-application)
6. [Configure SSL Certificate](#configure-ssl-certificate)
7. [Setup Process Manager (PM2)](#setup-process-manager-pm2)
8. [Configure Firewall](#configure-firewall)
9. [Update ESP32 Configuration](#update-esp32-configuration)
10. [Update Frontend Configuration](#update-frontend-configuration)
11. [Testing](#testing)
12. [Monitoring & Maintenance](#monitoring--maintenance)

---

## 📦 Prerequisites

### What You Need

- ✅ DigitalOcean account (sign up at https://www.digitalocean.com)
- ✅ Domain name (optional but recommended) - e.g., `shoppad.yourdomain.com`
- ✅ SSH client (built-in on Windows 10+, Mac, Linux)
- ✅ Basic command line knowledge

### Estimated Costs

- **Droplet:** $6/month (Basic - 1GB RAM, 1 vCPU, 25GB SSD)
- **Domain:** $10-15/year (optional)
- **Total:** ~$6-8/month

---

## 🖥️ Create DigitalOcean Droplet

### Step 1: Create New Droplet

1. **Log in to DigitalOcean**
2. **Click "Create" → "Droplets"**
3. **Choose Configuration:**

   **Region:** Choose closest to your location
   - Example: New York, San Francisco, London, etc.

   **Image:** Ubuntu 22.04 LTS x64

   **Droplet Size:** Basic - $6/month
   - 1 GB RAM / 1 vCPU
   - 25 GB SSD
   - 1000 GB transfer

   **Authentication:** SSH Key (recommended) or Password
   - If SSH Key: Add your public key
   - If Password: You'll receive root password via email

   **Hostname:** `shoppad-server` (or your choice)

4. **Click "Create Droplet"**
5. **Wait 1-2 minutes** for droplet creation
6. **Note your Droplet's IP address** (e.g., `164.92.123.45`)

---

## 🔧 Initial Server Setup

### Step 1: Connect to Your Droplet

**Windows (PowerShell):**
```powershell
ssh root@YOUR_DROPLET_IP
```

**Mac/Linux:**
```bash
ssh root@YOUR_DROPLET_IP
```

Accept the fingerprint when prompted (type `yes`).

### Step 2: Update System

```bash
apt update && apt upgrade -y
```

### Step 3: Create Non-Root User (Security Best Practice)

```bash
# Create new user
adduser shoppad

# Add to sudo group
usermod -aG sudo shoppad

# Switch to new user
su - shoppad
```

---

## 📥 Install Dependencies

### Step 1: Install Node.js (v18 LTS)

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x
```

### Step 2: Install Git

```bash
sudo apt install -y git
```

### Step 3: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### Step 4: Install Nginx (Reverse Proxy)

```bash
sudo apt install -y nginx
```

### Step 5: Install Certbot (SSL Certificates)

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## 🚀 Deploy Application

### Step 1: Clone Repository

```bash
# Navigate to home directory
cd ~

# Clone your repository
git clone https://github.com/ahmadra2002KFU/shoppad-interface.git

# Navigate to server directory
cd shoppad-interface/server
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

```bash
# Create production environment file
nano .env
```

Add the following:
```env
NODE_ENV=production
PORT=5050
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
LOG_LEVEL=info
MAX_LOG_SIZE=10485760
LOG_RETENTION_DAYS=30
```

Save and exit (Ctrl+X, then Y, then Enter).

### Step 4: Generate SSL Certificates (Self-Signed for Testing)

```bash
npm run generate-certs
```

**Note:** For production, we'll use Let's Encrypt certificates (see next section).

---

## 🔒 Configure SSL Certificate (Let's Encrypt)

### Option A: With Domain Name (Recommended)

**Prerequisites:**
- You own a domain (e.g., `yourdomain.com`)
- Domain DNS points to your Droplet IP

**Steps:**

1. **Configure Nginx:**
```bash
sudo nano /etc/nginx/sites-available/shoppad
```

Add:
```nginx
server {
    listen 80;
    server_name shoppad.yourdomain.com;

    location / {
        proxy_pass https://localhost:5050;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

2. **Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/shoppad /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

3. **Get SSL Certificate:**
```bash
sudo certbot --nginx -d shoppad.yourdomain.com
```

Follow prompts:
- Enter email address
- Agree to terms
- Choose to redirect HTTP to HTTPS (option 2)

### Option B: Without Domain (IP Address Only)

You'll use self-signed certificates (already generated in previous step).

**Note:** ESP32 will need to skip certificate validation.

---

## ⚙️ Setup Process Manager (PM2)

### Step 1: Start Application with PM2

```bash
cd ~/shoppad-interface/server
pm2 start server.js --name shoppad-server
```

### Step 2: Configure PM2 Startup

```bash
# Save PM2 process list
pm2 save

# Generate startup script
pm2 startup

# Copy and run the command it outputs (starts with 'sudo env PATH=...')
```

### Step 3: Verify PM2 Status

```bash
pm2 status
pm2 logs shoppad-server
```

---

## 🔥 Configure Firewall

### Step 1: Setup UFW (Uncomplicated Firewall)

```bash
# Allow SSH (important - don't lock yourself out!)
sudo ufw allow OpenSSH

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Allow custom port (if not using Nginx)
sudo ufw allow 5050/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## 📱 Update ESP32 Configuration

Update your ESP32 code with the new server details:

```cpp
// WiFi credentials (unchanged)
const char* WIFI_SSID = "ABC";
const char* WIFI_PASSWORD = "ahmad123";

// Server configuration - UPDATE THESE
const char* SERVER_HOST = "shoppad.yourdomain.com";  // Or your Droplet IP
const int SERVER_PORT = 443;  // Standard HTTPS port (if using Nginx)
// OR
const int SERVER_PORT = 5050;  // Direct connection (if not using Nginx)
const char* SERVER_ENDPOINT = "/weight";

// SSL Configuration
// If using Let's Encrypt (with domain):
// No changes needed - ESP32 will validate certificate

// If using IP address (self-signed):
// Add this in setup():
// client.setInsecure();  // Skip certificate validation
```

---

## 🎨 Update Frontend Configuration

Update `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  SERVER_URL: import.meta.env.VITE_SERVER_URL || 'https://shoppad.yourdomain.com',
  // OR if using IP:
  // SERVER_URL: import.meta.env.VITE_SERVER_URL || 'https://164.92.123.45:5050',
  POLL_INTERVAL: 3000,
  TIMEOUT: 5000,
  ENABLED: true,
};
```

Or create `.env` file:
```env
VITE_SERVER_URL=https://shoppad.yourdomain.com
```

---

## 🧪 Testing

### Test 1: Server Health Check

```bash
# From your local machine
curl https://shoppad.yourdomain.com/status
# OR
curl -k https://YOUR_DROPLET_IP:5050/status
```

Expected response:
```json
{"status":"online","timestamp":"...","uptime":...}
```

### Test 2: ESP32 Connection

1. Upload updated code to ESP32
2. Open Serial Monitor
3. Check for successful connection messages
4. Verify weight data is being sent

### Test 3: Frontend Connection

1. Update frontend configuration
2. Run `npm run dev`
3. Open browser
4. Check WeightDisplay shows "Live" badge
5. Verify weight updates every 3 seconds

---

## 📊 Monitoring & Maintenance

### PM2 Commands

```bash
# View logs
pm2 logs shoppad-server

# Restart application
pm2 restart shoppad-server

# Stop application
pm2 stop shoppad-server

# View metrics
pm2 monit

# View process info
pm2 info shoppad-server
```

### Server Logs

```bash
# View application logs
cd ~/shoppad-interface/server/logs
ls -lh
tail -f weight-server-YYYY-MM-DD.log
```

### System Monitoring

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check network connections
netstat -tulpn | grep 5050
```

### Update Application

```bash
cd ~/shoppad-interface
git pull origin main
cd server
npm install
pm2 restart shoppad-server
```

---

## 🔄 Backup & Recovery

### Backup Data

```bash
# Backup weight data
cd ~/shoppad-interface/server
tar -czf backup-$(date +%Y%m%d).tar.gz data/ logs/

# Download to local machine (from your PC)
scp shoppad@YOUR_DROPLET_IP:~/shoppad-interface/server/backup-*.tar.gz ./
```

### Restore Data

```bash
cd ~/shoppad-interface/server
tar -xzf backup-YYYYMMDD.tar.gz
pm2 restart shoppad-server
```

---

## 🆘 Troubleshooting

### Server Not Starting

```bash
# Check PM2 logs
pm2 logs shoppad-server --lines 100

# Check if port is in use
sudo lsof -i :5050

# Restart PM2
pm2 restart shoppad-server
```

### ESP32 Cannot Connect

1. Check firewall allows port 5050
2. Verify SERVER_HOST is correct
3. Check SSL certificate (use `client.setInsecure()` for testing)
4. Check server logs for connection attempts

### Frontend Cannot Connect

1. Check CORS configuration in `server/config.js`
2. Verify SSL certificate is valid
3. Check browser console for errors
4. Test API endpoint directly with curl

---

## 📚 Additional Resources

- [DigitalOcean Documentation](https://docs.digitalocean.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

---

## ✅ Deployment Checklist

- [ ] DigitalOcean Droplet created
- [ ] SSH access configured
- [ ] System updated
- [ ] Node.js installed
- [ ] Application deployed
- [ ] SSL certificate configured
- [ ] PM2 configured and running
- [ ] Firewall configured
- [ ] ESP32 code updated
- [ ] Frontend code updated
- [ ] All tests passing
- [ ] Monitoring setup
- [ ] Backup strategy in place

---

**Deployment completed!** Your ShopPad server is now running on DigitalOcean! 🎉

