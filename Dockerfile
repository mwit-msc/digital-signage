# Digital Signage - Bun runtime image
FROM oven/bun:1.3-alpine AS base
WORKDIR /app

# Install production dependencies first (cached unless deps change)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Application source
COPY server.js ./
COPY static ./static

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Drop root for runtime (the oven/bun image ships a non-root `bun` user)
USER bun

# Container is healthy when the time endpoint responds
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://localhost:3000/api/time || exit 1

CMD ["bun", "run", "server.js"]
