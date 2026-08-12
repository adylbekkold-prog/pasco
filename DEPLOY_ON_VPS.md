# Инструкция по деплою PASCO Lab Portal на VPS (aeza.net)

## Полный анализ проекта

### Текущие версии (с которыми проект работает)

| Компонент | Версия | Примечание |
|-----------|--------|------------|
| **Node.js** | **>=20.9.0** (минимальная) | Next.js 16 требует Node >=20.9.0 |
| **Next.js** | **16.2.1** | Фреймворк |
| **React** | **19.2.4** | |
| **TypeScript** | **5.9.3** | |
| **Tailwind CSS** | **4.2.2** | |
| **PostgreSQL** | **16+** (устанавливается на VPS) | База данных на том же сервере |
| **Supabase** | @supabase/supabase-js@2.100.0 | Для аутентификации учителей |

### Зависимости (package.json)

**Production:**
- `next@16.2.1` — фреймворк
- `react@19.2.4` + `react-dom@19.2.4`
- `@supabase/ssr@0.9.0` + `@supabase/supabase-js@2.100.0` — Supabase (только для аутентификации)
- `pg@8.22.0` — PostgreSQL клиент (для подключения к своей БД)
- `lucide-react@1.7.0` — иконки
- `slugify@1.6.8` — генерация slug
- `zod@4.3.6` — валидация
- `react-hook-form@7.72.0` + `@hookform/resolvers@5.2.2` — формы
- `@hello-pangea/dnd@18.0.1` — drag-and-drop
- `radix-ui@1.4.3` — UI компоненты
- `class-variance-authority@0.7.1` + `clsx@2.1.1` + `tailwind-merge@3.5.0` — стилизация
- `tw-animate-css@1.4.0` — анимации

**Dev:**
- `typescript@5.9.3`
- `@types/react@19.2.14`, `@types/react-dom@19.2.3`, `@types/node@20.19.37`
- `@types/pg@8.20.0`
- `tailwindcss@4.2.2` + `@tailwindcss/postcss@4.2.2`
- `eslint@9.39.4` + `eslint-config-next@16.2.1`
- `jest@29.7.0` + `ts-jest@29.1.1` + `@testing-library/react@14.0.0`

---

## 1. Подготовка проекта на локальной машине

### 1.1. Собрать production build

```bash
npm run build
```

### 1.2. Отправить проект на GitHub

```bash
git add .
git commit -m "готово к деплою"
git push origin main
```

---

## 2. Настройка VPS (aeza.net)

### 2.1. Подключиться к VPS по SSH

```bash
ssh root@your-vps-ip
```

### 2.2. Обновить систему

```bash
apt update && apt upgrade -y
```

### 2.3. Установить Node.js 20.x LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs git curl nginx certbot python3-certbot-nginx
node -v  # должно быть v20.x.x
npm -v
```

### 2.4. Установить PostgreSQL 16

```bash
apt-get install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
```

### 2.5. Установить PM2

```bash
npm install -g pm2
```

---

## 3. Настройка PostgreSQL

### 3.1. Создать базу данных и пользователя

```bash
sudo -u postgres psql
```

В консоли PostgreSQL выполнить:

```sql
CREATE DATABASE pasco;
CREATE USER pasco_user WITH PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE pasco TO pasco_user;
\c pasco
GRANT ALL ON SCHEMA public TO pasco_user;
\q
```

### 3.2. Накатить схему базы данных

Скопировать SQL-файл схемы на VPS:

```bash
# С локальной машины:
scp d:\pasco-lab-portal\supabase\sql\2026-07-09_postgresql_schema.sql root@your-vps-ip:~/schema.sql
```

Выполнить на VPS:

```bash
sudo -u postgres psql -d pasco -f ~/schema.sql
```

### 3.3. Настроить доступ для приложения

Разрешить подключение к PostgreSQL из приложения (localhost):

```bash
nano /etc/postgresql/16/main/pg_hba.conf
```

Найти строку:
```
local   all             all                                     peer
```

Изменить на:
```
local   all             all                                     md5
```

Перезапустить PostgreSQL:

```bash
systemctl restart postgresql
```

---

## 4. Клонировать и настроить проект

### 4.1. Клонировать репозиторий

```bash
cd ~
git clone https://github.com/adylbekkold-prog/pasco.git
cd pasco
```

### 4.2. Установить зависимости

```bash
npm install
```

### 4.3. Создать .env.local

```bash
nano .env.local
```

```env
# === Supabase (только для аутентификации учителей) ===
NEXT_PUBLIC_SUPABASE_URL=https://eaksmrpekxiehzfumxjy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=sb_secret_...

# === PostgreSQL (своя БД на этом же VPS) ===
DATABASE_URL=postgresql://pasco_user:your_strong_password@localhost:5432/pasco

# === Режим: postgresql (своя БД + локальное зеркало) ===
DATA_PROVIDER=postgresql
NEXT_PUBLIC_DATA_PROVIDER=local

