# ShopPad Issues and Required Fixes

## Critical Issues (Must Fix)

### Issue 1: Backend Cannot Deploy on Vercel
**Severity**: CRITICAL
**Status**: By Design

**Problem**: The backend uses:
- `better-sqlite3` (native bindings)
- Persistent Express server
- In-memory NFC events storage
- File-based logging

**Solution**: Deploy backend separately on Railway/Render (see DEPLOYMENT_GUIDE.md)

---

### Issue 2: Hardcoded Product Data
**Severity**: MEDIUM
**Status**: Needs Fix

**Problem**: Products are hardcoded in `src/data/products.ts` instead of fetched from API.

**Location**: `src/pages/Shopping.tsx:106-108`
```typescript
import { products, categories } from "@/data/products";
// ...
const filteredProducts = selectedCategory
  ? products.filter((p) => p.category === selectedCategory)
  : products;
```

**Solution**: Fetch products from API:
```typescript
// Use TanStack Query to fetch from API
const { data: products } = useQuery({
  queryKey: ['products'],
  queryFn: () => api.getProducts()
});
```

**Note**: The backend `/products` endpoint exists and is seeded with data.

---

### Issue 3: API URL Configuration
**Severity**: MEDIUM
**Status**: Configured but needs verification

**Problem**: API URL defaults to localhost in production.

**Location**: `src/config/api.ts:8`
```typescript
SERVER_URL: import.meta.env.VITE_SERVER_URL || 'https://localhost:5050',
```

**Solution**: Set `VITE_SERVER_URL` environment variable in Vercel.

---

## Medium Issues (Should Fix)

### Issue 4: Weight Display Hardcoded Connection
**Severity**: MEDIUM
**Status**: Needs Fix

**Problem**: The weight display may show errors if backend is unreachable.

**Location**: `src/hooks/useESP32Weight.ts`

**Solution**: Add better error handling and fallback UI when server is unavailable.

---

### Issue 5: NFC Polling Without Authentication Check
**Severity**: LOW
**Status**: Design Decision

**Problem**: NFC events are polled even when user is not authenticated.

**Location**: `src/hooks/useNFCDetection.ts`

**Solution**: Consider disabling polling when not authenticated to reduce server load.

---

### Issue 6: Missing Error Boundaries
**Severity**: MEDIUM
**Status**: Needs Fix

**Problem**: No React error boundaries implemented.

**Solution**: Add error boundaries to prevent full app crashes.

---

## Low Priority Issues (Nice to Have)

### Issue 7: Token Storage in localStorage
**Severity**: LOW
**Status**: Security Consideration

**Problem**: JWT token stored in localStorage is vulnerable to XSS.

**Solution**: Consider using httpOnly cookies (requires backend changes).

---

### Issue 8: Missing Loading States
**Severity**: LOW
**Status**: UX Improvement

**Problem**: Some API calls don't show loading states.

**Solution**: Add skeleton loaders and loading indicators.

---

### Issue 9: No Service Worker
**Severity**: LOW
**Status**: Enhancement

**Problem**: No PWA/offline capabilities beyond localStorage cart.

**Solution**: Add service worker for better offline experience.

---

## Code Quality Issues

### Issue 10: TypeScript Strict Mode Disabled
**Status**: Design Decision

**Location**: `tsconfig.json`
```json
{
  "noImplicitAny": false,
  "strictNullChecks": false
}
```

**Impact**: Potential runtime errors from type mismatches.

---

### Issue 11: Console Logs in Production
**Status**: Should Clean

**Problem**: Multiple console.log statements in production code.

**Solution**: Remove or use proper logging service.

---

## Backend Issues

### Issue 12: In-Memory NFC Events
**Severity**: MEDIUM
**Status**: By Design

**Problem**: NFC events stored in memory are lost on server restart.

**Location**: `server/server.js:188-189`
```javascript
let nfcEvents = [];
const MAX_NFC_EVENTS = 100;
```

**Solution**: Store in database instead:
```sql
CREATE TABLE nfc_events (
  id TEXT PRIMARY KEY,
  uid TEXT NOT NULL,
  event TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  processed INTEGER DEFAULT 0
);
```

---

### Issue 13: Simulated Payment Processing
**Severity**: INFO
**Status**: Expected for Demo

**Location**: `server/server.js:376`
```javascript
// Process payment (simulated with 90% success rate)
const isSuccess = Math.random() > 0.1;
```

**Note**: Real payment integration needed for production.

---

## Recommended Fix Priority

1. **Immediate** (Before Vercel Deployment)
   - Issue 1: Deploy backend to Railway
   - Issue 3: Set VITE_SERVER_URL in Vercel

2. **Short Term** (After Initial Deployment)
   - Issue 2: Fetch products from API
   - Issue 6: Add error boundaries
   - Issue 12: Store NFC events in database

3. **Medium Term** (Production Hardening)
   - Issue 4: Better error handling
   - Issue 5: Optimize polling
   - Issue 8: Add loading states

4. **Long Term** (Enhancement)
   - Issue 7: Improve token security
   - Issue 9: Add PWA support
   - Issue 10: Enable TypeScript strict mode
