# ⚡ Real-Time Mode Configuration

**Near real-time weight updates every 0.1 seconds (100ms)**

---

## 🎯 **What Changed**

Your ShopPad system has been optimized for near real-time data transmission:

| Component | Old Interval | New Interval | Improvement |
|-----------|--------------|--------------|-------------|
| **ESP32 Transmission** | 10 seconds | 0.1 seconds | **100x faster** |
| **Frontend Polling** | 3 seconds | 0.1 seconds | **30x faster** |
| **Server Rate Limit** | 100 req/min | 1000 req/min | **10x higher** |

---

## 📝 **Changes Made**

### **1. ESP32 Code (`sketch_oct19a/ESP32-We/ESP32-We.ino`)**

#### **Timing:**
```cpp
const unsigned long SEND_INTERVAL = 100;  // 0.1 seconds (was 10000)
```

#### **Connection Optimization:**
- ✅ **Keep-Alive:** Connection stays open between requests
- ✅ **Reduced Logging:** Less Serial output for better performance
- ✅ **Faster Timeouts:** 1 second instead of 5 seconds
- ✅ **Fewer Readings:** 3 samples instead of 10 for faster response

#### **Key Optimizations:**
```cpp
// Keep connection alive
"Connection: keep-alive\r\n\r\n"  // Instead of "close"

// Faster weight reading
float weight = scale.get_units(3);  // Instead of 10

// Reduced timeout
if (millis() - timeout > 1000)  // Instead of 5000
```

---

### **2. Frontend Code (`src/config/api.ts`)**

```typescript
POLL_INTERVAL: 100,  // 0.1 seconds (was 3000)
TIMEOUT: 2000,       // 2 seconds (was 5000)
```

**Result:** Frontend updates 30x faster!

---

### **3. Server Code (`server/config.js`)**

```javascript
rateLimitMaxRequests: 1000,  // Was 100
```

**Result:** Server can handle 1000 requests per minute (16.6 req/sec)

---

## 🚀 **Performance Metrics**

### **Data Transmission Rate**

| Metric | Value |
|--------|-------|
| **Updates per second** | 10 |
| **Updates per minute** | 600 |
| **Updates per hour** | 36,000 |
| **Updates per day** | 864,000 |

### **Network Usage**

| Metric | Estimate |
|--------|----------|
| **Payload size** | ~50 bytes |
| **With headers** | ~200 bytes |
| **Per second** | ~2 KB/s |
| **Per hour** | ~7 MB/hour |
| **Per day** | ~170 MB/day |

### **Latency**

| Component | Latency |
|-----------|---------|
| **ESP32 → Server** | 10-100ms |
| **Server → Frontend** | 10-50ms |
| **Total (sensor to display)** | 20-250ms |

---

## ⚙️ **How It Works**

### **Old Flow (10 second updates):**
```
ESP32 → [Connect] → Send → [Disconnect] → Wait 10s → Repeat
Frontend → Poll every 3s
```

### **New Flow (0.1 second updates):**
```
ESP32 → [Connect Once] → Send → Send → Send → ... (keep-alive)
Frontend → Poll every 0.1s
```

**Key Difference:** Connection stays open, reducing overhead!

---

## 📊 **Data Storage Considerations**

### **Storage Growth**

With 864,000 data points per day:

```javascript
// Each entry: ~100 bytes (JSON)
// Per day: 864,000 × 100 bytes = 86.4 MB
// Per week: ~600 MB
// Per month: ~2.6 GB
```

### **Recommendation:**

Consider implementing data aggregation:
- Store all data for last 1 hour
- Aggregate to 1-second intervals for last 24 hours
- Aggregate to 1-minute intervals for older data

---

## 🔧 **Tuning Options**

### **If You Want Even Faster Updates:**

#### **50ms (20 updates/second):**
```cpp
// ESP32
const unsigned long SEND_INTERVAL = 50;

// Frontend
POLL_INTERVAL: 50,
```

#### **25ms (40 updates/second):**
```cpp
// ESP32
const unsigned long SEND_INTERVAL = 25;

// Frontend
POLL_INTERVAL: 25,
```

⚠️ **Warning:** Faster than 100ms may cause WiFi instability!

---

### **If You Want to Reduce Load:**

#### **500ms (2 updates/second):**
```cpp
// ESP32
const unsigned long SEND_INTERVAL = 500;

// Frontend
POLL_INTERVAL: 500,
```

#### **1 second (1 update/second):**
```cpp
// ESP32
const unsigned long SEND_INTERVAL = 1000;

// Frontend
POLL_INTERVAL: 1000,
```

---

## 🆘 **Troubleshooting**

### **ESP32 keeps disconnecting**

**Solution:** Increase interval slightly
```cpp
const unsigned long SEND_INTERVAL = 200;  // Try 200ms instead of 100ms
```

### **Frontend shows "Offline" frequently**

**Solution:** Increase frontend timeout
```typescript
TIMEOUT: 3000,  // Increase from 2000 to 3000
```

### **Server logs show rate limit errors**

**Solution:** Increase rate limit
```javascript
rateLimitMaxRequests: 2000,  // Increase from 1000
```

### **High CPU usage on server**

**Solution:** Reduce update frequency or implement data aggregation

---

## 📈 **Monitoring**

### **ESP32 Serial Monitor**

You'll see rapid updates:
```
📤 12.34 kg ✅
📤 12.35 kg ✅
📤 12.36 kg ✅
📤 12.34 kg ✅
```

### **Server Logs**

```bash
pm2 logs shoppad-server
```

You should see:
```
POST /weight 200 - Weight: 12.34 kg
POST /weight 200 - Weight: 12.35 kg
POST /weight 200 - Weight: 12.36 kg
```

### **Frontend**

The WeightDisplay component will update smoothly every 100ms!

---

## 🎯 **Next Steps**

1. **Upload ESP32 code** to your device
2. **Restart frontend** (if running): `npm run dev`
3. **Restart server** on Droplet: `pm2 restart shoppad-server`
4. **Monitor performance** and adjust if needed

---

## 💡 **Future Improvements**

### **WebSocket Implementation (Best for Real-Time)**

For true real-time with minimal overhead:

**Benefits:**
- ✅ Persistent bidirectional connection
- ✅ Lower latency (~10-20ms)
- ✅ Less network overhead
- ✅ Server can push updates to clients

**Implementation:** Would require:
- WebSocket server library
- ESP32 WebSocket client
- Frontend WebSocket connection

Let me know if you want me to implement WebSocket!

---

## 📊 **Comparison Table**

| Mode | Interval | Data Points/Day | Network Usage | Best For |
|------|----------|-----------------|---------------|----------|
| **Original** | 10s | 8,640 | ~17 MB/day | General monitoring |
| **Real-Time** | 0.1s | 864,000 | ~170 MB/day | Live weight display |
| **Fast** | 1s | 86,400 | ~17 MB/day | Balanced performance |
| **WebSocket** | 0.01s | 8,640,000 | ~50 MB/day | True real-time |

---

## ✅ **Summary**

Your system is now configured for **near real-time updates**!

- ⚡ **100ms updates** from ESP32
- ⚡ **100ms polling** on frontend
- ⚡ **Keep-alive connections** for efficiency
- ⚡ **Optimized timeouts** for speed

**Upload the new code to ESP32 and enjoy real-time weight updates!** 🎉

