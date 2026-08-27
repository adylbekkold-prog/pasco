#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/pasco-lab-portal"
REPO_URL="${REPO_URL:-https://github.com/your-org/pasco-lab-portal.git}"
BRANCH="${BRANCH:-main}"
NODE_VERSION="${NODE_VERSION:-20}"
DOMAIN="${DOMAIN:?Set DOMAIN to the public VPS domain}"
DOMAIN_ALIASES="${DOMAIN_ALIASES:-}"
SERVER_NAMES="$DOMAIN${DOMAIN_ALIASES:+ $DOMAIN_ALIASES}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:?Set CERTBOT_EMAIL for Lets Encrypt}"
DATABASE_URL="${DATABASE_URL:?Set DATABASE_URL for PostgreSQL}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:?Set ADMIN_PASSWORD for /sersdp admin panel}"
ADMIN_SESSION_SECRET="${ADMIN_SESSION_SECRET:?Set ADMIN_SESSION_SECRET for signed admin sessions}"
NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:?Set NEXT_PUBLIC_SUPABASE_URL}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:?Set NEXT_PUBLIC_SUPABASE_ANON_KEY}"
SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_KEY:?Set SUPABASE_SERVICE_KEY}"

sudo apt-get update
sudo apt-get install -y nginx git curl build-essential python3 pkg-config postgresql-client certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

sudo mkdir -p "$APP_DIR"
sudo chown -R "$USER:$USER" "$APP_DIR"
cd "$APP_DIR"
if [ ! -d .git ]; then
  git clone --branch "$BRANCH" "$REPO_URL" .
else
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
fi

npm install --legacy-peer-deps

if [ ! -f .env.local ]; then
  cat > .env.local <<EOF
DATA_PROVIDER=postgresql
NEXT_PUBLIC_DATA_PROVIDER=postgresql
DATABASE_URL=$DATABASE_URL
DATABASE_SSL=${DATABASE_SSL:-disable}
DATABASE_POOL_MAX=${DATABASE_POOL_MAX:-20}
ADMIN_PASSWORD=$ADMIN_PASSWORD
ADMIN_SESSION_SECRET=$ADMIN_SESSION_SECRET
NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY
NEXT_PUBLIC_ADMIN_HOST=$DOMAIN
SITE_URL=https://$DOMAIN
NEXT_PUBLIC_SITE_URL=https://$DOMAIN
EOF
fi

upsert_env() {
  local key="$1"
  local value="$2"

  if grep -q "^${key}=" .env.local; then
    sed -i "s|^${key}=.*|${key}=${value}|" .env.local
  else
    printf '\n%s=%s\n' "$key" "$value" >> .env.local
  fi
}

upsert_env NEXT_PUBLIC_ADMIN_HOST "$DOMAIN"
upsert_env SITE_URL "https://$DOMAIN"
upsert_env NEXT_PUBLIC_SITE_URL "https://$DOMAIN"

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/sql/2026-07-09_postgresql_schema.sql
npm run build
find "$APP_DIR/sparkvue-pwa" -type f \( -name '*.css' -o -name '*.js' -o -name '*.json' -o -name '*.wasm' \) -exec gzip -9 -k -f {} \;

pm2 startOrReload scripts/pm2-ecosystem.config.js --only pasco-lab-portal --update-env
pm2 save

sudo mkdir -p /var/cache/nginx/pasco-lab
sudo cp scripts/nginx-pasco-lab-cache.conf /etc/nginx/conf.d/pasco-lab-cache.conf
sed -e "s|__DOMAIN__|$SERVER_NAMES|g" -e "s|__APP_DIR__|$APP_DIR|g" scripts/nginx-pasco-lab.conf | sudo tee /etc/nginx/sites-available/pasco-lab-portal >/dev/null

sudo ln -sf /etc/nginx/sites-available/pasco-lab-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

CERTBOT_DOMAIN_ARGS=(-d "$DOMAIN")
if [ -n "$DOMAIN_ALIASES" ]; then
  read -r -a CERTBOT_ALIASES <<< "$DOMAIN_ALIASES"
  for alias in "${CERTBOT_ALIASES[@]}"; do
    CERTBOT_DOMAIN_ARGS+=(-d "$alias")
  done
fi

sudo certbot --nginx --non-interactive --agree-tos --redirect --email "$CERTBOT_EMAIL" "${CERTBOT_DOMAIN_ARGS[@]}"
