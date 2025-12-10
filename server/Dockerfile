# Backend Dockerfile for ShopPad Server
# Optimized for Coolify deployment

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p logs data ssl

# Generate self-signed certificates for fallback (Coolify handles SSL termination)
RUN apk add --no-cache openssl && \
    openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem \
    -days 365 -nodes -subj "/CN=localhost" 2>/dev/null || true

# Production image
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Copy from builder
COPY --from=builder /app /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 5050

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5050/status || exit 1

# Environment defaults
ENV NODE_ENV=production \
    PORT=5050 \
    HOST=0.0.0.0 \
    USE_HTTPS=false

# Start server
CMD ["node", "server.js"]
