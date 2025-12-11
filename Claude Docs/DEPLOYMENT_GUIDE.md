# ShopPad Deployment Guide

## Recommended Setup: Frontend on Vercel + Backend on Railway

This guide walks through deploying ShopPad with the frontend on Vercel and backend on Railway.

---

## Part 1: Deploy Backend to Railway

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect your GitHub account
4. Select the shoppad-interface repository

### Step 3: Configure Service
1. Railway will auto-detect the Dockerfile in `/server`
2. If not, manually set:
   - **Root Directory**: `server`
   - **Builder**: Dockerfile

### Step 4: Set Environment Variables
In Railway dashboard, go to Variables and add:

```env
NODE_ENV=production
PORT=5050
HOST=0.0.0.0
USE_HTTPS=false
JWT_SECRET=<generate-a-secure-random-string-here>
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=https://your-app.vercel.app
DATABASE_PATH=/app/data/shoppad.db
LOG_RETENTION_DAYS=30
RATE_LIMIT_MAX_REQUESTS=1000
MAX_DATA_ENTRIES=50000
```

**Important**: Generate a secure JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 5: Add Persistent Volume
1. Go to Settings > Volumes
2. Add volume:
   - Mount Path: `/app/data`
   - Size: 1GB (or more)

This ensures your SQLite database persists across deployments.

### Step 6: Deploy
1. Railway will automatically deploy
2. Wait for build to complete
3. Note your Railway URL (e.g., `https://shoppad-backend-production.up.railway.app`)

### Step 7: Verify Backend
Test the health endpoint:
```bash
curl https://your-railway-url.up.railway.app/status
```

Expected response:
```json
{
  "status": "online",
  "timestamp": "2024-...",
  "uptime": 123.456,
  "environment": "production"
}
```

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### Step 2: Import Project
1. Click "Add New" > "Project"
2. Import from GitHub
3. Select the shoppad-interface repository

### Step 3: Configure Build Settings
Vercel should auto-detect Vite. Verify these settings:

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Root Directory | `.` (root) |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### Step 4: Set Environment Variables
Add this environment variable:

```env
VITE_SERVER_URL=https://your-railway-url.up.railway.app
```

**Replace** `your-railway-url.up.railway.app` with your actual Railway URL from Part 1.

### Step 5: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Note your Vercel URL (e.g., `https://shoppad.vercel.app`)

### Step 6: Update Backend CORS
Go back to Railway and update the `ALLOWED_ORIGINS`:

```env
ALLOWED_ORIGINS=https://shoppad.vercel.app,https://your-custom-domain.com
```

Redeploy Railway for changes to take effect.

---

## Part 3: Custom Domain (Optional)

### Vercel Custom Domain
1. Go to Vercel Project Settings > Domains
2. Add your domain
3. Update DNS records as instructed

### Railway Custom Domain
1. Go to Railway Project Settings > Custom Domains
2. Add your API subdomain (e.g., `api.yourdomain.com`)
3. Update DNS records

### Update Environment Variables
After adding custom domains:

**Frontend (Vercel)**:
```env
VITE_SERVER_URL=https://api.yourdomain.com
```

**Backend (Railway)**:
```env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

## Part 4: ESP32 Configuration

Update your ESP32 firmware to use the new backend URL:

```cpp
// ESP32 Configuration
#define SERVER_URL "your-railway-url.up.railway.app"
#define SERVER_PORT 443  // HTTPS
#define WEIGHT_ENDPOINT "/weight"
#define NFC_PAYMENT_ENDPOINT "/nfc/payment"
```

The Railway URL uses HTTPS with SSL termination handled by Railway.

---

## Verification Checklist

### Backend (Railway)
- [ ] `/status` returns online status
- [ ] `/auth/register` creates new user
- [ ] `/products` returns product list
- [ ] Logs show no errors

### Frontend (Vercel)
- [ ] App loads without console errors
- [ ] Login/Register works
- [ ] Products display correctly
- [ ] Cart operations work
- [ ] Network tab shows API calls to Railway URL

### Integration
- [ ] Add item to cart (should sync to server if logged in)
- [ ] Complete checkout flow
- [ ] QR login flow works
- [ ] NFC detection (if ESP32 connected)

---

## Troubleshooting

### CORS Errors
```
Access to fetch at 'https://...' has been blocked by CORS policy
```
**Solution**: Ensure `ALLOWED_ORIGINS` in Railway includes your Vercel URL exactly.

### 502 Bad Gateway
**Solution**:
1. Check Railway logs for errors
2. Ensure database volume is mounted
3. Verify PORT is 5050

### Database Errors
```
SQLITE_CANTOPEN
```
**Solution**: Check that the volume is mounted at `/app/data`

### JWT Errors
```
Invalid token
```
**Solution**: Ensure `JWT_SECRET` is the same across all deployments

### Build Fails on Vercel
**Solution**:
1. Check Node.js version compatibility
2. Ensure all dependencies are in package.json
3. Check for TypeScript errors

---

## Alternative: Deploy to Render

If Railway doesn't work, use Render:

### Backend on Render
1. Create account at [render.com](https://render.com)
2. New Web Service
3. Connect repository
4. Settings:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. Add environment variables (same as Railway)
6. Add disk (for SQLite persistence)

---

## Alternative: Full Docker on Coolify

Use the existing docker-compose.yml for self-hosted deployment:

```bash
# On your server
git clone <repo>
cd shoppad-interface
cp .env.coolify .env

# Edit .env with your values
nano .env

# Start services
docker-compose up -d
```

---

## Monitoring & Maintenance

### Railway
- View logs in Railway dashboard
- Set up alerts for downtime

### Vercel
- Analytics available in dashboard
- Set up speed insights

### Database Backups
Create a cron job or scheduled task to backup SQLite:
```bash
# On Railway, you might need a separate backup solution
# Or use Railway's volume snapshots
```

---

## Cost Estimates

| Platform | Free Tier | Paid |
|----------|-----------|------|
| Vercel | Yes (generous) | $20/mo team |
| Railway | $5 credit/mo | $5+/mo |
| Render | 750hrs/mo | $7/mo |

For production, expect ~$10-20/month total.
