# 🎨 Frontend Integration Guide

Complete guide for integrating ESP32 weight sensor data into the React frontend.

## 📋 Overview

The ShopPad shopping cart interface now displays **real-time weight data** from the ESP32/HX711 load cell sensor instead of calculated cart weights. The weight updates automatically every 3 seconds.

---

## ✅ What Was Implemented

### 1. Custom React Hook (`src/hooks/useESP32Weight.ts`)
- Fetches real-time weight data from HTTPS server
- Auto-polling every 3 seconds
- Error handling and retry logic
- Loading states
- Statistics tracking

### 2. Updated WeightDisplay Component (`src/components/WeightDisplay.tsx`)
- Shows live sensor data instead of calculated weight
- Visual indicators:
  - 🟢 **Green "Live" badge** - Connected and receiving data
  - 🔴 **Red "Offline" badge** - Connection error
  - ⏳ **Loading spinner** - Fetching initial data
- Displays last update timestamp
- Optional comparison with calculated cart weight
- Retry button when offline

### 3. API Configuration (`src/config/api.ts`)
- Centralized configuration for server URL
- Configurable polling interval
- Easy to switch between development and production

---

## 🚀 Setup Instructions

### Step 1: Start the HTTPS Server

```powershell
cd server
npm start
```

**Expected Output:**
```
🚀 HTTPS Weight Server Started Successfully!
📡 Server: https://localhost:5050
```

### Step 2: Accept Self-Signed SSL Certificate

**IMPORTANT:** Before the React app can connect to the HTTPS server, you must accept the self-signed certificate in your browser.

1. **Open your browser** (Chrome, Edge, Firefox)

2. **Navigate to:** `https://localhost:5050/status`

3. **You'll see a security warning:**
   - Chrome/Edge: "Your connection is not private"
   - Firefox: "Warning: Potential Security Risk Ahead"

4. **Accept the certificate:**
   - **Chrome/Edge:** Click "Advanced" → "Proceed to localhost (unsafe)"
   - **Firefox:** Click "Advanced" → "Accept the Risk and Continue"

5. **You should see:**
   ```json
   {
     "success": true,
     "status": "online",
     "timestamp": "2025-10-20T..."
   }
   ```

6. **Keep this tab open** (or the certificate will be forgotten)

### Step 3: Start the React Frontend

```powershell
# In the project root
npm run dev
```

**Expected Output:**
```
VITE v5.4.19 ready in 359 ms
➜ Local: http://localhost:8081/
```

### Step 4: Open the Application

1. **Open browser:** `http://localhost:8081/`

2. **Navigate to Shopping page**

3. **Look at bottom-right corner** - You should see the WeightDisplay component with:
   - 🟢 Green "Live" badge
   - Current weight from ESP32 sensor
   - Last update timestamp

---

## 🔧 Configuration

### Change Server URL

Edit `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  SERVER_URL: 'https://10.232.200.83:5050', // Your server IP
  POLL_INTERVAL: 3000, // Update every 3 seconds
  ENABLED: true,
};
```

Or use environment variable in `.env`:

```env
VITE_SERVER_URL=https://10.232.200.83:5050
```

### Change Polling Interval

```typescript
// In src/config/api.ts
POLL_INTERVAL: 5000, // Update every 5 seconds
```

### Disable Weight Sensor Integration

```typescript
// In src/config/api.ts
ENABLED: false, // Disable ESP32 integration
```

---

## 🎨 UI Features

### Live Weight Display

The weight display shows in the bottom-right corner with:

**Connected State:**
```
┌─────────────────────────────┐
│ 🔲 Live Weight Sensor  🟢Live│
│                             │
│ Current Weight              │
│ 12.34 kg                    │
│                             │
│ Updated: 3:45:23 PM         │
│ Cart estimate: 11.50 kg     │
└─────────────────────────────┘
```

**Offline State:**
```
┌─────────────────────────────┐
│ 🔲 Live Weight Sensor  🔴Off │
│                             │
│ Current Weight              │
│ -- kg                    🔄 │
│ Connection failed           │
└─────────────────────────────┘
```

**Loading State:**
```
┌─────────────────────────────┐
│ 🔲 Live Weight Sensor    ⏳ │
│                             │
│ Current Weight              │
│ 0.00 kg                     │
└─────────────────────────────┘
```

---

## 🔍 How It Works

### Data Flow

```
ESP32 Sensor → HTTPS Server → React Frontend
   (10s)          (Port 5050)      (Poll 3s)
```

1. **ESP32** reads weight from HX711 load cell every 10 seconds
2. **ESP32** sends weight to HTTPS server via POST /weight
3. **Server** stores weight in JSON file and logs
4. **React app** polls GET /logs?limit=1 every 3 seconds
5. **WeightDisplay** component updates with latest weight

### API Endpoints Used

