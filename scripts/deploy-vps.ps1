# ============================================================
# DEPLOY-VPS.PS1 — ОДНОКОМАНДНЫЙ ДЕПЛОЙ НА HETZNER VPS
# Запуск:  npm run deploy:vps
# Или:     powershell -ExecutionPolicy Bypass -File scripts/deploy-vps.ps1
#
# Что делает:
#   1. Проверяет, что код закоммичен и запушен
#   2. Подключается к VPS по SSH
#   3. На VPS: git pull → npm install → npm run build → pm2 restart
#   4. Проверяет сайт после деплоя
#
# Требует файл .env.deploy (см. .env.deploy.example)
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  🚀 ДЕПЛОЙ НА HETZNER VPS" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# 1. ЗАГРУЗКА КОНФИГУРАЦИИ ИЗ .env.deploy
# ============================================================
$envFile = Join-Path $PSScriptRoot "..\.env.deploy"
if (-not (Test-Path $envFile)) {
    Write-Host "❌ Файл .env.deploy не найден!" -ForegroundColor Red
    Write-Host "   Скопируй .env.deploy.example в .env.deploy и заполни значения." -ForegroundColor Yellow
    Write-Host "   cp .env.deploy.example .env.deploy" -ForegroundColor Yellow
    exit 1
}

$config = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        $config[$matches[1].Trim()] = $matches[2].Trim()
    }
}

$VPS_HOST = $config['VPS_HOST']
$VPS_USER = $config['VPS_USER']
$VPS_PORT = if ($config['VPS_PORT']) { $config['VPS_PORT'] } else { '22' }
$VPS_SSH_KEY = $config['VPS_SSH_KEY']
$APP_DIR = if ($config['APP_DIR']) { $config['APP_DIR'] } else { '/var/www/pasco-lab-portal' }
$BRANCH = if ($config['BRANCH']) { $config['BRANCH'] } else { 'main' }
$SITE_URL = $config['SITE_URL']

if (-not $VPS_HOST -or -not $VPS_USER) {
    Write-Host "❌ В .env.deploy не заполнены VPS_HOST и VPS_USER!" -ForegroundColor Red
    exit 1
}

Write-Host "📡 Сервер: $VPS_USER@$VPS_HOST`:$VPS_PORT" -ForegroundColor Green
Write-Host "📂 Папка: $APP_DIR" -ForegroundColor Green
Write-Host "🌿 Ветка: $BRANCH" -ForegroundColor Green
Write-Host ""

# ============================================================
# 2. ПРОВЕРКА GIT (всё закоммичено и запушено)
# ============================================================
Write-Host "🔍 Проверяю Git..." -ForegroundColor Cyan

# Проверяем, что нет незакоммиченных изменений
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  Есть незакоммиченные изменения:" -ForegroundColor Yellow
    Write-Host $gitStatus
    Write-Host ""
    $answer = Read-Host "Продолжить без коммита? (y/N)"
    if ($answer -ne 'y' -and $answer -ne 'Y') {
        Write-Host "❌ Отменено. Сначала закоммить изменения:" -ForegroundColor Red
        Write-Host "   git add ." -ForegroundColor Yellow
        Write-Host "   git commit -m 'описание'" -ForegroundColor Yellow
        Write-Host "   git push" -ForegroundColor Yellow
        exit 1
    }
}

