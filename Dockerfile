# ==============================================================================
# OXIMA PRODUCTION MULTI-STAGE DOCKERFILE
# Stage 1: Build React Frontend Assets (Vite)
# Stage 2: Production Node.js Backend Server with Built Static Assets
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1: Build React Client
# ------------------------------------------------------------------------------
FROM node:20-alpine AS client-builder

WORKDIR /app/client

# Copy frontend dependency manifests
COPY client/package*.json ./

# Install frontend dependencies cleanly
RUN npm ci

# Copy frontend source code
COPY client/ ./

# Build optimized production bundle to /app/client/dist
RUN npm run build

# ------------------------------------------------------------------------------
# STAGE 2: Production Backend Server
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

# Install dumb-init for proper PID 1 signal handling (graceful shutdown)
RUN apk add --no-cache dumb-init

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Copy backend dependency manifests
COPY server/package*.json ./server/

# Install only production backend dependencies
WORKDIR /app/server
RUN npm ci --only=production

# Copy backend source code
COPY server/ ./

# Copy built frontend assets from Stage 1 into backend public folder for unified serving
COPY --from=client-builder /app/client/dist /app/server/public

# Run as non-root user for security compliance
USER node

# Expose HTTP & WebSocket port
EXPOSE 5000

# Healthcheck definition
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/v1/health || exit 1

# Launch server with dumb-init for graceful termination
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "src/server.js"]
