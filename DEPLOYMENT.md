# 🚀 Deployment Checklist

Production deployment guide for ShopPad Weight Sensor System.

## 📋 Pre-Deployment Checklist

### Server Preparation

- [ ] **Environment Configuration**
  - [ ] Create `.env` file from `.env.example`
  - [ ] Set `NODE_ENV=production`
  - [ ] Configure CORS origins for production domains
  - [ ] Set appropriate rate limiting values

- [ ] **SSL Certificates**
  - [ ] Obtain CA-signed SSL certificates (not self-signed)
  - [ ] Place certificates in `server/ssl/`
  - [ ] Verify certificate validity: `openssl x509 -in cert.pem -text -noout`

- [ ] **Dependencies**
  - [ ] Run `npm install --production`
  - [ ] Verify all dependencies are installed
  - [ ] Check for security vulnerabilities: `npm audit`

- [ ] **Firewall Configuration**
  - [ ] Open port 5050 in firewall
  - [ ] Configure port forwarding if needed
  - [ ] Set up fail2ban or similar for DDoS protection

- [ ] **Logging**
  - [ ] Verify log directory exists and is writable
  - [ ] Set up log rotation (configured for 30 days)
  - [ ] Configure log monitoring/alerting

### ESP32/ESP8266 Preparation

- [ ] **Firmware Configuration**
  - [ ] Update WiFi credentials for production network
  - [ ] Set production server IP address
  - [ ] Configure certificate validation (remove `setInsecure()`)
  - [ ] Set appropriate send interval

- [ ] **Hardware**
  - [ ] Verify all wiring connections
  - [ ] Test load cell calibration
  - [ ] Ensure stable power supply
  - [ ] Add physical enclosure for protection

- [ ] **Testing**
  - [ ] Test WiFi connectivity
  - [ ] Verify HTTPS communication
  - [ ] Test sensor readings accuracy
  - [ ] Monitor for 24 hours in test environment

---

## 🔧 Deployment Steps

### Step 1: Server Deployment

#### Option A: Local Server (Windows/Linux/Mac)

```bash
# 1. Navigate to server directory
cd server

# 2. Install dependencies
npm install --production

# 3. Generate or place SSL certificates
# For production, use CA-signed certificates
cp /path/to/your/key.pem ssl/key.pem
cp /path/to/your/cert.pem ssl/cert.pem

# 4. Create .env file
cp .env.example .env
# Edit .env with production values

# 5. Test the server
npm test

# 6. Start with PM2 (recommended)
npm install -g pm2
pm2 start server.js --name shoppad-server
pm2 save
pm2 startup
```

#### Option B: Cloud Deployment (AWS/Azure/GCP)

**AWS EC2 Example:**

```bash
# 1. Launch EC2 instance (Ubuntu 22.04 LTS)
# 2. SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Clone repository
git clone https://github.com/your-repo/shoppad-interface.git
cd shoppad-interface/server

# 5. Install dependencies
npm install --production

# 6. Configure environment
cp .env.example .env
nano .env  # Edit with production values

# 7. Set up SSL certificates
# Use Let's Encrypt or AWS Certificate Manager

# 8. Configure firewall
sudo ufw allow 5050/tcp
sudo ufw enable

# 9. Start with PM2
npm install -g pm2
pm2 start server.js --name shoppad-server
pm2 startup systemd
pm2 save

# 10. Set up Nginx reverse proxy (optional)
sudo apt-get install nginx
# Configure Nginx to proxy to port 5050
```

### Step 2: ESP32/ESP8266 Deployment

```cpp
// 1. Update firmware configuration
const char* WIFI_SSID = "YourProductionSSID";
const char* WIFI_PASSWORD = "YourProductionPassword";
const char* SERVER_HOST = "your-server-ip-or-domain";

// 2. Enable certificate validation
// Option A: Use certificate fingerprint
const char* fingerprint = "YOUR_CERT_FINGERPRINT";
client.setFingerprint(fingerprint);

// Option B: Use root CA certificate
const char* rootCA = "-----BEGIN CERTIFICATE-----\n...";
client.setCACert(rootCA);

// 3. Upload firmware to ESP32/ESP8266
// 4. Monitor Serial output for errors
// 5. Verify data is being sent to server
```

### Step 3: Verification

```bash
# 1. Check server status
curl -k https://your-server:5050/status

# 2. Monitor logs
pm2 logs shoppad-server

# 3. Check recent data
cd server
npm run logs

# 4. Verify statistics
curl -k https://your-server:5050/stats

# 5. Monitor ESP32 Serial output
# Should see successful connections and data transmissions
```

