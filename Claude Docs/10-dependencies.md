# Dependencies

**Document:** Key Dependencies and Their Purposes
**Last Updated:** December 10, 2025

---

## Table of Contents

1. [Frontend Dependencies](#frontend-dependencies)
2. [Development Dependencies](#development-dependencies)
3. [Backend Dependencies](#backend-dependencies)
4. [Dependency Graph](#dependency-graph)

---

## Frontend Dependencies

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | 18.3.1 | UI library |
| `react-dom` | 18.3.1 | React DOM renderer |
| `react-router-dom` | 6.30.1 | Client-side routing |

### State & Data

| Package | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-query` | 5.83.0 | Server state management (declared, minimally used) |
| `react-hook-form` | 7.61.1 | Form state management |
| `@hookform/resolvers` | 3.10.0 | Form validation resolvers |
| `zod` | 3.25.76 | Schema validation |

### UI Components (shadcn/ui + Radix)

| Package | Version | Purpose |
|---------|---------|---------|
| `@radix-ui/react-accordion` | 1.2.11 | Accordion component |
| `@radix-ui/react-alert-dialog` | 1.1.14 | Alert dialogs |
| `@radix-ui/react-avatar` | 1.1.10 | Avatar component |
| `@radix-ui/react-checkbox` | 1.3.2 | Checkbox component |
| `@radix-ui/react-collapsible` | 1.1.11 | Collapsible sections |
| `@radix-ui/react-context-menu` | 2.2.15 | Context menus |
| `@radix-ui/react-dialog` | 1.1.14 | Modal dialogs |
| `@radix-ui/react-dropdown-menu` | 2.1.15 | Dropdown menus |
| `@radix-ui/react-hover-card` | 1.1.14 | Hover cards |
| `@radix-ui/react-label` | 2.1.7 | Form labels |
| `@radix-ui/react-menubar` | 1.1.15 | Menu bars |
| `@radix-ui/react-navigation-menu` | 1.2.13 | Navigation menus |
| `@radix-ui/react-popover` | 1.1.14 | Popovers |
| `@radix-ui/react-progress` | 1.1.7 | Progress bars |
| `@radix-ui/react-radio-group` | 1.3.7 | Radio buttons |
| `@radix-ui/react-scroll-area` | 1.2.9 | Custom scrollbars |
| `@radix-ui/react-select` | 2.2.5 | Select dropdowns |
| `@radix-ui/react-separator` | 1.1.7 | Visual separators |
| `@radix-ui/react-slider` | 1.3.5 | Sliders |
| `@radix-ui/react-slot` | 1.2.3 | Slot composition |
| `@radix-ui/react-switch` | 1.2.5 | Toggle switches |
| `@radix-ui/react-tabs` | 1.1.12 | Tab panels |
| `@radix-ui/react-toast` | 1.2.14 | Toast notifications |
| `@radix-ui/react-toggle` | 1.1.9 | Toggle buttons |
| `@radix-ui/react-toggle-group` | 1.1.10 | Toggle groups |
| `@radix-ui/react-tooltip` | 1.2.7 | Tooltips |
| `@radix-ui/react-aspect-ratio` | 1.1.7 | Aspect ratio container |

### Styling

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwind-merge` | 2.6.0 | Merge Tailwind classes |
| `tailwindcss-animate` | 1.0.7 | Animation utilities |
| `class-variance-authority` | 0.7.1 | Component variants (cva) |
| `clsx` | 2.1.1 | Conditional classnames |
| `next-themes` | 0.3.0 | Dark mode theming |

### Scanning & Codes

| Package | Version | Purpose |
|---------|---------|---------|
| `html5-qrcode` | 2.3.8 | QR code scanning |
| `@zxing/browser` | 0.1.5 | Barcode scanning (browser) |
| `@zxing/library` | 0.21.3 | Barcode scanning (core) |

### Additional UI

| Package | Version | Purpose |
|---------|---------|---------|
| `lucide-react` | 0.462.0 | Icon library |
| `sonner` | 1.7.4 | Toast notifications |
| `cmdk` | 1.1.1 | Command palette |
| `vaul` | 0.9.9 | Drawer component |
| `embla-carousel-react` | 8.6.0 | Carousel |
| `react-day-picker` | 8.10.1 | Date picker |
| `react-resizable-panels` | 2.1.9 | Resizable panels |
| `recharts` | 2.15.4 | Charts/graphs |
| `input-otp` | 1.4.2 | OTP input |
| `date-fns` | 3.6.0 | Date utilities |

---

## Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | 5.4.19 | Build tool & dev server |
| `@vitejs/plugin-react-swc` | 3.11.0 | React SWC compiler |
| `typescript` | 5.8.3 | TypeScript compiler |
| `@types/react` | 18.3.23 | React type definitions |
| `@types/react-dom` | 18.3.7 | React DOM types |
| `@types/node` | 22.16.5 | Node.js types |
| `eslint` | 9.32.0 | Code linting |
| `@eslint/js` | 9.32.0 | ESLint JS config |
| `eslint-plugin-react-hooks` | 5.2.0 | React hooks rules |
| `eslint-plugin-react-refresh` | 0.4.20 | React refresh rules |
| `typescript-eslint` | 8.38.0 | TypeScript ESLint |
| `globals` | 15.15.0 | Global variables |
| `tailwindcss` | 3.4.17 | CSS framework |
| `@tailwindcss/typography` | 0.5.16 | Typography plugin |
| `postcss` | 8.5.6 | CSS processing |
| `autoprefixer` | 10.4.21 | CSS vendor prefixes |
| `lovable-tagger` | 1.1.11 | Dev component tagging |

---

## Backend Dependencies

Located in `server/package.json` (implied from code):

| Package | Purpose |
|---------|---------|
| `express` | HTTP server framework |
| `helmet` | Security headers |
| `cors` | Cross-origin requests |
| `morgan` | Request logging |
| `body-parser` | JSON/URL body parsing |
| `dotenv` | Environment variables |
| `express-rate-limit` | Rate limiting |
| `nodemon` | Dev auto-reload |
| `node-forge` | SSL certificate generation |

---

## Dependency Graph

### UI Component Chain
```
Radix UI Primitives
        |
        v
  shadcn/ui components (src/components/ui/)
        |
        v
  Custom components (CartView, ProductCard, etc.)
        |
        v
  Page components (Shopping.tsx)
```

### Styling Chain
```
Tailwind CSS
    |
    +-- tailwind-merge (class merging)
    +-- clsx (conditional classes)
    +-- class-variance-authority (variants)
    |
    v
  cn() utility (src/lib/utils.ts)
    |
    v
  Component className props
```

### Scanning Chain
```
Camera API (browser)
    |
    +-- html5-qrcode (QR codes)
    |       |
    |       v
    |   QRScanner.tsx
    |
    +-- @zxing/library (barcodes)
            |
            v
        BarcodeScanner.tsx
```

### Data Flow Chain
```
Static Data (products.ts)
    |
    v
Context (CartContext, LanguageContext)
    |
    v
Components (via useCart, useLanguage)
```

### Server Communication Chain
```
Frontend Hooks
    |
    +-- useESP32Weight (fetch /logs)
    +-- useNFCDetection (fetch /nfc)
    |
    v
Express Server (server.js)
    |
    v
JSON File Storage (weight-data.json)
```

---

## Updating Dependencies

### Frontend

```bash
# Check for updates
npm outdated

# Update all
npm update

# Update specific package
npm install package-name@latest

# Audit for vulnerabilities
npm audit
npm audit fix
```

### Backend

```bash
cd server
npm outdated
npm update
npm audit fix
```

---

## Key Dependency Notes

### html5-qrcode
- Used for QR code scanning via camera
- Supports multiple formats
- Requires camera permissions
- Works on mobile and desktop

### @zxing/library
- Multi-format barcode reading
- Supports EAN-13, UPC-A, Code-128, etc.
- More barcode formats than html5-qrcode
- Used via BrowserMultiFormatReader

### Radix UI
- Unstyled, accessible primitives
- All shadcn/ui components are Radix-based
- Provides accessibility out of the box
- Handles focus management, keyboard nav

### Tailwind CSS
- Utility-first CSS framework
- Configured in tailwind.config.ts
- Custom theme in src/index.css
- RTL support via dir attribute

### React Router DOM
- Client-side routing
- Currently only 2 routes (/ and 404)
- BrowserRouter for standard URLs

### sonner vs @radix-ui/react-toast
- Both toast systems are included
- Sonner used for scanner notifications
- Radix toast available but less used
