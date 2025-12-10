# Deployment Guide

## Vercel Deployment

The Shoppad Interface is configured for deployment on Vercel.

### Configuration

The `vercel.json` file includes:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Deployment Steps

#### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Deploy to production
vercel --prod
```

#### Option 2: Git Integration

1. Push code to GitHub/GitLab/Bitbucket
2. Connect repository to Vercel
3. Vercel auto-deploys on push to main branch

### Environment Variables

Set these in Vercel dashboard (Settings > Environment Variables):

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SERVER_URL` | ESP32 backend server URL | `https://your-server:5050` |

### Build Output

```
dist/
├── index.html
├── assets/
│   ├── *.js      # JavaScript bundles
│   ├── *.css     # Stylesheets
│   └── *.jpg     # Product images
```

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Opens at http://localhost:8080

# Build for production
npm run build

# Preview production build
npm run preview
```

## Android Deployment Considerations

For running on cheap Android phones:

### Performance Optimizations

1. **Code Splitting** (Future)
   - Lazy load routes
   - Dynamic imports for heavy components

2. **Image Optimization**
   - Consider WebP format
   - Implement lazy loading for images
   - Reduce image sizes

3. **Bundle Size**
   - Current bundle: ~1.1MB (337KB gzipped)
   - Consider removing unused Shadcn components
   - Tree-shaking is enabled

### PWA Considerations (Future)

For offline support and app-like experience:

1. Add service worker
2. Configure manifest.json
3. Implement offline caching strategy

### WebView/Capacitor

For native-like Android app:

```bash
# Install Capacitor (optional)
npm install @capacitor/core @capacitor/cli
npx cap init

# Add Android platform
npx cap add android

# Build and sync
npm run build
npx cap sync

# Open in Android Studio
npx cap open android
```

## ESP32 Backend Configuration

The app expects an HTTPS server at the configured URL:

### Required Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/weight` | GET | Current weight reading |
| `/status` | GET | Server health check |
| `/nfc` | GET | NFC card events |
| `/nfc/mark-processed` | POST | Mark NFC as processed |

### CORS Configuration

Backend must allow:
- Origin: Your Vercel deployment URL
- Methods: GET, POST
- Headers: Content-Type, Accept

### HTTPS Certificate

For local development with self-signed certificates:
1. Visit backend URL directly in browser
2. Accept security warning
3. Then app can make requests

For production:
- Use proper CA-signed SSL certificates
- Consider Let's Encrypt for free certificates

## Troubleshooting

### Common Issues

**Build Fails**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run build
```

**Camera Not Working**
- Requires HTTPS (Vercel provides this)
- Browser camera permissions needed
- Check camera availability on device

**NFC Not Detecting**
- Check ESP32 server is running
- Verify VITE_SERVER_URL is correct
- Check CORS configuration

**Large Bundle Warning**
- Bundle > 500KB is expected
- Shadcn UI includes many components
- Consider code-splitting for production
