# ESP32 Integration

**Document:** Weight Sensor and NFC Integration
**Last Updated:** December 10, 2025

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Weight Sensor Integration](#weight-sensor-integration)
3. [NFC Reader Integration](#nfc-reader-integration)
4. [Frontend Hooks](#frontend-hooks)
5. [Backend Server](#backend-server)
6. [Configuration](#configuration)

---

## System Overview

### Hardware Components

| Component | Purpose | Communication |
|-----------|---------|---------------|
| ESP32/ESP8266 | Microcontroller | WiFi HTTP to backend |
| HX711 | Load cell amplifier | Digital to ESP32 |
| Load Cell | Weight measurement | Analog to HX711 |
| RC522/PN532 | NFC reader | SPI to ESP32 |

### Data Flow

```
[Load Cell] --> [HX711] --> [ESP32] --HTTP POST /weight--> [Backend Server]
                                                                   |
[Frontend] <--HTTP GET /logs----------------------------------------+

[NFC Card] --> [RC522] --> [ESP32] --HTTP POST /nfc----> [Backend Server]
                                                                  |
[Frontend] <--HTTP GET /nfc (polling)-----------------------------+
```

---

## Weight Sensor Integration

### Architecture

```
+------------------+     +------------------+     +------------------+
|   Load Cell      |     |   HX711          |     |   ESP32          |
|   (Analog)       |---->|   Amplifier      |---->|   Microcontroller|
+------------------+     +------------------+     +------------------+
                                                          |
                                                    WiFi HTTP
                                                          |
                                                          v
                                                 +------------------+
                                                 |  Backend Server  |
                                                 |  POST /weight    |
                                                 +------------------+
```

### ESP32 Weight Sender (Conceptual)

```cpp
// Arduino/ESP32 example for sending weight data

#include <WiFi.h>
#include <HTTPClient.h>
#include <HX711.h>

// HX711 pins
#define LOADCELL_DOUT_PIN  4
#define LOADCELL_SCK_PIN   5

HX711 scale;
const char* serverUrl = "https://your-server.com/weight";

void setup() {
  Serial.begin(115200);
  WiFi.begin("SSID", "PASSWORD");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }

  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(2280.f);  // Calibration factor
  scale.tare();
}

void loop() {
  float weight = scale.get_units(10);  // Average of 10 readings

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String payload = "{\"weight\":" + String(weight, 2) + "}";
    int httpCode = http.POST(payload);

    if (httpCode > 0) {
      String response = http.getString();
      Serial.println(response);
    }

    http.end();
  }

  delay(100);  // Send every 100ms
}
```

### Weight Data Format

**POST /weight payload:**
```json
{
  "weight": 2.45,
  "deviceId": "ESP32_CART_001"  // Optional
}
```

**Server response:**
```json
{
  "success": true,
  "message": "Weight data received",
  "weight": 2.45,
  "timestamp": "2025-12-10T12:00:00.000Z"
}
```

### Validation Rules

| Rule | Value | Description |
|------|-------|-------------|
| Min Weight | 0 kg | No negative weights |
| Max Weight | 1000 kg | Upper limit |
| Precision | 2 decimals | Rounded on server |

---

## NFC Reader Integration

### Architecture

```
+------------------+     +------------------+     +------------------+
|   NFC Card       |     |   RC522/PN532    |     |   ESP32          |
|   (RFID tag)     |---->|   NFC Reader     |---->|   Microcontroller|
+------------------+     +------------------+     +------------------+
                                                          |
                                                    WiFi HTTP
                                                          |
                                                          v
                                                 +------------------+
                                                 |  Backend Server  |
                                                 |  POST /nfc       |
                                                 +------------------+
```

### ESP32 NFC Sender (Conceptual)

```cpp
// Arduino/ESP32 example for sending NFC events

#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>

// RC522 pins
#define RST_PIN   22
#define SS_PIN    21

MFRC522 rfid(SS_PIN, RST_PIN);
const char* serverUrl = "https://your-server.com/nfc";

void setup() {
  Serial.begin(115200);
  WiFi.begin("SSID", "PASSWORD");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }

  SPI.begin();
  rfid.PCD_Init();
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    delay(50);
    return;
  }

  // Get UID as hex string
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    uid += String(rfid.uid.uidByte[i] < 0x10 ? "0" : "");
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();

  // Send to server
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String payload = "{\"nfc_uid\":\"" + uid + "\",\"event\":\"nfc_detected\"}";
    int httpCode = http.POST(payload);

    if (httpCode == 200) {
      Serial.println("NFC event sent: " + uid);
    }

    http.end();
  }

  rfid.PICC_HaltA();
  delay(1000);  // Prevent rapid re-reads
}
```

### NFC Data Format

**POST /nfc payload:**
```json
{
  "nfc_uid": "04A3B2C1D5E6",
  "event": "nfc_detected"
}
```

**Server response:**
```json
{
  "success": true,
  "message": "NFC event received",
  "uid": "04A3B2C1D5E6",
  "timestamp": "2025-12-10T12:00:00.000Z"
}
```

---

## Frontend Hooks

### useESP32Weight

**Location:** `src/hooks/useESP32Weight.ts`

**Purpose:** Poll backend for latest weight reading

```typescript
const {
  weight,        // Current weight in kg (number | null)
  isLoading,     // Initial load state
  isError,       // Error occurred
  error,         // Error message
  lastUpdated,   // Date of last successful fetch
  stats,         // { count, average, min, max, latest }
  refetch        // Manual refresh function
} = useESP32Weight({
  pollInterval: 100,    // ms between polls (default: 100)
  serverUrl: '...',     // Server URL
  enabled: true         // Enable/disable polling
});
```

**Polling Logic:**
```typescript
useEffect(() => {
  if (!enabled) return;

  const intervalId = setInterval(() => {
    fetchWeight();
    // Fetch stats less frequently
    if (Math.random() < 0.2) {
      fetchStats();
    }
  }, pollInterval);

  return () => clearInterval(intervalId);
}, [enabled, pollInterval, fetchWeight, fetchStats]);
```

### useNFCDetection

**Location:** `src/hooks/useNFCDetection.ts`

**Purpose:** Poll backend for NFC events, trigger checkout flow

```typescript
const {
  nfcEvent,        // Latest NFC event (NFCEvent | null)
  isDetecting,     // Currently polling
  isError,         // Error state
  error,           // Error message
  markAsProcessed, // Mark event as handled
  refetch          // Manual poll
} = useNFCDetection({
  pollInterval: 1000,  // ms between polls (default: 1000)
  serverUrl: '...',    // Server URL
  enabled: true,       // Enable/disable polling
  onNFCDetected: (event) => {
    // Callback when new NFC event detected
    console.log('NFC detected:', event.uid);
  }
});
```

**Event Processing:**
```typescript
// In Shopping.tsx
const { nfcEvent, markAsProcessed } = useNFCDetection({
  onNFCDetected: (event) => {
    if (totalItems > 0) {
      // Show checkout dialog
      setCurrentNFCEvent({ uid: event.uid, timestamp: event.timestamp });
      setShowCheckoutDialog(true);
    } else {
      // Cart empty, ignore
      markAsProcessed(event.uid, event.timestamp);
    }
  }
});
```

---

## Backend Server

### Server Implementation

**Location:** `server/server.js`

### Key Features

1. **Weight Data Storage**
   - Stored in JSON file (`server/data/weight-data.json`)
   - Max 10,000 entries (configurable)
   - Validated on receipt

2. **NFC Event Storage**
   - Stored in memory (not persisted)
   - Max 100 events retained
   - Processed flag prevents duplicate handling

3. **Security**
   - Helmet security headers
   - CORS whitelist
   - Rate limiting (1000 req/min)

### Starting the Server

```bash
# Development (HTTPS with self-signed cert)
cd server
npm install
npm run generate-certs  # Generate SSL certificates
npm start

# Production (HTTP, platform handles SSL)
USE_HTTPS=false NODE_ENV=production npm start
```

---

## Configuration

### Frontend API Config

**Location:** `src/config/api.ts`

```typescript
export const API_CONFIG = {
  SERVER_URL: import.meta.env.VITE_SERVER_URL || 'https://localhost:5050',
  POLL_INTERVAL: 100,  // Weight polling (ms)
  TIMEOUT: 2000,       // Request timeout (ms)
  ENABLED: true        // Global enable/disable
};
```

### Backend Config

**Location:** `server/config.js`

```javascript
const config = {
  server: {
    port: parseInt(process.env.PORT || '5050', 10),
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development'
  },
  ssl: {
    keyPath: './ssl/key.pem',
    certPath: './ssl/cert.pem'
  },
  security: {
    rateLimitWindowMs: 60000,
    rateLimitMaxRequests: 1000
  },
  cors: {
    allowedOrigins: ['http://localhost:8080', 'http://localhost:3000']
  },
  data: {
    file: './data/weight-data.json',
    maxEntries: 10000
  },
  validation: {
    minWeight: 0,
    maxWeight: 1000,
    precision: 2
  }
};
```

### Environment Variables

```bash
# Frontend (.env)
VITE_SERVER_URL=https://your-server.com

# Backend (server/.env)
PORT=5050
HOST=0.0.0.0
USE_HTTPS=true
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:8080
```

---

## Troubleshooting

### Weight Sensor Issues

| Problem | Possible Cause | Solution |
|---------|----------------|----------|
| Always 0 | Calibration | Re-calibrate HX711 |
| Fluctuating | Noise | Add capacitors, shield wires |
| No data | WiFi | Check ESP32 connection |
| Timeout | Server | Verify server URL and SSL |

### NFC Issues

| Problem | Possible Cause | Solution |
|---------|----------------|----------|
| Not detected | Distance | Hold card closer |
| Multiple reads | No delay | Add delay after read |
| Wrong UID | Card type | Verify card is compatible |
| No checkout | Empty cart | Add items first |
