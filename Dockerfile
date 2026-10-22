# Digital Signage - Bun runtime image
FROM oven/bun:1.3-alpine AS base

# eMudhra intermediate CA compromise (advisory 2026-10-20): the base image's
# bundle still trusts the leaked intermediates. Take the patched Mozilla bundle
# from a pinned, already-fixed Alpine image. COPY rather than apk/apt so it
# needs no resolver at build time and can't come from a stale cached layer.
COPY --from=alpine:3.23@sha256:21f3e19bafab57a9ff7aa9dd571dac72f868370472c10f450cc0416cc1aca553 /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
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
