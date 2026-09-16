#!/usr/bin/env bash
set -euo pipefail

DEPLOY_SHA="${1:-release}"
ROOT_DIR="${VYLINO_ROOT_DIR:-/opt/vylino-crm}"
RUNTIME_DIR="$ROOT_DIR/deploy/hostinger"
ENV_FILE="$RUNTIME_DIR/.env"
IMAGE="vylino-crm:${DEPLOY_SHA}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required. Use the Hostinger Ubuntu 24.04 Docker VPS template or install Docker first." >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose v2 is required." >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  cp "$RUNTIME_DIR/.env.example" "$ENV_FILE"

  DB_PASSWORD="$(openssl rand -hex 24)"
  ENCRYPTION_KEY="$(openssl rand -base64 32 | tr -d '\n')"
  APP_SECRET="$(openssl rand -base64 32 | tr -d '\n')"
  INGEST_SECRET="$(openssl rand -hex 32)"
  MARKETING_SECRET="$(openssl rand -hex 32)"

  sed -i "s|^PG_DATABASE_PASSWORD=.*|PG_DATABASE_PASSWORD=${DB_PASSWORD}|" "$ENV_FILE"
  sed -i "s|^ENCRYPTION_KEY=.*|ENCRYPTION_KEY=${ENCRYPTION_KEY}|" "$ENV_FILE"
  sed -i "s|^APP_SECRET=.*|APP_SECRET=${APP_SECRET}|" "$ENV_FILE"
  sed -i "s|^VYLINO_INGEST_SHARED_SECRET=.*|VYLINO_INGEST_SHARED_SECRET=${INGEST_SECRET}|" "$ENV_FILE"
  sed -i "s|^VYLINO_MARKETING_SYNC_SHARED_SECRET=.*|VYLINO_MARKETING_SYNC_SHARED_SECRET=${MARKETING_SECRET}|" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  echo "Created production .env with generated secrets at $ENV_FILE"
fi

sed -i "s|^VYLINO_IMAGE=.*|VYLINO_IMAGE=${IMAGE}|" "$ENV_FILE"

# Keep first deployment conservative. Integrations are enabled only after smoke tests.
sed -i "s|^VYLINO_WHATSAPP_ENABLED=.*|VYLINO_WHATSAPP_ENABLED=false|" "$ENV_FILE"
sed -i "s|^VYLINO_MARKETING_SYNC_ENABLED=.*|VYLINO_MARKETING_SYNC_ENABLED=false|" "$ENV_FILE"
sed -i "s|^VYLINO_WRITE_ATTRIBUTION_FIELDS=.*|VYLINO_WRITE_ATTRIBUTION_FIELDS=false|" "$ENV_FILE"

cd "$ROOT_DIR"
echo "Building $IMAGE ..."
docker build \
  --pull \
  -f packages/twenty-docker/twenty/Dockerfile \
  -t "$IMAGE" \
  .

cd "$RUNTIME_DIR"
docker compose --env-file .env up -d --remove-orphans

echo "Waiting for Vylino CRM health check..."
for attempt in $(seq 1 60); do
  if docker compose --env-file .env exec -T server curl --fail --silent http://localhost:3000/healthz >/dev/null 2>&1; then
    echo "Vylino CRM server is healthy."
    break
  fi
  if [[ "$attempt" -eq 60 ]]; then
    echo "Server did not become healthy in time." >&2
    docker compose --env-file .env ps
    docker compose --env-file .env logs --tail=200 server
    exit 1
  fi
  sleep 5
done

if command -v ufw >/dev/null 2>&1 && ufw status | grep -q '^Status: active'; then
  ufw allow 80/tcp >/dev/null
  ufw allow 443/tcp >/dev/null
  ufw allow 443/udp >/dev/null
fi

echo "Deployment complete. Point crm.vylino.com A record to this VPS and Caddy will obtain HTTPS automatically."
