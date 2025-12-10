# Coolify Deployment Guide for ShopPad

## Overview

ShopPad consists of two services:
- **Frontend**: React + Vite application (served via Nginx)
- **Backend**: Node.js Express API server (SQLite database)

---

## Deployment Options

### Option A: Docker Compose (Recommended)

1. In Coolify, create a new **Docker Compose** project
2. Connect your Git repository
3. Coolify will automatically detect `docker-compose.yml`
4. Set environment variables (see below)
5. Deploy!

### Option B: Separate Services

Deploy frontend and backend as separate Coolify services:

#### Backend Service
- **Build Pack**: Dockerfile
- **Dockerfile Path**: `server/Dockerfile`
- **Port**: 5050

#### Frontend Service
- **Build Pack**: Dockerfile
- **Dockerfile Path**: `Dockerfile` (root)
- **Port**: 80
- **Build Arg**: `VITE_SERVER_URL=https://your-backend-url`

---

## Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | **REQUIRED** - Secret for JWT tokens | `openssl rand -base64 32` |
| `VITE_SERVER_URL` | Backend API URL for frontend | `https://api.shop.example.com` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://shop.example.com` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `https://shop.example.com` |

## Optional Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_EXPIRES_IN` | `7d` | Token expiration |
| `LOG_RETENTION_DAYS` | `30` | Log retention period |
| `RATE_LIMIT_MAX_REQUESTS` | `1000` | Max requests per minute |
| `MAX_DATA_ENTRIES` | `50000` | Max data entries |

---

## Pre-Deployment Checklist

### 1. Security
- [ ] Generate a secure `JWT_SECRET` (use `openssl rand -base64 32`)
- [ ] Never commit secrets to Git
- [ ] Ensure HTTPS is enabled in Coolify

### 2. Domains
- [ ] Set up domain for frontend (e.g., `shop.example.com`)
- [ ] Set up domain for backend (e.g., `api.shop.example.com`)
- [ ] Configure DNS records pointing to Coolify server

### 3. Environment Variables
- [ ] Set `JWT_SECRET` (required)
- [ ] Set `VITE_SERVER_URL` to backend URL
- [ ] Set `FRONTEND_URL` to frontend URL
- [ ] Set `ALLOWED_ORIGINS` to frontend URL

### 4. SSL/HTTPS
- [ ] Enable SSL in Coolify for both services
- [ ] Let Coolify handle certificate generation (Let's Encrypt)

---

## Post-Deployment Verification

### 1. Health Checks

```bash
# Check backend status
curl https://api.shop.example.com/status

# Expected response:
# {"status":"online","timestamp":"...","uptime":...}
```

```bash
# Check frontend
curl -I https://shop.example.com

# Expected: HTTP 200
```

### 2. API Test

```bash
# Test registration
curl -X POST https://api.shop.example.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"0501234567","password":"test123"}'
```

### 3. Frontend Test
- Open frontend URL in browser
- Try to register a new account
- Verify no CORS errors in browser console

---

## Troubleshooting

### CORS Errors
- Ensure `ALLOWED_ORIGINS` includes your frontend URL (with https://)
- Check that backend URL in frontend matches actual backend domain

### Database Errors
- Data persists in Docker volume `shoppad-data`
- Check logs: `docker logs shoppad-backend`

### Connection Refused
- Verify both containers are running
- Check Coolify logs for startup errors
- Ensure ports are correctly exposed

### JWT Errors
- Ensure `JWT_SECRET` is set and consistent
- Check token expiration (`JWT_EXPIRES_IN`)

---

## Architecture

```
                    ┌─────────────────┐
                    │   Coolify SSL   │
                    │  (Let's Encrypt)│
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
    ┌─────────────────┐          ┌─────────────────┐
    │    Frontend     │          │    Backend      │
    │  (Nginx + React)│   ───►   │  (Node.js API)  │
    │    Port 80      │  HTTPS   │    Port 5050    │
    └─────────────────┘          └────────┬────────┘
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │   SQLite DB     │
                                 │ (Docker Volume) │
                                 └─────────────────┘
```

---

## Data Persistence

The following Docker volumes are created:
- `shoppad-data`: SQLite database and weight data
- `shoppad-logs`: Server logs

To backup:
```bash
docker cp shoppad-backend:/app/data ./backup
```

---

## Updating

1. Push changes to your Git repository
2. Coolify will auto-deploy (if enabled) or manually trigger deployment
3. Zero-downtime deployment with health checks

---

## Support

If you encounter issues:
1. Check Coolify deployment logs
2. Check container logs: `docker logs <container-name>`
3. Verify environment variables are set correctly
4. Test API endpoints directly with curl
