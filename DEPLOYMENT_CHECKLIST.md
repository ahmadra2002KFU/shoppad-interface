# 🚀 DigitalOcean Deployment Checklist

Use this checklist to ensure a successful deployment to DigitalOcean.

---

## 📋 Pre-Deployment

### DigitalOcean Account Setup
- [ ] Create DigitalOcean account
- [ ] Add payment method
- [ ] Generate SSH key (if using SSH authentication)

### Domain Setup (Optional but Recommended)
- [ ] Purchase domain name
- [ ] Add domain to DigitalOcean
- [ ] Create A record pointing to Droplet IP
- [ ] Wait for DNS propagation (5-30 minutes)

---

## 🖥️ Droplet Creation

- [ ] Create new Droplet
  - [ ] Choose region (closest to your location)
  - [ ] Select Ubuntu 22.04 LTS
  - [ ] Choose $6/month plan (1GB RAM)
  - [ ] Add SSH key or set root password
  - [ ] Set hostname: `shoppad-server`
- [ ] Note Droplet IP address: `___________________`
- [ ] Test SSH connection: `ssh root@YOUR_IP`

---

## 🔧 Server Setup

### Initial Configuration
- [ ] Connect to Droplet via SSH
- [ ] Update system: `apt update && apt upgrade -y`
- [ ] Create non-root user: `adduser shoppad`
- [ ] Add user to sudo group: `usermod -aG sudo shoppad`
- [ ] Switch to new user: `su - shoppad`

