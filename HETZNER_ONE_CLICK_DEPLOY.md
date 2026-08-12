# 🚀 ОДНОКНОПОЧНЫЙ ДЕПЛОЙ НА HETZNER VPS

Этот гайд объясняет, как настроить **автоматический деплой** вашего проекта на Hetzner VPS. После настройки вам нужно будет только **`git push`** — и сайт обновится сам!

---

## 📋 ЧТО ТЫ ПОЛУЧИШЬ

| Действие | Что происходит |
|----------|----------------|
| `npm run deploy:vps` | ✅ Деплой одной командой прямо отсюда |
| `git push` на `main` | ✅ Автоматический деплой на VPS |
| Кнопка "Run workflow" в GitHub | ✅ Ручной деплой в один клик |
| Автоматические тесты + build | ✅ Проверка перед деплоем |

---

## 🗂️ ФАЙЛЫ, КОТОРЫЕ СОЗДАНЫ

```
.github/workflows/deploy.yml        <- Автоматический деплой (GitHub Actions)
scripts/setup-hetzner-vps.sh        <- Одноразовая настройка VPS
scripts/deploy-vps.ps1              <- Деплой одной командой (Windows)
.env.deploy.example                 <- Пример конфигурации деплоя
```


---

## 🔧 ШАГ 1: НАСТРОЙКА VPS (ОДИН РАЗ)

### 1.1. Подключись к серверу

```bash
ssh root@YOUR_VPS_IP
```

### 1.2. Запусти скрипт настройки

Скопируй этот файл на сервер и запусти:

```bash
# Скопируй файл с локальной машины на сервер
scp scripts/setup-hetzner-vps.sh root@YOUR_VPS_IP:~/

# Подключись к серверу
ssh root@YOUR_VPS_IP

# Открой файл и заполни переменные (DOMAIN, пароли и т.д.)
nano setup-hetzner-vps.sh

# Запусти настройку
bash setup-hetzner-vps.sh
```

> ⚠️ **ВАЖНО:** Перед запуском открой файл и заполни переменные в начале:
> - `DOMAIN` — твой домен (например `pasco.example.com`)
> - `CERTBOT_EMAIL` — твой email для SSL
> - `DB_PASSWORD` — пароль для базы данных
> - `ADMIN_PASSWORD` — пароль админ-панели
> - `ADMIN_SESSION_SECRET` — длинная случайная строка
> - Supabase ключи (если используешь)

Скрипт автоматически:
- ✅ Установит Node.js 20, PostgreSQL, Nginx, PM2
- ✅ Создаст базу данных
- ✅ Клонирует проект
- ✅ Соберёт и запустит приложение
- ✅ Настроит SSL-сертификат

---

## 🔑 ШАГ 2: НАСТРОЙКА SSH-КЛЮЧА ДЛЯ GITHUB

Чтобы GitHub Actions мог подключаться к твоему серверу, нужно создать SSH-ключ.

### 2.1. Создай SSH-ключ на сервере

```bash
# На сервере (root@YOUR_VPS_IP)
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions -N ""
```

### 2.2. Добавь публичный ключ в authorized_keys

```bash
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 2.3. Скопируй приватный ключ

```bash
cat ~/.ssh/github_actions
```

Скопируй **весь вывод** (начинается с `-----BEGIN OPENSSH PRIVATE KEY-----`).

---

## 🔐 ШАГ 3: НАСТРОЙКА SECRETS В GITHUB

Теперь нужно добавить секреты в GitHub, чтобы workflow мог подключиться к серверу.

### 3.1. Открой настройки репозитория

```
https://github.com/adylbekkold-prog/pasco/settings/secrets/actions
```

### 3.2. Добавь следующие секреты (New repository secret):

| Имя секрета | Значение |
|-------------|----------|
| `VPS_HOST` | IP-адрес твоего сервера (например `116.203.10.10`) |
| `VPS_USER` | `root` |
| `VPS_PORT` | `22` |
| `VPS_SSH_KEY` | Приватный ключ из шага 2.3 (весь текст) |

---

## 🚀 ШАГ 4: ДЕПЛОЙ

### Вариант А: Автоматический (при каждом push)

```bash
git add .
git commit -m "Обновление сайта"
git push
```

GitHub Actions автоматически:
1. ✅ Проверит тесты
2. ✅ Соберёт проект
3. ✅ Задеплоит на VPS

### Вариант Б: Ручной (кнопкой)

1. Открой: `https://github.com/adylbekkold-prog/pasco/actions`
2. Нажми **"Deploy to Hetzner VPS"** слева
3. Нажми **"Run workflow"** → **"Run workflow"**
4. Готово! 🎉

