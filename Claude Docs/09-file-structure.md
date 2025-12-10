# File Structure

**Document:** Complete File Tree and Purposes
**Last Updated:** December 10, 2025

---

## Project Root

```
shoppad-interface/
|
+-- .git/                     # Git repository
+-- .gitignore                # Git ignore patterns
|
+-- Claude Docs/              # This documentation
|   +-- 00-overview.md
|   +-- 01-architecture.md
|   +-- ... (9 more docs)
|
+-- dist/                     # Production build output
|   +-- index.html
|   +-- assets/
|   +-- favicon.ico
|   +-- robots.txt
|
+-- node_modules/             # Frontend dependencies
|
+-- public/                   # Static assets (copied to dist)
|   +-- favicon.ico
|   +-- placeholder.svg
|   +-- robots.txt
|
+-- server/                   # Backend Express server
|   +-- ... (see server section)
|
+-- src/                      # Frontend source code
|   +-- ... (see src section)
|
+-- Configuration Files
|   +-- bun.lockb             # Bun package lock
|   +-- components.json       # shadcn/ui config
|   +-- eslint.config.js      # ESLint configuration
|   +-- index.html            # HTML entry point
|   +-- package.json          # NPM dependencies
|   +-- package-lock.json     # NPM lock file
|   +-- postcss.config.js     # PostCSS config
|   +-- render.yaml           # Render.com deployment
|   +-- tailwind.config.ts    # Tailwind CSS config
|   +-- tsconfig.json         # TypeScript config
|   +-- tsconfig.app.json     # App TypeScript config
|   +-- tsconfig.node.json    # Node TypeScript config
|   +-- vite.config.ts        # Vite bundler config
|
+-- Documentation (existing)
    +-- README.md
    +-- DEPLOYMENT.md
    +-- BARCODE_*.md (5 files)
    +-- QR_CODE_*.md (7 files)
    +-- RFID_*.md (4 files)
    +-- ... (other docs)
```

---

## Source Directory (src/)

```
src/
|
+-- main.tsx                  # React entry point
+-- App.tsx                   # Root component with providers
+-- App.css                   # App-specific styles (minimal)
+-- index.css                 # Global styles + Tailwind
+-- vite-env.d.ts             # Vite type declarations
|
+-- assets/                   # Image assets
|   +-- apple.jpg
|   +-- banana.jpg
|   +-- bread.jpg
|   +-- carrot.jpg
|   +-- cheese.jpg
|   +-- chicken.jpg
|   +-- cleaning.jpg
|   +-- clothing.jpg
|   +-- hero-shopping.jpg
|   +-- juice.jpg
|   +-- kitchen.jpg
|   +-- milk.jpg
|   +-- oil.jpg
|   +-- pasta.jpg
|   +-- potato.jpg
|   +-- rice.jpg
|   +-- snacks.jpg
|   +-- soap.jpg
|   +-- store-map.jpg
|   +-- tissue.jpg
|   +-- tomato.jpg
|
+-- components/               # React components
|   |
|   +-- ui/                   # shadcn/ui components (51 files)
|   |   +-- accordion.tsx
|   |   +-- alert-dialog.tsx
|   |   +-- alert.tsx
|   |   +-- aspect-ratio.tsx
|   |   +-- avatar.tsx
|   |   +-- badge.tsx
|   |   +-- breadcrumb.tsx
|   |   +-- button.tsx
|   |   +-- calendar.tsx
|   |   +-- card.tsx
|   |   +-- carousel.tsx
|   |   +-- chart.tsx
|   |   +-- checkbox.tsx
|   |   +-- collapsible.tsx
|   |   +-- command.tsx
|   |   +-- context-menu.tsx
|   |   +-- dialog.tsx
|   |   +-- drawer.tsx
|   |   +-- dropdown-menu.tsx
|   |   +-- form.tsx
|   |   +-- hover-card.tsx
|   |   +-- input-otp.tsx
|   |   +-- input.tsx
|   |   +-- label.tsx
|   |   +-- menubar.tsx
|   |   +-- navigation-menu.tsx
|   |   +-- pagination.tsx
|   |   +-- popover.tsx
|   |   +-- progress.tsx
|   |   +-- radio-group.tsx
|   |   +-- resizable.tsx
|   |   +-- scroll-area.tsx
|   |   +-- select.tsx
|   |   +-- separator.tsx
|   |   +-- sheet.tsx
|   |   +-- sidebar.tsx
|   |   +-- skeleton.tsx
|   |   +-- slider.tsx
|   |   +-- sonner.tsx
|   |   +-- switch.tsx
|   |   +-- table.tsx
|   |   +-- tabs.tsx
|   |   +-- textarea.tsx
|   |   +-- toast.tsx
|   |   +-- toaster.tsx
|   |   +-- toggle-group.tsx
|   |   +-- toggle.tsx
|   |   +-- tooltip.tsx
|   |   +-- use-toast.ts
|   |
|   +-- BarcodeScanner.tsx    # Barcode scanner component
|   +-- CartView.tsx          # Shopping cart display
|   +-- NFCCheckoutDialog.tsx # NFC payment dialogs
|   +-- ProductCard.tsx       # Product display card
|   +-- QRScanner.tsx         # QR code scanner component
|   +-- ScannerPlaceholder.tsx# Scanner buttons container
|   +-- StoreMap.tsx          # Store layout viewer
|   +-- WeeklyOffers.tsx      # Promotions display
|   +-- WeightDisplay.tsx     # Weight sensor readout
|
+-- config/                   # Configuration
|   +-- api.ts                # API endpoints and settings
|
+-- contexts/                 # React Context providers
|   +-- CartContext.tsx       # Shopping cart state
|   +-- LanguageContext.tsx   # i18n and translations
|
+-- data/                     # Static data
|   +-- products.ts           # Product catalog (21 items)
|
+-- hooks/                    # Custom React hooks
|   +-- use-mobile.tsx        # Mobile detection hook
|   +-- use-toast.ts          # Toast notifications hook
|   +-- useBarcodeScanner.ts  # Barcode scanner logic
|   +-- useESP32Weight.ts     # Weight sensor polling
|   +-- useNFCDetection.ts    # NFC event polling
|   +-- useQRScanner.ts       # QR scanner logic
|
+-- lib/                      # Utility libraries
|   +-- utils.ts              # cn() helper for classnames
|
+-- pages/                    # Page components
|   +-- NotFound.tsx          # 404 page
|   +-- Shopping.tsx          # Main shopping page
|
+-- types/                    # TypeScript type definitions
|   +-- barcode.ts            # Barcode types
|   +-- product.ts            # Product and CartItem types
|   +-- qrcode.ts             # QR code types
|
+-- utils/                    # Utility functions
    +-- barcodeParser.ts      # Barcode validation & lookup
    +-- qrCodeParser.ts       # QR code parsing
```