# === URL сайта ===
SITE_URL=https://ваш-домен.ru
NEXT_PUBLIC_SITE_URL=https://ваш-домен.ru
```

> **Важно:** `NEXT_PUBLIC_DATA_PROVIDER=local` — это нормально. На клиенте эта переменная не должна раскрывать данные PostgreSQL. Серверная часть будет работать с PostgreSQL через `DATA_PROVIDER=postgresql`.

### 4.4. Собрать production билд

```bash
npm run build
```

---

## 5. Запуск через PM2

### 5.1. Запустить приложение

```bash
pm2 start npm --name "pasco-lab" -- start
```

### 5.2. Настроить автозапуск

```bash
pm2 save
pm2 startup
# Выполнить команду, которую выдаст PM2
```

### 5.3. Проверить

```bash
pm2 status
pm2 logs pasco-lab
```

---

## 6. Настройка Nginx (reverse proxy)

SPARKvue занимает около 80 МБ и включает `spark.wasm` размером около 13 МБ и `resources.zip` размером около 30 МБ. Эти файлы должны отдаваться напрямую через Nginx. Нельзя проксировать каждый такой запрос через Node.js при большом количестве пользователей.

Для SPARKvue обязательно нужны:

- публичный домен, направленный на VPS;
- действующий HTTPS-сертификат;
- заголовки `Cross-Origin-Opener-Policy` и `Cross-Origin-Embedder-Policy`;
- настольный Chrome или Edge актуальной версии;
- прямая раздача каталогов `/sparkvue/`, `/whatsnew/` и `/uploads/` через Nginx.

### 6.1. Создать конфиг

```bash
nano /etc/nginx/sites-available/pasco-lab
```

```bash
cd /var/www/pasco-lab-portal
export DOMAIN="ваш-домен.ru"
export APP_DIR="/var/www/pasco-lab-portal"

sed -e "s|__DOMAIN__|$DOMAIN|g" -e "s|__APP_DIR__|$APP_DIR|g" \
  scripts/nginx-pasco-lab.conf \
  > /etc/nginx/sites-available/pasco-lab-portal
```

Шаблон `scripts/nginx-pasco-lab.conf` уже содержит потоковую раздачу больших файлов, Range-запросы, `sendfile`, `gzip_static`, безопасные заголовки и длительное кэширование неизменяемых загрузок.

### 6.2. Включить сайт

```bash
ln -sf /etc/nginx/sites-available/pasco-lab-portal /etc/nginx/sites-enabled/pasco-lab-portal
nginx -t
systemctl reload nginx
```

### 6.3. SSL-сертификат (бесплатно)

```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx --redirect -d ваш-домен.ru
```

### 6.4. Предварительное сжатие SPARKvue

```bash
cd /var/www/pasco-lab-portal
find sparkvue-pwa -type f \( -name '*.css' -o -name '*.js' -o -name '*.json' -o -name '*.wasm' \) \
  -exec gzip -9 -k -f {} \;
nginx -t && systemctl reload nginx
```

### 6.5. Проверка обязательных заголовков

```bash
curl -I https://ваш-домен.ru/labs
curl -I https://ваш-домен.ru/sparkvue/spark.wasm
curl -I -H "Range: bytes=0-1023" https://ваш-домен.ru/sparkvue/spark.wasm
```

В ответах должны присутствовать `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy: credentialless`, правильный тип `application/wasm`, а Range-запрос должен вернуть статус `206 Partial Content`.

---

## 7. Режимы работы (DATA_PROVIDER)

| Значение | Описание | Для чего |
|----------|----------|----------|
| `postgresql` | **Свой PostgreSQL на VPS** (рекомендуется) | ✅ Все данные на вашем сервере |
| `hybrid` | Supabase + локальное зеркало | ⚠️ Если нет своей БД |
| `local` | Только JSON-файлы | ❌ Только для разработки |

**Для aeza.net:** используйте `postgresql` — PostgreSQL и проект на одном VPS.

---

## 8. Бэкапы PostgreSQL

### 8.1. Автоматический бэкап (через cron)

```bash
crontab -e
```

Добавить строку (ежедневный бэкап в 3:00):

```cron
0 3 * * * pg_dump -U pasco_user pasco > /root/backups/pasco_$(date +\%Y\%m\%d).sql
```

### 8.2. Восстановление из бэкапа

```bash
psql -U pasco_user -d pasco -f /root/backups/pasco_20260709.sql
```

---

## 9. Обновление проекта

```bash
cd ~/pasco
git pull
npm install
npm run build
pm2 restart pasco-lab
```

---

## 10. Полезные команды

```bash
# PM2
pm2 status
pm2 logs pasco-lab
pm2 restart pasco-lab
pm2 monit

# PostgreSQL
systemctl status postgresql
sudo -u postgres psql -d pasco -c "\dt"

# Проверка сайта
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
```

---

## 11. Результаты тестирования (7 июля 2026)

| Страница | Путь | Статус |
|----------|------|--------|
| Главная | `/` | 200 ✅ |
| Лабораторные | `/labs` | 200 ✅ |
| Предметы | `/subjects` | 200 ✅ |
| Классы | `/grades` | 200 ✅ |
| Карточка лабораторной | `/labs/analiz-dvizheniya-na-cifrovom-trekere` | 200 ✅ |
| PASCO Kit | `/pasco-kits` | 200 ✅ |
| Логин | `/login` | 307 ✅ |
| Админ-панель | `/admin` | 200 ✅ |
| Кыргызская версия | `/?locale=ky` | 200 ✅ |

**Production build:** пройден успешно ✅  
**TypeScript:** 0 ошибок ✅