### Вариант В: Деплой одной командой (npm run deploy:vps) ⭐ РЕКОМЕНДУЕТСЯ

Этот способ позволяет деплоить **прямо с твоего компьютера** одной командой, без GitHub Actions.

#### 3.1. Создай файл `.env.deploy`

Скопируй пример и заполни значения:

```bash
cp .env.deploy.example .env.deploy
```

Открой `.env.deploy` и заполни:
- `VPS_HOST` — IP твоего сервера
- `VPS_USER` — `root`
- `VPS_PORT` — `22`
- `VPS_SSH_KEY` — путь к SSH-ключу (например `C:\Users\user\.ssh\id_ed25519`)
- `SITE_URL` — URL сайта для проверки

> ⚠️ `.env.deploy` уже в `.gitignore` — он не попадёт в Git.

#### 3.2. Задеплой одной командой

```bash
npm run deploy:vps
```

Скрипт автоматически:
1. ✅ Проверит, что код закоммичен и запушен
2. ✅ Соберёт проект локально (проверка)
3. ✅ Подключится к VPS по SSH
4. ✅ На VPS: `git pull` → `npm install` → `npm run build` → `pm2 restart`
5. ✅ Сделает бэкап `public/uploads` перед деплоем
6. ✅ Проверит сайт после деплоя (главная, /sparkvue, /uploads)

#### 3.3. Если нужен SSH-ключ

Если у тебя нет SSH-ключа, создай его:

```bash
# На Windows (PowerShell)
ssh-keygen -t ed25519 -C "your-email@example.com"
# Путь: C:\Users\user\.ssh\id_ed25519
```

Затем добавь публичный ключ на сервер:

```bash
# Скопируй содержимое C:\Users\user\.ssh\id_ed25519.pub
# На сервере:
echo "ssh-ed25519 AAAA... your-email@example.com" >> ~/.ssh/authorized_keys
```

---

## 📊 КАК ПРОВЕРИТЬ, ЧТО ВСЁ РАБОТАЕТ


### На GitHub

```
https://github.com/adylbekkold-prog/pasco/actions
```

Видишь зелёную галочку ✅ = деплой прошёл успешно.

### На сервере

```bash
ssh root@YOUR_VPS_IP
pm2 status          # Приложение должно быть "online"
pm2 logs pasco-lab-portal   # Логи приложения
```

### В браузере

```
https://YOUR_DOMAIN
```

---

## 🛠️ ЧАСТЫЕ ПРОБЛЕМЫ

### ❌ "Permission denied (publickey)" при деплое

**Причина:** SSH-ключ не настроен или неверный.
**Решение:** Проверь, что `VPS_SSH_KEY` в GitHub Secrets — это приватный ключ (не публичный), и что публичный ключ добавлен в `~/.ssh/authorized_keys` на сервере.

### ❌ "Host key verification failed"

**Причина:** GitHub Actions не знает хост-ключ сервера.
**Решение:** Добавь в workflow опцию `fingerprint` или используй `ssh-keyscan`:
```bash
ssh-keyscan YOUR_VPS_IP
```
Добавь вывод в секрет `VPS_HOST_KEY` и в workflow добавь `fingerprint: ${{ secrets.VPS_HOST_KEY }}`.

### ❌ Приложение не запускается после деплоя

**Решение:** Проверь логи:
```bash
ssh root@YOUR_VPS_IP
pm2 logs pasco-lab-portal
```

### ❌ SSL-сертификат не получен

**Причина:** Домен не указывает на IP сервера.
**Решение:** Добавь A-запись в DNS: `pasco.example.com → YOUR_VPS_IP`

---

## 📝 ИТОГО

После настройки (шаги 1-3) деплой становится **однокнопочным**:

```
git push  →  GitHub Actions  →  Автоматический деплой на Hetzner VPS
```

Или вручную кнопкой "Run workflow" в GitHub Actions.

**Всё готово! 🎉**
