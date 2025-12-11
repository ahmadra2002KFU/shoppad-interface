# ShopPad Vercel Deployment Analysis

## Executive Summary

**CRITICAL: This application CANNOT be fully deployed on Vercel as-is.**

The ShopPad application consists of two components:
1. **Frontend** (Vercel Compatible): React SPA that CAN be deployed on Vercel
2. **Backend** (NOT Vercel Compatible): Express server with SQLite that CANNOT be deployed on Vercel

---

## Architecture Overview

### Frontend Stack
- **Framework**: Vite + React 18 + TypeScript
- **UI Library**: Shadcn/UI (Radix primitives + Tailwind CSS)
- **State Management**: TanStack Query + React Context
- **Routing**: React Router DOM v6
- **Build Output**: Static SPA (dist folder)

### Backend Stack
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: SQLite via `better-sqlite3` (native bindings)
- **Authentication**: JWT + bcrypt
- **Process Manager**: PM2 (production)

---

## Why Backend Cannot Run on Vercel

### 1. SQLite with Native Bindings
```javascript
// server/database/index.js
import Database from 'better-sqlite3';
```
- `better-sqlite3` uses C++ native bindings
- Requires compilation during install
- Needs persistent filesystem access
- **Vercel has ephemeral, read-only filesystem**

### 2. Persistent Server Architecture
```javascript
// server/server.js
server.listen(config.server.port, config.server.host, () => {
  // Long-running server
});
```
- Express server runs continuously
- Handles real-time ESP32 weight sensor data
- Stores NFC events in memory
- **Vercel runs serverless functions with cold starts**

### 3. In-Memory State
```javascript
// server/server.js
let nfcEvents = [];
const MAX_NFC_EVENTS = 100;
```
- NFC events stored in memory
- Lost on every serverless function cold start
- **Vercel functions are stateless**

### 4. File-Based Data Storage
```javascript
// server/config.js
data: {
  file: process.env.DATA_FILE || './data/weight-data.json',
}
```
- Weight data saved to JSON file
- Logs written to filesystem
- **Vercel filesystem is ephemeral**

---

## Deployment Solutions

### Option A: Split Deployment (RECOMMENDED)

Deploy frontend and backend separately:

| Component | Platform | Configuration |
|-----------|----------|---------------|
| Frontend | Vercel | Standard Vite deployment |
| Backend | Railway / Render / Fly.io | Docker container |

#### Frontend on Vercel

1. Set environment variable:
```env
VITE_SERVER_URL=https://your-backend.railway.app
```

2. The existing `vercel.json` is already configured correctly:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

#### Backend on Railway/Render

Use the existing Docker configuration:
- `server/Dockerfile` - Already configured
- `docker-compose.yml` - Reference for volumes

Environment variables needed:
```env
NODE_ENV=production
PORT=5050
USE_HTTPS=false
JWT_SECRET=<generate-secure-secret>
ALLOWED_ORIGINS=https://your-app.vercel.app
DATABASE_PATH=/app/data/shoppad.db
```

### Option B: Full Vercel Migration (Significant Effort)

Convert the entire backend to Vercel-compatible architecture:

#### Required Changes:

1. **Replace SQLite with PostgreSQL**
   - Use Supabase, Neon, or PlanetScale
   - Rewrite all models and queries
   - Add connection pooling

2. **Convert Express to Serverless Functions**
   - Create `/api/*.ts` files
   - Rewrite each route as a function
   - Handle cold start latency

3. **Replace In-Memory State with Redis**
   - Use Upstash Redis for NFC events
   - Add pub/sub for real-time features

4. **Handle File Storage**
   - Weight data logs to database
   - Use Vercel Blob for files

**Estimated effort**: 40-80 hours of refactoring

### Option C: Use Coolify/Docker (Already Configured)

The project has existing Docker configuration for Coolify:
- `docker-compose.yml`
- `Dockerfile` (frontend)
- `server/Dockerfile` (backend)
- `.env.coolify`

This is a viable alternative to Vercel for full-stack deployment.

---

## Frontend Changes Required for Vercel

### 1. Environment Variable Configuration

Create a `.env.production` file:
```env
VITE_SERVER_URL=https://your-backend-url.com
```

### 2. API Configuration Update

The current config (`src/config/api.ts`) already supports this:
```typescript
export const API_CONFIG = {
  SERVER_URL: import.meta.env.VITE_SERVER_URL || 'https://localhost:5050',
};
```

### 3. CORS Configuration on Backend

Update `ALLOWED_ORIGINS` to include Vercel domain:
```env
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-custom-domain.com
```

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Backend not on Vercel | HIGH | Use Railway/Render for backend |
| Database persistence | HIGH | Use managed database service |
| Real-time features | MEDIUM | Consider WebSocket service |
| ESP32 IoT integration | LOW | Backend handles this independently |
| Cold start latency | MEDIUM | Keep backend on persistent host |

---

## Recommended Deployment Architecture

```
                    +-----------------+
                    |    Vercel       |
                    |   (Frontend)    |
                    |  React SPA      |
                    +--------+--------+
                             |
                             | HTTPS
                             v
+----------------+  +--------+--------+  +------------------+
|   ESP32/IoT    |  |    Railway      |  |   Users Phone    |
|   Devices      |->|   (Backend)     |<-|   QR Login       |
|   NFC Reader   |  |   Express.js    |  |                  |
+----------------+  +--------+--------+  +------------------+
                             |
                             | SQLite
                             v
                    +--------+--------+
                    |   Persistent    |
                    |   Volume        |
                    |   (Database)    |
                    +-----------------+
```

---

## Action Items

### Immediate (Required for Vercel Deployment)

- [ ] Deploy backend to Railway/Render/Fly.io
- [ ] Set `VITE_SERVER_URL` environment variable in Vercel
- [ ] Update `ALLOWED_ORIGINS` on backend to include Vercel domain
- [ ] Test frontend-backend communication

### Optional Improvements

- [ ] Add health check monitoring for backend
- [ ] Configure custom domain on Vercel
- [ ] Set up SSL certificates (handled by platforms)
- [ ] Add error tracking (Sentry)

---

## Files Reference

### Frontend (Deploy to Vercel)
- `package.json` - Build configuration
- `vite.config.ts` - Vite configuration
- `vercel.json` - Vercel settings (already configured)
- `src/config/api.ts` - API URL configuration

### Backend (Deploy to Railway/Render)
- `server/package.json` - Backend dependencies
- `server/server.js` - Main server file
- `server/Dockerfile` - Container configuration
- `server/.env.example` - Environment template

### Docker (Alternative)
- `docker-compose.yml` - Full stack config
- `Dockerfile` - Frontend container
- `.env.coolify` - Environment template
