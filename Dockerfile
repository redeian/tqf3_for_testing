# =============================================================================
# Dockerfile — Multi-stage build for Next.js standalone output
# =============================================================================
# Build stage:   install deps + compile the app
# Runner stage:  copy only what's needed to run (tiny final image)
#
# REQUIREMENTS:
#   - next.config.ts must have: output: "standalone"
#   - Run DB migrations separately (see docs/HOW_TO_DEPLOY.md)
# =============================================================================

# --- Build Stage ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first (layer caching — only re-runs if package.json changes)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output (the compiled app)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy migration files (applied at runtime via temp container, not here)
COPY --from=builder /app/src/db/migrations ./src/db/migrations
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000

# Health check — Docker restarts the container if this fails 3 times
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
