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

# 2. Создаём резервную ветку на случай ошибки
echo "📦 Создаём резервную ветку backup-before-purge..."
git branch backup-before-purge 2>/dev/null || echo "   (ветка уже существует)"

# 3. Удаляем секреты из ВСЕЙ истории
#    Заменяем реальные значения на плейсхолдеры во всех коммитах.
echo "🧹 Удаляю секреты из истории..."
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --force --tree-filter '
  if [ -f scripts/setup-hetzner-vps.sh ]; then
    sed -i \
      -e "s/CHANGE_ME_DB_PASSWORD/CHANGE_ME_DB_PASSWORD/g" \
      -e "s/CHANGE_ME_ADMIN_PASSWORD/CHANGE_ME_ADMIN_PASSWORD/g" \
      -e "s/CHANGE_ME_ADMIN_SESSION_SECRET/CHANGE_ME_ADMIN_SESSION_SECRET/g" \
      scripts/setup-hetzner-vps.sh
  fi
' -- --all

# 4. Очищаем ссылки на старые коммиты
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
