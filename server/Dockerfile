# Backend Dockerfile for ShopPad Server
# Optimized for Coolify deployment

FROM node:20-alpine

WORKDIR /app

# Install build dependencies for better-sqlite3 (native module)
RUN apk add --no-cache python3 make g++ openssl

# Copy package files
COPY package*.json ./

# Install dependencies (using npm install for flexibility)
RUN npm install --omit=dev --legacy-peer-deps

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p logs data ssl

# Generate self-signed certificates for fallback (Coolify handles SSL termination)
RUN openssl req -x509 -newkey rsa:2048 -keyout ssl/key.pem -out ssl/cert.pem \
    -days 365 -nodes -subj "/CN=localhost" 2>/dev/null || true

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 5050

# Health check - increased start-period for npm install time
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget -qO- http://localhost:5050/status || exit 1

# Environment defaults
ENV NODE_ENV=production \
    PORT=5050 \
    HOST=0.0.0.0 \
    USE_HTTPS=false

# Start server
CMD ["node", "server.js"]