---

## Server Directory (server/)

```
server/
|
+-- .env.example              # Environment template
+-- .env.production           # Production env (gitignored)
+-- .gitignore                # Server gitignore
|
+-- config.js                 # Server configuration
+-- server.js                 # Main Express server
+-- logger.js                 # Logging utility
|
+-- clean-logs.js             # Log cleanup script
+-- view-logs.js              # Log viewer script
+-- test-server.js            # Server test script
|
+-- generate-certs.js         # SSL certificate generator
+-- generate-certs-node.js    # Node-based cert generator
+-- generate-certs-simple.js  # Simple cert generator
+-- generate-certs-windows.ps1# Windows PowerShell script
|
+-- nginx-config.conf         # Nginx reverse proxy config
+-- deploy.sh                 # Deployment shell script
|
+-- data/                     # Data storage
|   +-- weight-data.json      # Weight readings storage
|
+-- logs/                     # Server logs
|   +-- 2025-10-20.log
|   +-- 2025-10-21.log
|
+-- ssl/                      # SSL certificates (gitignored)
|   +-- key.pem
|   +-- cert.pem
|
+-- node_modules/             # Server dependencies
```

---

## Configuration Files Detail

### package.json
```json
{
  "name": "vite_react_shadcn_ts",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "noImplicitAny": false,
    "skipLibCheck": true,
    "allowJs": true
  }
}
```

### components.json (shadcn/ui)
```json
{
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

### vite.config.ts
```typescript
export default defineConfig({
  server: { host: "0.0.0.0", port: 8080 },
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") }
  }
});
```

---

## Key File Purposes

| File | Purpose |
|------|---------|
| `src/main.tsx` | React DOM render root |
| `src/App.tsx` | Provider stack and routing |
| `src/pages/Shopping.tsx` | Main shopping interface |
| `src/contexts/CartContext.tsx` | Cart state management |
| `src/contexts/LanguageContext.tsx` | i18n translations |
| `src/data/products.ts` | Product catalog (static) |
| `src/hooks/useESP32Weight.ts` | Weight sensor integration |
| `src/hooks/useNFCDetection.ts` | NFC checkout trigger |
| `src/components/QRScanner.tsx` | Camera QR scanning |
| `src/components/BarcodeScanner.tsx` | Camera barcode scanning |
| `server/server.js` | Express API server |
| `server/config.js` | Server configuration |

---

## Files to Modify for Common Tasks

| Task | Files |
|------|-------|
| Add new product | `src/data/products.ts` |
| Add new translation | `src/contexts/LanguageContext.tsx` |
| Change theme colors | `src/index.css` |
| Add new route | `src/App.tsx` |
| Add new API endpoint | `server/server.js` |
| Configure CORS | `server/.env` or `server/config.js` |
| Add new component | `src/components/` |
| Add new hook | `src/hooks/` |
