# 🔧 ESP32 Connection Troubleshooting

**Issue:** ESP32 shows "Failed to send data" - Cannot connect to server

---

## ⚠️ **Current Problem**

```
📤 -0.54 kg ⚠️
⚠️  Failed to send data. Attempt: 20
```

This means the ESP32 cannot connect to the server at `138.68.137.154:5050`

---

## 🔍 **Diagnostic Steps**

### **Step 1: Check if Server is Running**

SSH into your Droplet and check:

```bash
ssh root@138.68.137.154

# Check if server is running
pm2 status

# Expected output:
# ┌─────┬──────────────────┬─────────┬─────────┬─────────┐
# │ id  │ name             │ status  │ restart │ uptime  │
# ├─────┼──────────────────┼─────────┼─────────┼─────────┤
# │ 0   │ shoppad-server   │ online  │ 0       │ 5m      │
# └─────┴──────────────────┴─────────┴─────────┴─────────┘
```

**If server is NOT running:**
```bash
cd /WanasishShop/shoppad-interface/server
pm2 start server.js --name shoppad-server
pm2 save
```

---

### **Step 2: Check Server Logs**

```bash
pm2 logs shoppad-server --lines 50
```

Look for errors like:
- Port already in use
- Certificate errors
- Crash logs

---

### **Step 3: Test Server Locally (on Droplet)**

```bash
# Test from the Droplet itself
curl -k https://localhost:5050/status

# Expected response:
# {"status":"online","timestamp":"2025-10-20T..."}
```

**If this fails:** Server is not running or crashed

---

### **Step 4: Test Server Externally**

From your local PC (Windows), test if the server is reachable:

```powershell
# Test from your Windows PC
curl -k https://138.68.137.154:5050/status
```

**If this fails but Step 3 works:** Firewall is blocking port 5050

---

### **Step 5: Check Firewall**

On the Droplet:

```bash
# Check firewall status
sudo ufw status

# Expected output should include:
# 5050/tcp                   ALLOW       Anywhere
# 8080/tcp                   ALLOW       Anywhere

# If port 5050 is NOT allowed:
sudo ufw allow 5050/tcp
sudo ufw reload
```

---

### **Step 6: Check if Port is Listening**

```bash
# Check if port 5050 is listening
sudo netstat -tlnp | grep 5050

# Expected output:
# tcp6  0  0 :::5050  :::*  LISTEN  12345/node
```

**If nothing shows:** Server is not running on port 5050

---

## 🚀 **Quick Fix Commands**

Run these on your Droplet:

```bash
# 1. Navigate to server directory
cd /WanasishShop/shoppad-interface/server

# 2. Check if server is running
pm2 status

# 3. If not running, start it
pm2 start server.js --name shoppad-server

# 4. Check logs
pm2 logs shoppad-server --lines 20

# 5. Allow firewall
sudo ufw allow 5050/tcp
sudo ufw reload

# 6. Test locally
curl -k https://localhost:5050/status

# 7. Save PM2 config
pm2 save
pm2 startup
```

---

## 🔍 **Common Issues & Solutions**

### **Issue 1: Server Not Running**

**Symptoms:**
- `pm2 status` shows no processes or "stopped"
- `curl https://localhost:5050/status` fails

**Solution:**
```bash
cd /WanasishShop/shoppad-interface/server
pm2 start server.js --name shoppad-server
pm2 save
```

---

### **Issue 2: Port Already in Use**

**Symptoms:**
- Server logs show "EADDRINUSE" error
- Port 5050 is already taken

**Solution:**
```bash
# Find what's using port 5050
sudo lsof -i :5050

# Kill the process (replace PID with actual process ID)
sudo kill -9 PID

# Or use a different port in server/.env
echo "PORT=5051" >> .env
pm2 restart shoppad-server
```

---

### **Issue 3: Firewall Blocking**

**Symptoms:**
- `curl https://localhost:5050/status` works on Droplet
- `curl https://138.68.137.154:5050/status` fails from outside

**Solution:**
```bash
sudo ufw allow 5050/tcp
sudo ufw reload
sudo ufw status
```

---

### **Issue 4: SSL Certificate Issues**

**Symptoms:**
- Server starts but ESP32 can't connect
- Logs show SSL/TLS errors

**Solution:**
```bash
# Regenerate certificates
cd /WanasishShop/shoppad-interface/server
rm -rf certs/
npm run generate-cert

# Restart server
pm2 restart shoppad-server
```

---

### **Issue 5: Server Crashed**

**Symptoms:**
- `pm2 status` shows "errored" or "stopped"
- Server keeps restarting

**Solution:**
```bash
# Check error logs
pm2 logs shoppad-server --err --lines 50

# Common fixes:
# - Missing dependencies: npm install
# - Wrong Node version: nvm use 18
# - Permission issues: sudo chown -R $USER:$USER .
```

---

## 🧪 **Test ESP32 Connection**

After fixing the server, test from ESP32:

### **Expected Serial Output:**
```
📤 0.45 kg [Reconnecting...] ✅ ✅
📤 0.44 kg ✅
📤 0.45 kg ✅
```

### **If Still Failing:**

Check ESP32 Serial Monitor for specific errors:
- `❌ Connection to server failed!` → Server not reachable
- `❌ Timeout!` → Server too slow or not responding
- `⚠️` → Server returned error

---

## 📝 **Verification Checklist**

Run through this checklist:

**On Droplet:**
- [ ] Server is running: `pm2 status` shows "online"
- [ ] Port 5050 is listening: `netstat -tlnp | grep 5050`
- [ ] Firewall allows 5050: `ufw status` shows "5050/tcp ALLOW"
- [ ] Local test works: `curl -k https://localhost:5050/status`
- [ ] External test works: `curl -k https://138.68.137.154:5050/status` (from PC)

**On ESP32:**
- [ ] WiFi connected: Shows IP address
- [ ] Server host correct: `138.68.137.154`
- [ ] Server port correct: `5050`
- [ ] SSL insecure mode enabled: `client.setInsecure()`

---

## 🎯 **Most Likely Issue**

Based on your error, the most likely cause is:

**Server is not running on the Droplet**

**Quick Fix:**
```bash
ssh root@138.68.137.154
cd /WanasishShop/shoppad-interface/server
pm2 start server.js --name shoppad-server
pm2 save
```

Then test:
```bash
curl -k https://localhost:5050/status
```

You should see:
```json
{"status":"online","timestamp":"2025-10-20T..."}
```

---

## 📞 **Next Steps**

1. **SSH into Droplet** and run the Quick Fix Commands above
2. **Check server status** with `pm2 status`
3. **Test locally** with `curl -k https://localhost:5050/status`
4. **Upload new ESP32 code** (with fixed calibration)
5. **Monitor Serial output** for successful connections

---

**Let me know what you see when you run these commands!** 🚀

