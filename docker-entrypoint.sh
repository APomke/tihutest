#!/bin/sh
set -eu

if [ -z "${ADMIN_PASSWORD:-}" ]; then
  echo "ADMIN_PASSWORD must be set" >&2
  exit 1
fi

exec npx wrangler dev \
  --config dist/server/wrangler.json \
  --ip 0.0.0.0 \
  --port "${APP_PORT:-3000}" \
  --persist-to /data \
  --var "ADMIN_PASSWORD:${ADMIN_PASSWORD}"
