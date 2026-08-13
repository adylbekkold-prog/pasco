#!/usr/bin/env bash
# ============================================================
# УДАЛЕНИЕ ПАРОЛЕЙ ИЗ ИСТОРИИ GIT
#
# ⚠️ ВНИМАНИЕ: Эта команда ПЕРЕЗАПИСЫВАЕТ историю git.
# После неё нужно сделать force-push на GitHub.
# Если над репозиторием работают другие люди — предупреди их.
#
# Запуск (из корня проекта):
#   bash scripts/purge-secrets.sh
#
# Скрипт НЕ содержит реальных паролей. Он заменяет значения,
# которые ты передашь через переменные окружения:
#   OLD_DB_PASSWORD, OLD_ADMIN_PASSWORD, OLD_ADMIN_SESSION_SECRET
# ============================================================
set -euo pipefail

echo "=============================================="
echo "🧹 УДАЛЕНИЕ СЕКРЕТОВ ИЗ ИСТОРИИ GIT"
echo "=============================================="

# 1. Проверяем, что мы в git-репозитории
if [ ! -d .git ]; then
  echo "❌ Это не git-репозиторий. Запусти из корня проекта."
  exit 1
fi

# 2. Проверяем, что заданы старые значения для замены
if [ -z "${OLD_DB_PASSWORD:-}" ] && [ -z "${OLD_ADMIN_PASSWORD:-}" ] && [ -z "${OLD_ADMIN_SESSION_SECRET:-}" ]; then
  echo "❌ Не заданы переменные OLD_DB_PASSWORD / OLD_ADMIN_PASSWORD / OLD_ADMIN_SESSION_SECRET."
  echo "   Задай их через export перед запуском, например:"
  echo "   export OLD_DB_PASSWORD='старый_пароль_бд'"
  echo "   export OLD_ADMIN_PASSWORD='старый_пароль_админки'"
  echo "   export OLD_ADMIN_SESSION_SECRET='старый_секрет'"
  echo "   bash scripts/purge-secrets.sh"
  exit 1
fi

# 3. Создаём резервную ветку на случай ошибки
echo "📦 Создаём резервную ветку backup-before-purge..."
git branch backup-before-purge 2>/dev/null || echo "   (ветка уже существует)"

# 4. Строим команду sed для замены заданных значений
SED_CMD=""
if [ -n "${OLD_DB_PASSWORD:-}" ]; then
  SED_CMD="${SED_CMD} -e 's/${OLD_DB_PASSWORD}/CHANGE_ME_DB_PASSWORD/g'"
fi
if [ -n "${OLD_ADMIN_PASSWORD:-}" ]; then
  SED_CMD="${SED_CMD} -e 's/${OLD_ADMIN_PASSWORD}/CHANGE_ME_ADMIN_PASSWORD/g'"
fi
if [ -n "${OLD_ADMIN_SESSION_SECRET:-}" ]; then
  SED_CMD="${SED_CMD} -e 's/${OLD_ADMIN_SESSION_SECRET}/CHANGE_ME_ADMIN_SESSION_SECRET/g'"
fi

# 5. Удаляем секреты из ВСЕЙ истории
echo "🧹 Удаляю секреты из истории..."
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --force --tree-filter "
  if [ -f scripts/setup-hetzner-vps.sh ]; then
    sed -i ${SED_CMD} scripts/setup-hetzner-vps.sh
  fi
" -- --all

# 6. Очищаем ссылки на старые коммиты
echo "🧹 Очищаю ссылки на старые коммиты..."
git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d 2>/dev/null || true
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "=============================================="
echo "✅ СЕКРЕТЫ УДАЛЕНЫ ИЗ ИСТОРИИ"
echo "=============================================="
echo ""
echo "Теперь нужно ЗАПУШИТЬ изменения на GitHub (force-push):"
echo ""
echo "  git push origin main --force"
echo ""
echo "⚠️ ВАЖНО: После этого СМЕНИ пароли на сервере,"
echo "   потому что старые пароли уже были публичными:"
echo ""
echo "   1. Смени пароль БД:"
echo "      sudo -u postgres psql -c \"ALTER USER pasco_user WITH PASSWORD 'НОВЫЙ_ПАРОЛЬ';\""
echo "      и обнови DATABASE_URL в /var/www/pasco-lab-portal/.env.local"
echo ""
echo "   2. Смени ADMIN_PASSWORD и ADMIN_SESSION_SECRET"
echo "      в /var/www/pasco-lab-portal/.env.local"
echo ""
echo "   3. Перезапусти приложение:"
echo "      cd /var/www/pasco-lab-portal && pm2 restart pasco-lab-portal --update-env"
echo ""
echo "   4. Обнови .env.deploy на своём компьютере новыми паролями."
echo ""
