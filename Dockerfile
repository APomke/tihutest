FROM node:22-bookworm-slim AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runner

ENV NODE_ENV=production
WORKDIR /app

# Wrangler is a development dependency but is also the local Cloudflare runtime.
COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force
COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000
VOLUME ["/data"]
ENTRYPOINT ["docker-entrypoint.sh"]