---

## 🔒 Security Hardening

### Server Security

- [ ] **Use HTTPS Only**
  - [ ] CA-signed certificates
  - [ ] Strong cipher suites
  - [ ] TLS 1.2 or higher

- [ ] **Rate Limiting**
  - [ ] Configure appropriate limits
  - [ ] Monitor for abuse
  - [ ] Set up IP blacklisting

- [ ] **Input Validation**
  - [ ] Already implemented in server
  - [ ] Monitor for injection attempts
  - [ ] Log suspicious activity

- [ ] **Access Control**
  - [ ] Implement authentication (if needed)
  - [ ] Use API keys for ESP32 devices
  - [ ] Restrict CORS origins

- [ ] **Monitoring**
  - [ ] Set up uptime monitoring
  - [ ] Configure error alerting
  - [ ] Monitor resource usage

### ESP32 Security

- [ ] **Certificate Validation**
  - [ ] Remove `setInsecure()`
  - [ ] Use certificate pinning
  - [ ] Verify server identity

- [ ] **Firmware Protection**
  - [ ] Enable flash encryption
  - [ ] Enable secure boot
  - [ ] Protect WiFi credentials

- [ ] **Physical Security**
  - [ ] Use enclosure
  - [ ] Disable debug ports
  - [ ] Tamper detection (optional)

---

## 📊 Monitoring & Maintenance

### Server Monitoring

```bash
# Check server status
pm2 status

# View logs
pm2 logs shoppad-server

# Monitor resource usage
pm2 monit

# Restart server
pm2 restart shoppad-server

# View recent weight data
cd server
npm run logs
```

### Log Management

```bash
# View logs
npm run logs

# Clean old logs
npm run clean-logs

# Check disk usage
du -sh logs/ data/
```

### Backup Strategy

```bash
# Backup weight data
cp -r server/data/ /backup/location/data-$(date +%Y%m%d)/

# Backup logs
cp -r server/logs/ /backup/location/logs-$(date +%Y%m%d)/

# Automated backup (cron job)
# Add to crontab: crontab -e
0 2 * * * /path/to/backup-script.sh
```

---

## 🆘 Troubleshooting Production Issues

### Server Not Responding

```bash
# Check if server is running
pm2 status

# Check logs for errors
pm2 logs shoppad-server --lines 100

# Check port availability
netstat -tulpn | grep 5050

# Restart server
pm2 restart shoppad-server
```

### High Memory Usage

```bash
# Check memory usage
pm2 monit

# Restart server
pm2 restart shoppad-server

# Check for memory leaks in logs
pm2 logs shoppad-server | grep "memory"
```

### ESP32 Connection Issues

1. Check server logs for incoming connections
2. Verify ESP32 Serial output for errors
3. Check network connectivity
4. Verify SSL certificates are valid
5. Check firewall rules

---

## 📈 Performance Optimization

### Server Optimization

- [ ] Enable gzip compression
- [ ] Implement caching where appropriate
- [ ] Use CDN for static assets (if applicable)
- [ ] Optimize database queries (when DB is added)
- [ ] Monitor and optimize memory usage

### Network Optimization

- [ ] Use HTTP/2 if possible
- [ ] Minimize payload size
- [ ] Implement connection pooling
- [ ] Use keep-alive connections

---

## 🔄 Update Procedure

### Server Updates

```bash
# 1. Backup current data
npm run logs > backup-$(date +%Y%m%d).txt

# 2. Pull latest changes
git pull origin main

# 3. Install dependencies
npm install --production

# 4. Run tests
npm test

# 5. Restart server
pm2 restart shoppad-server

# 6. Verify functionality
curl -k https://localhost:5050/status
```

### ESP32 Firmware Updates

1. Test new firmware in development environment
2. Backup current firmware
3. Upload new firmware to one device
4. Monitor for 24 hours
5. Roll out to remaining devices

---

## ✅ Post-Deployment Verification

- [ ] Server is running and accessible
- [ ] SSL certificates are valid
- [ ] ESP32 devices are connecting successfully
- [ ] Data is being received and logged
- [ ] No errors in server logs
- [ ] No errors in ESP32 Serial output
- [ ] Monitoring is active
- [ ] Backups are configured
- [ ] Documentation is updated

---

## 📞 Support Contacts

- **Technical Issues:** Open GitHub issue
- **Security Concerns:** Contact security team
- **General Questions:** Check README.md and documentation

---

**Last Updated:** 2025-10-20  
**Version:** 1.0.0

