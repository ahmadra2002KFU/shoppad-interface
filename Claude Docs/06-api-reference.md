# API Reference

**Document:** Backend API Endpoints
**Last Updated:** December 10, 2025

---

## Table of Contents

1. [Server Configuration](#server-configuration)
2. [Endpoints Overview](#endpoints-overview)
3. [Weight Endpoints](#weight-endpoints)
4. [NFC Endpoints](#nfc-endpoints)
5. [Status Endpoints](#status-endpoints)
6. [Error Handling](#error-handling)

---

## Server Configuration

### Location
`server/server.js` (Express application)

### Default Configuration

| Setting | Development | Production |
|---------|-------------|------------|
| Port | 5050 | Platform-defined |
| Protocol | HTTPS (self-signed) | HTTP (platform SSL) |
| Host | 0.0.0.0 | 0.0.0.0 |

### Environment Variables

```bash
# server/.env.example
PORT=5050
HOST=0.0.0.0
SSL_KEY_PATH=./ssl/key.pem
SSL_CERT_PATH=./ssl/cert.pem
LOG_RETENTION_DAYS=30
LOG_DIRECTORY=./logs
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000
DATA_FILE=./data/weight-data.json
MAX_DATA_ENTRIES=10000
NODE_ENV=development
USE_HTTPS=true
```

### Frontend API Config

```typescript
// src/config/api.ts
export const API_CONFIG = {
  SERVER_URL: import.meta.env.VITE_SERVER_URL || 'https://localhost:5050',
  POLL_INTERVAL: 100,  // milliseconds
  TIMEOUT: 2000,
  ENABLED: true,
};

export const API_ENDPOINTS = {
  WEIGHT: '/weight',
  STATUS: '/status',
  LOGS: '/logs',
  STATS: '/stats',
  LOG_FILES: '/log-files',
};
```

---

## Endpoints Overview

| Method | Endpoint | Purpose | Rate Limited |
|--------|----------|---------|--------------|
| GET | `/status` | Health check | No |
| POST | `/weight` | Receive weight from ESP32 | Yes (1000/min) |
| GET | `/logs` | Get recent weight readings | No |
| GET | `/stats` | Get weight statistics | No |
| GET | `/log-files` | List log files | No |
| POST | `/nfc` | Receive NFC event from ESP32 | No |
| GET | `/nfc` | Poll for NFC events | No |
| POST | `/nfc/mark-processed` | Mark NFC event processed | No |

---

## Weight Endpoints

### POST /weight

**Purpose:** Receive weight data from ESP32/ESP8266 sensor

**Request:**
```http
POST /weight HTTP/1.1
Content-Type: application/json

{
  "weight": 2.45,
  "deviceId": "ESP32_001"  // Optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Weight data received",
  "weight": 2.45,
  "timestamp": "2025-12-10T12:00:00.000Z"
}
```

**Error Responses:**

400 - Invalid Data:
```json
{
  "success": false,
  "error": "Weight must be a number"
}
```

```json
{
  "success": false,
  "error": "Weight out of range (0-1000 kg)"
}
```

500 - Server Error:
```json
{
  "success": false,
  "error": "Failed to save data"
}
```

**Validation Rules:**
- `weight` must be a number
- `weight` cannot be NaN
- `weight` must be between 0 and 1000 kg
- Values rounded to 2 decimal places

---

### GET /logs

**Purpose:** Retrieve recent weight readings

**Request:**
```http
GET /logs?limit=100 HTTP/1.1
Accept: application/json
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 100 | Max entries to return |

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "weight": 2.45,
      "timestamp": "2025-12-10T12:00:00.000Z",
      "deviceId": "ESP32_001"
    },
    {
      "weight": 2.44,
      "timestamp": "2025-12-10T11:59:59.000Z",
      "deviceId": "ESP32_001"
    }
  ]
}
```

**Frontend Usage:**
```typescript
// src/hooks/useESP32Weight.ts
const response = await fetch(`${serverUrl}/logs?limit=1`);
const data = await response.json();
const latestWeight = data.data[0].weight;
```

---

### GET /stats

**Purpose:** Get aggregated weight statistics

**Request:**
```http
GET /stats HTTP/1.1
Accept: application/json
```

**Success Response (200):**
```json
{
  "success": true,
  "stats": {
    "count": 1523,
    "average": 2.34,
    "min": 0.01,
    "max": 15.67,
    "latest": 2.45
  }
}
```

---

### GET /log-files

**Purpose:** List available log files

**Request:**
```http
GET /log-files HTTP/1.1
Accept: application/json
```

**Success Response (200):**
```json
{
  "success": true,
  "files": [
    "2025-12-10.log",
    "2025-12-09.log",
    "2025-12-08.log"
  ]
}
```

---

## NFC Endpoints

### POST /nfc

**Purpose:** Receive NFC card detection event from ESP32

**Request:**
```http
POST /nfc HTTP/1.1
Content-Type: application/json

{
  "nfc_uid": "04A3B2C1",
  "event": "nfc_detected"  // Optional, defaults to "nfc_detected"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "NFC event received",
  "uid": "04A3B2C1",
  "timestamp": "2025-12-10T12:00:00.000Z"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "NFC UID is required"
}
```

**Server Storage:**
- Events stored in memory array (`nfcEvents`)
- Max 100 events retained
- Each event has `processed: false` initially

---

### GET /nfc

**Purpose:** Poll for recent NFC events (used by frontend)

**Request:**
```http
GET /nfc?unprocessed=true&limit=1 HTTP/1.1
Accept: application/json
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 10 | Max events to return |
| `unprocessed` | string | false | Filter unprocessed only |

**Success Response (200):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "uid": "04A3B2C1",
      "event": "nfc_detected",
      "timestamp": "2025-12-10T12:00:00.000Z",
      "deviceId": "192.168.1.100",
      "processed": false
    }
  ]
}
```

**Frontend Usage:**
```typescript
// src/hooks/useNFCDetection.ts
const response = await fetch(`${serverUrl}/nfc?unprocessed=true&limit=1`);
const data = await response.json();

if (data.data.length > 0) {
  const latestEvent = data.data[data.data.length - 1];
  onNFCDetected(latestEvent);
}
```

---

### POST /nfc/mark-processed

**Purpose:** Mark an NFC event as processed (prevents duplicate checkout prompts)

**Request:**
```http
POST /nfc/mark-processed HTTP/1.1
Content-Type: application/json

{
  "uid": "04A3B2C1",
  "timestamp": "2025-12-10T12:00:00.000Z"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Event marked as processed"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "UID and timestamp are required"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Event not found"
}
```

---

## Status Endpoints

### GET /status

**Purpose:** Health check and server status

**Request:**
```http
GET /status HTTP/1.1
Accept: application/json
```

**Success Response (200):**
```json
{
  "status": "online",
  "timestamp": "2025-12-10T12:00:00.000Z",
  "uptime": 3600.5,
  "environment": "development",
  "stats": {
    "count": 1523,
    "average": 2.34,
    "min": 0.01,
    "max": 15.67,
    "latest": 2.45
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful request |
| 400 | Bad Request | Invalid input data |
| 404 | Not Found | Unknown endpoint or missing resource |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

### Standard Error Response Format

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Rate Limiting

```
Limit: 1000 requests per minute per IP
Endpoint: /weight only
Window: 60 seconds
```

**Rate Limit Response (429):**
```json
{
  "message": "Too many requests from this IP, please try again later."
}
```

### CORS

Allowed origins configured via environment:
```
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000
```

CORS error manifests as browser blocking the request, not a server response.

---

## ESP32 Client Example

```cpp
// Arduino/ESP32 code snippet for sending weight

#include <WiFi.h>
#include <HTTPClient.h>

void sendWeight(float weight) {
  HTTPClient http;
  http.begin("https://your-server.com/weight");
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"weight\":" + String(weight, 2) + "}";
  int httpCode = http.POST(payload);

  if (httpCode == 200) {
    Serial.println("Weight sent successfully");
  }

  http.end();
}

void sendNFCEvent(String uid) {
  HTTPClient http;
  http.begin("https://your-server.com/nfc");
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"nfc_uid\":\"" + uid + "\",\"event\":\"nfc_detected\"}";
  int httpCode = http.POST(payload);

  if (httpCode == 200) {
    Serial.println("NFC event sent");
  }

  http.end();
}
```
