#!/usr/bin/env bash
# ============================================================
# ОДНОРАЗОВАЯ НАСТРОЙКА HETZNER VPS ДЛЯ PASCO LAB PORTAL
# Запускается ОДИН РАЗ на сервере. После этого деплой
# происходит автоматически через GitHub Actions (git push).
#
# Использование:
#   ssh root@YOUR_VPS_IP
#   bash <(curl -s https://raw.githubusercontent.com/YOUR_USER/pasco/main/scripts/setup-hetzner-vps.sh)
#
# ИЛИ скопировать этот файл на сервер и запустить:
#   bash setup-hetzner-vps.sh
# ============================================================
set -euo pipefail

# ============================================================
# 1. ПЕРЕМЕННЫЕ (заполни своими значениями!)
#
# ⚠️ ВАЖНО: НЕ вписывай реальные пароли прямо в этот файл!
# Файл лежит в Git и попадёт в GitHub. Задай значения через
# переменные окружения перед запуском скрипта, например:
#
#   export DOMAIN=89.167.118.180
#   export CERTBOT_EMAIL=you@example.com
#   export DB_PASSWORD='СЛОЖНЫЙ_ПАРОЛЬ'
#   export ADMIN_PASSWORD='СЛОЖНЫЙ_ПАРОЛЬ'
#   export ADMIN_SESSION_SECRET='СЛУЧАЙНАЯ_СТРОКА'
#   bash setup-hetzner-vps.sh
#
# Или создай файл .env.deploy (он в .gitignore) и запусти:
#   set -a; source .env.deploy; set +a; bash setup-hetzner-vps.sh
# ============================================================
REPO_URL="https://github.com/adylbekkold-prog/pasco.git"
BRANCH="main"
APP_DIR="/var/www/pasco-lab-portal"

# Заполняются из переменных окружения (см. выше). Не хардкодь здесь!
DOMAIN="${DOMAIN:-}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"

DB_NAME="${DB_NAME:-pasco}"
DB_USER="${DB_USER:-pasco_user}"
DB_PASSWORD="${DB_PASSWORD:-}"

ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"
ADMIN_SESSION_SECRET="${ADMIN_SESSION_SECRET:-}"

# Проверка обязательных переменных
if [ -z "$DOMAIN" ] || [ -z "$CERTBOT_EMAIL" ] || [ -z "$DB_PASSWORD" ] || [ -z "$ADMIN_PASSWORD" ] || [ -z "$ADMIN_SESSION_SECRET" ]; then
  echo "❌ ОШИБКА: Не заданы обязательные переменные окружения!"
  echo "   DOMAIN, CERTBOT_EMAIL, DB_PASSWORD, ADMIN_PASSWORD, ADMIN_SESSION_SECRET"
  echo "   Задай их через export или .env.deploy (см. комментарий в начале скрипта)."
  exit 1
fi


echo "=============================================="
echo "🚀 НАСТРОЙКА HETZNER VPS ДЛЯ PASCO LAB PORTAL"
echo "=============================================="

# ============================================================
# 2. ОБНОВЛЕНИЕ СИСТЕМЫ
# ============================================================
echo "📦 Обновляем систему..."
apt-get update
apt-get upgrade -y

# ============================================================
# 3. УСТАНОВКА БАЗОВЫХ ПАКЕТОВ
# ============================================================
echo "📦 Устанавливаем базовые пакеты..."
apt-get install -y \
  git curl wget build-essential \
  nginx \
  postgresql postgresql-contrib \
  certbot python3-certbot-nginx \
  ca-certificates gnupg

# ============================================================
# 4. УСТАНОВКА NODE.JS 20 LTS
# ============================================================
echo "📦 Устанавливаем Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node -v
npm -v

# ============================================================
# 5. УСТАНОВКА PM2
# ============================================================
echo "📦 Устанавливаем PM2..."
npm install -g pm2

# ============================================================
# 6. НАСТРОЙКА POSTGRESQL
# ============================================================
echo "🐘 Настраиваем PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Создаём базу данных и пользователя
sudo -u postgres psql <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASSWORD}';
  END IF;
END
\$\$;
SQL

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'" | grep -q 1 || \
  sudo -u postgres createdb -O ${DB_USER} ${DB_NAME}

# Разрешаем подключение по паролю (md5)
PG_HBA="/etc/postgresql/$(ls /etc/postgresql/)/main/pg_hba.conf"
sed -i 's/^local\s\+all\s\+all\s\+peer/local   all             all                                     md5/' "$PG_HBA"
systemctl restart postgresql

echo "✅ PostgreSQL настроен. База: ${DB_NAME}, Пользователь: ${DB_USER}"

# ============================================================
# 6.5. СОЗДАНИЕ ПАПКИ ДЛЯ БЭКАПОВ UPLOADS
# ============================================================
echo "💾 Создаём папку для бэкапов uploads..."
mkdir -p /var/backups/pasco-uploads