**GET /logs?limit=1**
- Fetches the most recent weight reading
- Returns: `{ success: true, data: [{ weight: 12.34, timestamp: "..." }] }`

**GET /stats** (optional)
- Fetches weight statistics
- Returns: `{ success: true, stats: { count, average, min, max, latest } }`

---

## 🐛 Troubleshooting

### Issue: "Offline" Badge Always Showing

**Cause:** Browser hasn't accepted the SSL certificate

**Solution:**
1. Visit `https://localhost:5050/status` in browser
2. Accept the security warning
3. Refresh the React app

### Issue: CORS Error in Console

**Cause:** Server CORS not configured for your frontend URL

**Solution:**
The server is already configured to allow `http://localhost:8081`. If using a different port, update `server/config.js`:

```javascript
cors: {
  origins: ['http://localhost:8081', 'http://localhost:8080'],
}
```

### Issue: Weight Shows 0.00 kg

**Possible Causes:**
1. ESP32 not connected to server
2. No weight data sent yet
3. HX711 sensor not calibrated

**Solution:**
1. Check ESP32 Serial Monitor for connection status
2. Check server logs: `npm run logs`
3. Calibrate the HX711 sensor (see ESP32 README)

### Issue: Negative Weight Values

**Cause:** HX711 sensor needs taring (zero calibration)

**Solution:**
1. Remove all weight from the load cell
2. Reset the ESP32
3. The sensor should auto-tare on startup

### Issue: Mixed Content Warning

**Cause:** HTTP frontend trying to access HTTPS backend

**Solution:**
This is expected with self-signed certificates. The app handles this by requiring manual certificate acceptance (Step 2 above).

---

## 📊 Performance Considerations

### Polling Interval

- **3 seconds (default):** Good balance between responsiveness and server load
- **1-2 seconds:** More responsive but higher server load
- **5-10 seconds:** Lower server load but less responsive

### Network Traffic

- Each poll: ~200 bytes
- 3-second interval: ~20 requests/minute
- Bandwidth: ~4 KB/minute (negligible)

### Browser Performance

- Minimal impact on React app performance
- Uses native `fetch` API
- Automatic cleanup on component unmount

---

## 🔒 Security Notes

### Development (Current Setup)

- ✅ HTTPS encryption
- ⚠️ Self-signed certificates (browser warnings)
- ✅ CORS protection
- ✅ Rate limiting on server

### Production Recommendations

1. **Use CA-signed SSL certificates**
   - Let's Encrypt (free)
   - Commercial CA

2. **Update CORS origins**
   - Restrict to production domain only

3. **Enable authentication**
   - API keys for ESP32 devices
   - User authentication for frontend

4. **Use environment variables**
   - Don't hardcode server URLs
   - Use `.env` files

---

## 🎯 Future Enhancements

### Planned Features

- [ ] WebSocket connection for real-time updates (no polling)
- [ ] Historical weight graph/chart
- [ ] Weight change alerts
- [ ] Multiple sensor support
- [ ] Offline mode with cached data
- [ ] PWA support for mobile devices

### Possible Improvements

- Add weight trend indicator (↑ ↓ →)
- Show weight difference from cart estimate
- Add sound/vibration alerts for weight changes
- Export weight data to CSV
- Integration with checkout process

---

## 📝 Code Examples

### Using the Hook in Other Components

```typescript
import { useESP32Weight } from '@/hooks/useESP32Weight';

function MyComponent() {
  const { weight, isLoading, isError, refetch } = useESP32Weight({
    pollInterval: 5000, // 5 seconds
    enabled: true,
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading weight</div>;

  return <div>Current Weight: {weight} kg</div>;
}
```

### Conditional Rendering Based on Weight

```typescript
function CartAlert() {
  const { weight } = useESP32Weight();
  const { currentWeight } = useCart();

  const difference = Math.abs(weight - currentWeight);

  if (difference > 0.5) {
    return (
      <Alert variant="warning">
        Weight mismatch detected! Please verify items.
      </Alert>
    );
  }

  return null;
}
```

---

## 📚 Related Documentation

- [README.md](README.md) - Main project documentation
- [QUICKSTART.md](QUICKSTART.md) - Quick setup guide
- [server/README.md](server/README.md) - Server documentation
- [sketch_oct19a/ESP32-We/README.md](sketch_oct19a/ESP32-We/README.md) - ESP32 setup

---

## ✅ Testing Checklist

- [ ] Server is running on port 5050
- [ ] SSL certificate accepted in browser
- [ ] Frontend is running on port 8081
- [ ] WeightDisplay shows "Live" badge
- [ ] Weight updates every 3 seconds
- [ ] Last update timestamp changes
- [ ] Offline state shows when server is stopped
- [ ] Retry button works when offline
- [ ] No console errors

---

**Last Updated:** 2025-10-20  
**Version:** 1.0.0