### Install Dependencies
- [ ] Install Node.js 18.x
- [ ] Install Git
- [ ] Install PM2
- [ ] Install Nginx (if using reverse proxy)
- [ ] Install Certbot (if using Let's Encrypt)

**Quick Install:**
```bash
cd ~/shoppad-interface/server
chmod +x deploy.sh
./deploy.sh
```

---

## 📦 Application Deployment

### Clone Repository
- [ ] Clone repository: `git clone https://github.com/ahmadra2002KFU/shoppad-interface.git`
- [ ] Navigate to server: `cd shoppad-interface/server`
- [ ] Install dependencies: `npm install`

### Configure Environment
- [ ] Copy production env: `cp .env.production .env`
- [ ] Edit .env file: `nano .env`
- [ ] Update `ALLOWED_ORIGINS` with your domain
- [ ] Update other settings as needed
- [ ] Save and exit

### Generate SSL Certificates
- [ ] Generate self-signed certs: `npm run generate-certs`
- [ ] OR configure Let's Encrypt (see below)

---

## 🔒 SSL Certificate Setup

### Option A: Let's Encrypt (with Domain)
- [ ] Configure Nginx (copy from `nginx-config.conf`)
- [ ] Update domain in Nginx config
- [ ] Test Nginx config: `sudo nginx -t`
- [ ] Restart Nginx: `sudo systemctl restart nginx`
- [ ] Run Certbot: `sudo certbot --nginx -d shoppad.yourdomain.com`
- [ ] Verify certificate: `curl https://shoppad.yourdomain.com/status`

### Option B: Self-Signed (with IP)
- [ ] Certificates already generated
- [ ] Note: ESP32 will need `client.setInsecure()`

---

## ⚙️ Process Manager (PM2)

- [ ] Start application: `pm2 start server.js --name shoppad-server`
- [ ] Save PM2 list: `pm2 save`
- [ ] Setup startup: `pm2 startup` (run the command it outputs)
- [ ] Verify status: `pm2 status`
- [ ] Check logs: `pm2 logs shoppad-server`

**Quick Start:**
```bash
chmod +x production-start.sh
./production-start.sh
```

---

## 🔥 Firewall Configuration

- [ ] Allow SSH: `sudo ufw allow OpenSSH`
- [ ] Allow HTTP: `sudo ufw allow 80/tcp`
- [ ] Allow HTTPS: `sudo ufw allow 443/tcp`
- [ ] Allow custom port: `sudo ufw allow 5050/tcp`
- [ ] Enable firewall: `sudo ufw enable`
- [ ] Check status: `sudo ufw status`

---

## 📱 ESP32 Configuration

- [ ] Open `sketch_oct19a/ESP32-We/ESP32-We.ino`
- [ ] Update `SERVER_HOST` with your domain or IP
- [ ] Update `SERVER_PORT` (443 for Nginx, 5050 for direct)
- [ ] If using self-signed cert, add `client.setInsecure()` in setup()
- [ ] Upload to ESP32
- [ ] Open Serial Monitor
- [ ] Verify connection successful
- [ ] Check server logs for incoming data

**Example Configuration:**
```cpp
const char* SERVER_HOST = "shoppad.yourdomain.com";
const int SERVER_PORT = 443;
```

---

## 🎨 Frontend Configuration

- [ ] Open `src/config/api.ts`
- [ ] Update `SERVER_URL` with your domain or IP
- [ ] OR create `.env` file with `VITE_SERVER_URL`
- [ ] Test locally: `npm run dev`
- [ ] Verify connection to production server
- [ ] Deploy frontend (Vercel, Netlify, etc.)

**Example Configuration:**
```typescript
SERVER_URL: 'https://shoppad.yourdomain.com'
```

---

## 🧪 Testing

### Server Health Check
- [ ] Test from local machine: `curl https://shoppad.yourdomain.com/status`
- [ ] Expected response: `{"status":"online",...}`

### ESP32 Connection
- [ ] ESP32 connects to WiFi
- [ ] ESP32 sends data to server
- [ ] Server receives and stores data
- [ ] Check server logs: `pm2 logs shoppad-server`

### Frontend Connection
- [ ] Frontend loads without errors
- [ ] WeightDisplay shows "Live" badge
- [ ] Weight updates every 3 seconds
- [ ] No console errors

### End-to-End Test
- [ ] Place weight on sensor
- [ ] ESP32 sends data
- [ ] Server receives and stores
- [ ] Frontend displays updated weight
- [ ] All within 10-13 seconds

---

## 📊 Monitoring Setup

### PM2 Monitoring
- [ ] View logs: `pm2 logs shoppad-server`
- [ ] Monitor resources: `pm2 monit`
- [ ] Check status: `pm2 status`

### Server Logs
- [ ] Check application logs: `cd ~/shoppad-interface/server/logs`
- [ ] View latest log: `tail -f weight-server-$(date +%Y-%m-%d).log`

### System Monitoring
- [ ] Check disk space: `df -h`
- [ ] Check memory: `free -h`
- [ ] Check CPU: `top`

---

## 🔄 Backup Strategy

- [ ] Create backup script
- [ ] Schedule daily backups (cron)
- [ ] Test restore procedure
- [ ] Store backups off-server

**Quick Backup:**
```bash
cd ~/shoppad-interface/server
tar -czf backup-$(date +%Y%m%d).tar.gz data/ logs/
```

---

## 📚 Documentation

- [ ] Document your domain/IP
- [ ] Document SSH access details
- [ ] Document any custom configurations
- [ ] Share access with team members
- [ ] Update README with production URLs

---

## ✅ Post-Deployment Verification

### Server
- [ ] Server is running: `pm2 status`
- [ ] No errors in logs: `pm2 logs shoppad-server --lines 50`
- [ ] Health check passes: `curl https://your-domain.com/status`
- [ ] SSL certificate valid (if using Let's Encrypt)

### ESP32
- [ ] Connects to WiFi successfully
- [ ] Sends data every 10 seconds
- [ ] No connection errors in Serial Monitor
- [ ] Data appears in server logs

### Frontend
- [ ] Loads without errors
- [ ] Connects to production server
- [ ] Displays live weight data
- [ ] Updates every 3 seconds
- [ ] No console errors

### Performance
- [ ] Response time < 100ms
- [ ] No memory leaks
- [ ] CPU usage < 50%
- [ ] Disk space sufficient

---

## 🆘 Troubleshooting

### Server Won't Start
- [ ] Check PM2 logs: `pm2 logs shoppad-server`
- [ ] Check port availability: `sudo lsof -i :5050`
- [ ] Check .env configuration
- [ ] Restart: `pm2 restart shoppad-server`

### ESP32 Can't Connect
- [ ] Verify SERVER_HOST is correct
- [ ] Check firewall allows port
- [ ] Test server: `curl https://your-domain.com/status`
- [ ] Check SSL configuration

### Frontend Can't Connect
- [ ] Check CORS configuration
- [ ] Verify SSL certificate
- [ ] Check browser console
- [ ] Test API: `curl https://your-domain.com/logs?limit=1`

---

## 📞 Support Resources

- [ ] [DigitalOcean Documentation](https://docs.digitalocean.com/)
- [ ] [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [ ] [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [ ] [DIGITALOCEAN_DEPLOYMENT.md](DIGITALOCEAN_DEPLOYMENT.md)

---

## 🎉 Deployment Complete!

Once all items are checked, your ShopPad server is successfully deployed!

**Your Production URLs:**
- Server: `https://___________________`
- Frontend: `https://___________________`
- Droplet IP: `___________________`

**Next Steps:**
- Monitor server performance
- Set up automated backups
- Configure monitoring alerts
- Plan for scaling if needed

---

**Deployment Date:** ___________________  
**Deployed By:** ___________________  
**Notes:** ___________________