# Добавляем ежедневный бэкап uploads в cron (в 2:00 ночи)
(crontab -l 2>/dev/null | grep -v "pasco-uploads"; echo "0 2 * * * cp -r ${APP_DIR}/public/uploads/. /var/backups/pasco-uploads/ 2>/dev/null || true") | crontab -
echo "✅ Бэкапы uploads будут сохраняться ежедневно в /var/backups/pasco-uploads"

# ============================================================
# 7. КЛОНИРОВАНИЕ ПРОЕКТА
# ============================================================
echo "📂 Клонируем проект..."
mkdir -p "$APP_DIR"
cd "$APP_DIR"

if [ ! -d .git ]; then
  git clone --branch "$BRANCH" "$REPO_URL" .
else
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
fi

# ============================================================
# 8. УСТАНОВКА ЗАВИСИМОСТЕЙ
# ============================================================
echo "📦 Устанавливаем зависимости..."
npm install --legacy-peer-deps

# ============================================================
# 9. СОЗДАНИЕ .env.local
# ============================================================
echo "🔐 Создаём .env.local..."
cat > .env.local <<EOF
DATA_PROVIDER=postgresql
NEXT_PUBLIC_DATA_PROVIDER=postgresql
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}
DATABASE_SSL=disable
DATABASE_POOL_MAX=20
ADMIN_PASSWORD=${ADMIN_PASSWORD}
ADMIN_SESSION_SECRET=${ADMIN_SESSION_SECRET}
NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
NEXT_PUBLIC_ADMIN_HOST=${DOMAIN}
PUBLIC_ADMIN_HOST=${DOMAIN}
SITE_URL=https://${DOMAIN}
NEXT_PUBLIC_SITE_URL=https://${DOMAIN}
EOF


echo "✅ .env.local создан"

# ============================================================
# 10. ПРИМЕНЕНИЕ СХЕМЫ БАЗЫ ДАННЫХ
# ============================================================
echo "🗄️ Применяем схему базы данных..."
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}"

# Основная схема
if [ -f supabase/sql/2026-07-09_postgresql_schema.sql ]; then
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/sql/2026-07-09_postgresql_schema.sql || echo "⚠️ Схема уже применена или ошибка (продолжаем)"
fi

# Миграция PASCO kits
if [ -f supabase/migrations/2026-08-11_add_pasco_kits.sql ]; then
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/2026-08-11_add_pasco_kits.sql || echo "⚠️ Миграция PASCO уже применена или ошибка (продолжаем)"
fi

# Загрузка PASCO данных
if [ -f scripts/seed-pasco-kits-postgres.js ]; then
  node scripts/seed-pasco-kits-postgres.js || echo "⚠️ Seed PASCO пропущен (продолжаем)"
fi

echo "✅ База данных настроена"

# ============================================================
# 11. СБОРКА ПРОЕКТА
# ============================================================
echo "🔨 Собираем проект..."
npm run build

# ============================================================
# 12. ПРЕДВАРИТЕЛЬНОЕ СЖАТИЕ SPARKVUE
# ============================================================
echo "🗜️ Сжимаем SPARKvue файлы..."
find sparkvue-pwa -type f \( -name '*.css' -o -name '*.js' -o -name '*.json' -o -name '*.wasm' \) -exec gzip -9 -k -f {} \; 2>/dev/null || true

# ============================================================
# 13. ЗАПУСК ЧЕРЕЗ PM2
# ============================================================
echo "🚀 Запускаем приложение через PM2..."
pm2 startOrReload scripts/pm2-ecosystem.config.js --only pasco-lab-portal --update-env
pm2 save
pm2 startup systemd -u root --hp /root || true

# ============================================================
# 14. НАСТРОЙКА NGINX
# ============================================================
echo "🌐 Настраиваем Nginx..."
sed -e "s|__DOMAIN__|${DOMAIN}|g" -e "s|__APP_DIR__|${APP_DIR}|g" \
  scripts/nginx-pasco-lab.conf | tee /etc/nginx/sites-available/pasco-lab-portal >/dev/null

ln -sf /etc/nginx/sites-available/pasco-lab-portal /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# ============================================================
# 15. SSL-СЕРТИФИКАТ (Let's Encrypt)
# ============================================================
echo "🔒 Получаем SSL-сертификат..."
certbot --nginx --non-interactive --agree-tos --redirect --email "$CERTBOT_EMAIL" -d "$DOMAIN" || \
  echo "⚠️ Не удалось получить SSL (проверь, что домен указывает на этот сервер)"

# ============================================================
# 16. ПРОВЕРКА
# ============================================================
echo ""
echo "=============================================="
echo "✅ НАСТРОЙКА ЗАВЕРШЕНА!"
echo "=============================================="
echo ""
echo "🌐 Сайт: https://${DOMAIN}"
echo "📊 PM2:  pm2 status"
echo "🐘 БД:   ${DB_NAME} (${DB_USER})"
echo ""
echo "Теперь деплой будет происходить автоматически:"
echo "  git add . && git commit -m 'update' && git push"
echo ""
echo "ИЛИ вручную через GitHub Actions:"
echo "  https://github.com/adylbekkold-prog/pasco/actions"
echo "  → Deploy to Hetzner VPS → Run workflow"
echo ""