# Проверяем, что код запушен
$localCommit = git rev-parse HEAD
$remoteCommit = git rev-parse "origin/$BRANCH" 2>$null
if ($localCommit -ne $remoteCommit) {
    Write-Host "⚠️  Локальный коммит отличается от origin/$BRANCH" -ForegroundColor Yellow
    $answer = Read-Host "Запушить и продолжить? (y/N)"
    if ($answer -eq 'y' -or $answer -eq 'Y') {
        git push origin $BRANCH
    } else {
        Write-Host "❌ Отменено. Сначала запуши: git push" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Git в порядке" -ForegroundColor Green
Write-Host ""

# ============================================================
# 3. ЛОКАЛЬНАЯ СБОРКА (проверка перед деплоем)
# ============================================================
Write-Host "🔨 Локальная сборка (проверка)..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Локальная сборка не прошла! Деплой отменён." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Локальная сборка успешна" -ForegroundColor Green
Write-Host ""

# ============================================================
# 4. SSH-КОМАНДА ДЛЯ ДЕПЛОЯ НА VPS
# ============================================================
Write-Host "🚀 Деплой на VPS..." -ForegroundColor Cyan

# Формируем SSH-команду
$sshArgs = "-p $VPS_PORT"
if ($VPS_SSH_KEY) {
    $sshArgs += " -i `"$VPS_SSH_KEY`""
}
$sshArgs += " -o StrictHostKeyChecking=accept-new"
$sshArgs += " $VPS_USER@$VPS_HOST"

# Скрипт, который выполнится на VPS
$remoteScript = @"
set -e
echo '📂 Переходим в $APP_DIR'
cd $APP_DIR

echo '💾 Бэкапим uploads (файлы лабораторий)...'
if [ -d public/uploads ] && [ -n "$(ls -A public/uploads 2>/dev/null)" ]; then
  mkdir -p /var/backups/pasco-uploads
  cp -r public/uploads/. /var/backups/pasco-uploads/ 2>/dev/null || true
  echo '   Бэкап uploads сохранён в /var/backups/pasco-uploads'
fi

echo '🌿 Обновляем код из GitHub...'
git fetch origin $BRANCH
git checkout $BRANCH
git pull origin $BRANCH


echo '📦 Устанавливаем зависимости...'
npm install --legacy-peer-deps

echo '🗄️ Применяем миграции БД (если есть)...'
if [ -f supabase/migrations/2026-08-11_add_pasco_kits.sql ]; then
  psql "\$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/2026-08-11_add_pasco_kits.sql 2>/dev/null || echo 'Миграция уже применена или пропущена'
fi
if [ -f scripts/seed-pasco-kits-postgres.js ]; then
  node scripts/seed-pasco-kits-postgres.js 2>/dev/null || echo 'Seed пропущен'
fi

echo '🔨 Собираем проект...'
npm run build

echo '🗜️ Сжимаем SPARKvue...'
find sparkvue-pwa -type f \( -name '*.css' -o -name '*.js' -o -name '*.json' -o -name '*.wasm' \) -exec gzip -9 -k -f {} \; 2>/dev/null || true

echo '🚀 Перезапускаем PM2...'
pm2 startOrReload scripts/pm2-ecosystem.config.js --only pasco-lab-portal --update-env
pm2 save

echo '✅ Деплой завершён!'
"@

# Выполняем SSH
$sshCommand = "ssh $sshArgs `"$remoteScript`""
Write-Host "Выполняю SSH-команду..." -ForegroundColor DarkGray
Invoke-Expression $sshCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка при деплое на VPS!" -ForegroundColor Red
    Write-Host "   Смотри логи: ssh $VPS_USER@$VPS_HOST 'pm2 logs pasco-lab-portal'" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Деплой на VPS успешен!" -ForegroundColor Green
Write-Host ""

# ============================================================
# 5. ПРОВЕРКА ПОСЛЕ ДЕПЛОЯ
# ============================================================
Write-Host "🔍 Проверяю сайт..." -ForegroundColor Cyan

if ($SITE_URL) {
    # Проверяем главную страницу
    try {
        $response = Invoke-WebRequest -Uri $SITE_URL -UseBasicParsing -TimeoutSec 30
        Write-Host "   ✅ Главная: HTTP $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Главная: $($_.Exception.Message)" -ForegroundColor Yellow
    }

    # Проверяем /sparkvue
    try {
        $response = Invoke-WebRequest -Uri "$SITE_URL/sparkvue/index.html" -UseBasicParsing -TimeoutSec 30
        Write-Host "   ✅ SPARKvue: HTTP $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  SPARKvue: $($_.Exception.Message)" -ForegroundColor Yellow
    }

    # Проверяем /uploads
    try {
        $response = Invoke-WebRequest -Uri "$SITE_URL/uploads/" -UseBasicParsing -TimeoutSec 30
        Write-Host "   ✅ Uploads: HTTP $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Uploads: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   (SITE_URL не задан в .env.deploy — пропускаю проверку URL)" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  ✅ ДЕПЛОЙ ЗАВЕРШЁН УСПЕШНО!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""
