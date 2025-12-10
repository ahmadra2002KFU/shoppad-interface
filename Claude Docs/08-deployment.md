# Deployment Configuration

**Document:** Deployment Configuration (Render, Vercel, Local)
**Last Updated:** December 10, 2025

---

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Frontend Deployment](#frontend-deployment)
3. [Backend Deployment](#backend-deployment)
4. [Local Development](#local-development)
5. [Environment Variables](#environment-variables)

---

## Deployment Overview

### Architecture

```
+-------------------+        +-------------------+
|   Frontend        |        |   Backend Server  |
|   (React SPA)     |        |   (Express.js)    |
+-------------------+        +-------------------+
        |                            |
        v                            v
+-------------------+        +-------------------+
|   Vercel /        |        |   Render /        |
|   Netlify /       |        |   DigitalOcean /  |
|   Static Host     |        |   VPS             |
+-------------------+        +-------------------+
```

### Deployment Options

| Component | Recommended | Alternatives |
|-----------|-------------|--------------|
| Frontend | Vercel | Netlify, GitHub Pages, Cloudflare |
| Backend | Render | DigitalOcean, Railway, VPS |

---

## Frontend Deployment

### Build Command

```bash
npm run build
# Output: /dist folder
```

### Vite Configuration

**Location:** `vite.config.ts`

```typescript
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
```

### Vercel Deployment

**Steps:**
1. Connect GitHub repository to Vercel
2. Configure:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
3. Add environment variables
4. Deploy

**Environment Variables for Vercel:**
```
VITE_SERVER_URL=https://your-backend.onrender.com
```

### Netlify Deployment

**netlify.toml (create in root):**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Static File Hosting

The `/dist` folder contains:
- `index.html` - Entry point
- `assets/` - JS, CSS, images (hashed filenames)
- `favicon.ico`
- `robots.txt`

Can be deployed to any static host (S3, GitHub Pages, etc.)

---

## Backend Deployment

### Render.com Configuration

**Location:** `render.yaml`

```yaml
services:
  - type: web
    name: shoppad-weight-server
    env: node
    region: oregon
    plan: free
    branch: main
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: USE_HTTPS
        value: false  # Render handles SSL
      - key: PORT
        value: 10000
      - key: HOST
        value: 0.0.0.0
      - key: LOG_RETENTION_DAYS
        value: 30
      - key: RATE_LIMIT_MAX_REQUESTS
        value: 1000
      - key: MAX_DATA_ENTRIES
        value: 50000
      - key: ALLOWED_ORIGINS
        generateValue: true  # Set manually
    healthCheckPath: /status
    autoDeploy: true
```

**Render Dashboard Setup:**
1. New Web Service
2. Connect repository
3. Build: `cd server && npm install`
4. Start: `cd server && npm start`
5. Add environment variables
6. Deploy

**Important Render Notes:**
- SSL termination handled by Render (use HTTP internally)
- Set `USE_HTTPS=false`
- Port assigned dynamically (use `process.env.PORT`)

### DigitalOcean App Platform

**Similar configuration:**
1. Create App
2. Source: GitHub repository
3. Component: Web Service
4. Build: `cd server && npm install`
5. Run: `cd server && npm start`
6. Environment variables
7. Deploy

### Manual VPS Deployment

```bash
# On VPS (Ubuntu/Debian)
# 1. Clone repository
git clone https://github.com/your-repo/shoppad-interface.git
cd shoppad-interface/server

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
nano .env  # Configure variables

# 4. Generate SSL (if using HTTPS directly)
npm run generate-certs

# 5. Run with PM2
npm install -g pm2
pm2 start server.js --name "shoppad-server"
pm2 save
pm2 startup

# 6. Setup Nginx reverse proxy (optional)
# Use nginx-config.conf as reference
```

### Nginx Configuration

**Location:** `server/nginx-config.conf`

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/ssl/certs/your-cert.pem;
    ssl_certificate_key /etc/ssl/private/your-key.pem;

    location / {
        proxy_pass http://localhost:5050;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Local Development

### Frontend

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# Opens http://localhost:8080

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Server

```bash
cd server

# Install dependencies
npm install

# Generate SSL certificates (for local HTTPS)
npm run generate-certs

# Start server (development)
npm start
# Opens https://localhost:5050

# View logs
npm run view-logs

# Clean old logs
npm run clean-logs
```

### Full Stack Local

1. **Terminal 1 - Backend:**
```bash
cd server && npm start
```

2. **Terminal 2 - Frontend:**
```bash
npm run dev
```

3. **Browser:**
- Frontend: http://localhost:8080
- Backend status: https://localhost:5050/status (accept self-signed cert)

### SSL Certificate for Local HTTPS

```bash
cd server
npm run generate-certs
# Creates:
#   server/ssl/key.pem
#   server/ssl/cert.pem
```

**First-time browser setup:**
1. Visit https://localhost:5050/status
2. Accept security warning for self-signed certificate
3. Frontend can now make requests

---

## Environment Variables

### Frontend Environment

**Location:** `.env` (create in project root)

```bash
# Backend server URL
VITE_SERVER_URL=https://localhost:5050

# For production
VITE_SERVER_URL=https://your-backend.onrender.com
```

### Backend Environment

**Location:** `server/.env`

```bash
# Server
PORT=5050
HOST=0.0.0.0
NODE_ENV=development  # or production

# SSL (local dev only)
USE_HTTPS=true
SSL_KEY_PATH=./ssl/key.pem
SSL_CERT_PATH=./ssl/cert.pem

# Logging
LOG_RETENTION_DAYS=30
LOG_DIRECTORY=./logs

# Security
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000

# CORS (comma-separated)
ALLOWED_ORIGINS=http://localhost:8080,https://your-frontend.vercel.app

# Data
DATA_FILE=./data/weight-data.json
MAX_DATA_ENTRIES=10000
```

### Production Checklist

**Frontend:**
- [ ] Set `VITE_SERVER_URL` to production backend
- [ ] Run `npm run build`
- [ ] Deploy `/dist` folder

**Backend:**
- [ ] Set `NODE_ENV=production`
- [ ] Set `USE_HTTPS=false` (if platform handles SSL)
- [ ] Configure `ALLOWED_ORIGINS` for production frontend
- [ ] Increase `MAX_DATA_ENTRIES` if needed
- [ ] Set up health check monitoring (`/status`)

### CORS Configuration

**Development:**
```
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000
```

**Production:**
```
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-domain.com
```

---

## Scripts Reference

### Frontend (package.json)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

### Backend (server/package.json - implied)

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "generate-certs": "node generate-certs.js",
    "view-logs": "node view-logs.js",
    "clean-logs": "node clean-logs.js",
    "test": "node test-server.js"
  }
}
```
