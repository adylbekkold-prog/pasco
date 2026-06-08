# 🎬 CI/CD WORKFLOWS - ВИЗУАЛЬНОЕ ОБЪЯСНЕНИЕ

## 🔄 КАК РАБОТАЕТ WORKFLOW? (ЦИКЛ)

```
┌─────────────────────────────────────────────────────────────────┐
│                        ТЫ РАЗРАБОТЧИК                           │
│                                                                 │
│  1. Пишешь код                                                 │
│  2. git add .                                                  │
│  3. git commit -m "message"                                    │
│  4. git push                                                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────────┐
          │                                    │
          │   📤 КОД ЗАГРУЖАЕТСЯ НА GITHUB     │
          │                                    │
          └────────────────┬───────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
    ┌──────────────────────┐  ┌──────────────────────┐
    │   🧪 WORKFLOW: TESTS │  │  🔍 WORKFLOW: LINT   │
    │                      │  │                      │
    │ (автоматически)      │  │ (автоматически)      │
    └──────────────────────┘  └──────────────────────┘
              │                         │
       ┌──────┴──────────┐      ┌──────┴──────────┐
       │                 │      │                 │
       ▼                 ▼      ▼                 ▼
  ✅ Тесты       ✅ Build    ✅ ESLint       ✅ Report
  (90 passed)    (успешно)   (чистый код)   (результат)
       │                 │      │                 │
       └──────┬──────────┘      └────────┬────────┘
              │                          │
              └──────────────┬───────────┘
                             │
                 ┌───────────▼──────────┐
                 │                      │
                 │  🟢 ВСЕ ЗЕЛЁНОЕ?     │
                 │  Код готов к merge!  │
                 │                      │
                 └──────────────────────┘
                             │
                             ▼
          ┌──────────────────────────────────┐
          │    5. Видишь результаты в        │
          │    GitHub Actions                │
          │                                  │
          │    ✅ ✅ ДВА WORKFLOW PASSED      │
          └──────────────────────────────────┘
```

---

## 📋 ДЕТАЛЬНЫЙ ПРОЦЕСС: ЧТО ДЕЛАЕТ КАЖДЫЙ WORKFLOW?

### 🧪 WORKFLOW "Tests" (test.yml) - ПОДРОБНО

```
ТРИГГЕР (Когда запускать?):
├─ push на ветку main
├─ push на ветку develop
├─ pull request на main
└─ pull request на develop

ЗАПУСКАЕТСЯ JOB "test":
┌─────────────────────────────────────────────────┐
│ Сервер: Ubuntu Linux (AWS облако GitHub)        │
│ Матрица: Node.js 18.x И Node.js 20.x           │
│          (То есть запускается 2 раза)           │
└─────────────────────────────────────────────────┘

ШАГИ (Step by step):
┌──────────────────────────────────────────────────────────┐
│ 1️⃣  Checkout
│    └─→ Скачиваешь все файлы проекта с GitHub
│        (весь исходный код)
│
│ 2️⃣  Setup Node.js
│    └─→ Устанавливаешь правильную версию Node
│        (18.x или 20.x)
│
│ 3️⃣  Setup npm cache
│    └─→ Ускоряет загрузку пакетов
│        (npm сохраняет файлы в cache)
│
│ 4️⃣  npm ci
│    └─→ Загружаешь пакеты (зависимости)
│        из package.json
│        (как npm install, но надёжнее)
│
│ 5️⃣  npm run lint
│    └─→ Проверяешь код на ошибки ESLint
│        (опечатки, неправильный стиль)
│        || true = продолжить, даже если ошибки
│
│ 6️⃣  npm run test -- --coverage
│    └─→ Запускаешь 90+ тестов
│        --coverage = сколько % кода протестировано
│        continue-on-error = не блокировать, если упадут
│
│ 7️⃣  npm run build
│    └─→ Собираешь проект для production
│        (компилируешь TypeScript в JavaScript)
│
│ 8️⃣  Upload coverage
│    └─→ Отправляешь результаты в Codecov
│        (сервис для отслеживания тестов)
└──────────────────────────────────────────────────────────┘

РЕЗУЛЬТАТ:
├─ ✅ Все тесты прошли = зелёная галка
├─ ✅ Build успешно = код рабочий
├─ ❌ Что-то не так = красный крест (смотри лог)
└─ ⏱️ Всё это займёт ~1.6 секунды
```

### 🔍 WORKFLOW "Lint" (lint.yml) - ПОДРОБНО

```
ТРИГГЕР (Когда запускать?):
├─ push на ветку main
├─ push на ветку develop
├─ pull request на main
└─ pull request на develop

ЗАПУСКАЕТСЯ JOB "lint":
┌─────────────────────────────────────────────────┐
│ Сервер: Ubuntu Linux (AWS облако GitHub)        │
│ Node.js: 20 (одна версия)                      │
│ Цель: Проверить качество кода                  │
└─────────────────────────────────────────────────┘

ШАГИ:
┌────────────────────────────────────────────────────┐
│ 1️⃣  Checkout
│    └─→ Скачиваешь исходный код
│
│ 2️⃣  Setup Node.js 20
│    └─→ Устанавливаешь Node версии 20
│
│ 3️⃣  npm ci
│    └─→ Загружаешь пакеты (зависимости)
│
│ 4️⃣  npm run lint
│    └─→ Запускаешь ESLint
│        Проверяет:
│        ├─ Неправильный синтаксис
│        ├─ Неиспользуемые переменные
│        ├─ Неправильный формат кода
│        ├─ console.log в production коде
│        └─ Другие ошибки стиля
│
│        continue-on-error = не блокировать
│
│ РЕЗУЛЬТАТ:
│ ├─ ✅ Нет ошибок = зелёная галка
│ └─ ⚠️ Есть предупреждения = всё ещё зелёная (continue-on-error)
└────────────────────────────────────────────────────┘
```

---

## 🎯 ПОШАГОВАЯ ИНСТРУКЦИЯ ПЕРВЫЙ РАЗ

### ЭТАП 1: Создать GitHub репозиторий

```
1. Открыть браузер
   https://github.com/new

2. Заполнить:
   ┌─────────────────────────────────┐
   │ Repository name:                 │
   │ pasco-lab-portal                │
   │                                 │
   │ Description:                     │
   │ PASCO Lab Portal with CI/CD      │
   │                                 │
   │ ⭕ Public (видно всем)          │
   │   или                           │
   │ ⭕ Private (только ты)          │
   │                                 │
   │ [✓] Add a README file            │
   │ [✓] Add .gitignore              │
   │ [ ] Add a license                │
   │                                 │
   │ [Create repository]              │
   └─────────────────────────────────┘

3. После создания тебе даст URL:
   https://github.com/YOUR_USERNAME/pasco-lab-portal
```

---

### ЭТАП 2: Загрузить код с компьютера

**Вариант А: Если у тебя ещё нет Git инициализирована**

```powershell
# 1. Открыть PowerShell в папке проекта
cd D:\pasco-lab-portal

# 2. Инициализировать Git
git init

# 3. Добавить GitHub как удалённый репо (замени USERNAME)
git remote add origin https://github.com/USERNAME/pasco-lab-portal.git

# 4. Добавить все файлы
git add .

# 5. Создать первый commit
git commit -m "Initial commit with tests, error handling and CI/CD"

# 6. Переименовать главную ветку на main (если нужно)
git branch -M main

# 7. Отправить на GitHub
git push -u origin main

# Готово! Файлы на GitHub 🎉
```

**Вариант Б: Если там уже Git (у тебя есть .git папка)**

```powershell
# 1. Открыть PowerShell в папке проекта
cd D:\pasco-lab-portal

# 2. Добавить GitHub как удалённый репо
git remote add origin https://github.com/USERNAME/pasco-lab-portal.git

# 3. Загрузить существующие файлы
git add .
git commit -m "Add workflows and tests"
git push -u origin main

# Готово!
```

---

### ЭТАП 3: Смотреть результаты workflows

**По шагам:**

```
1. Открыть GitHub:
   https://github.com/YOUR_USERNAME/pasco-lab-portal

2. Нажать на вкладку "Actions"
   ┌────────────────────────────────────────┐
   │ Code  Issues  PR  Discussions  Actions │
   │                              ^^^^^^^^  │
   │                           Нажми сюда!  │
   └────────────────────────────────────────┘

3. Видишь список workflow runs:
   ┌────────────────────────────────────────┐
   │ Workflow                 Status  Time  │
   │────────────────────────────────────────│
   │ Tests                    🟢 ✅   1.6s │
   │ Lint                     🟢 ✅   45s  │
   │ Tests                    🟢 ✅   2m   │
   │ ...                                   │
   └────────────────────────────────────────┘

4. Нажмешь на любой → Видишь детали:
   ┌────────────────────────────────────────┐
   │ ✅ test (18.x)                         │
   │    └─ Setup Node.js ... ✅            │
   │    └─ Install deps ... ✅             │
   │    └─ Run linter ... ✅               │
   │    └─ Run tests ... ✅ (90 passed)   │
   │    └─ Build ... ✅                    │
   │                                       │
   │ ✅ test (20.x)                       │
   │    └─ Setup Node.js ... ✅           │
   │    └─ Install deps ... ✅            │
   │    └─ Run linter ... ✅              │
   │    └─ Run tests ... ✅ (90 passed)  │
   │    └─ Build ... ✅                   │
   │                                       │
   │ ✅ Lint                              │
   │    └─ Setup Node.js ... ✅          │
   │    └─ Install deps ... ✅           │
   │    └─ Run ESLint ... ⚠️              │
   │       (warnings but passed)           │
   └────────────────────────────────────────┘
```

**Готово! Workflows работают! 🚀**

---

## 🔄 КАЖДЫЙ РАЗ ПОСЛЕ ИЗМЕНЕНИЙ

После того как первый раз загрузил:

```powershell
# 1. Изменяешь файлы в редакторе

# 2. Сохраняешь и вводишь:
git add .
git commit -m "Описание что изменил"
git push

# 3. GitHub автоматически запускает workflows
#    (не нужно делать ничего вручную!)

# 4. Через 1-2 минуты видишь результаты в Actions
```

---

## 🎬 ВИЗУАЛЬНО: ЧТО ВИДИШЬ НА ЭКРАНЕ

### На GitHub (Actions вкладка)

```
┌──────────────────────────────────────────────────────┐
│ Actions                          ← Вкладка Actions   │
├──────────────────────────────────────────────────────┤
│                                                       │
│ All workflows          Filters: Recent                │
│                                                       │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Add CI/CD workflows ... 1 min ago                 │ │
│ │ ✅ ✅  2 run successful                           │ │
│ │                                                  │ │
│ │ 🟢 Tests               main  1 min ago   ✅  1.6s │ │
│ │ 🟢 Lint                main  1 min ago   ✅  45s  │ │
│ └──────────────────────────────────────────────────┘ │
│                                                       │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Previous commit ...                              │ │
│ │ ✅ ✅  2 run successful                          │ │
│ │ 🟢 Tests                                  ✅  1.6s│ │
│ │ 🟢 Lint                                   ✅  45s │ │
│ └──────────────────────────────────────────────────┘ │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### Когда нажимаешь на "Tests"

```
┌─────────────────────────────────────────────────────┐
│ Tests  ✅  PASSED  ~1.6s  18 May 2025, 10:23 AM     │
├─────────────────────────────────────────────────────┤
│                                                     │
│ test (18.x)                                  ✅    │
│ ├─ Checkout code                             ✅    │
│ ├─ Setup Node.js                             ✅    │
│ ├─ Cache npm                                 ✅    │
│ ├─ Install dependencies                      ✅    │
│ ├─ Run linter                                ✅    │
│ ├─ Run tests                                 ✅    │
│ │  └─ Tests: 90 passed                            │
│ │  └─ Rendering: 15 tests                        │
│ │  └─ Error handlers: 21 tests                   │
│ │  └─ Loggers: 23 tests                          │
│ ├─ Build                                     ✅    │
│ └─ Upload coverage                           ✅    │
│                                                     │
│ test (20.x)                                  ✅    │
│ ├─ Checkout code                             ✅    │
│ ├─ Setup Node.js                             ✅    │
│ ├─ Cache npm                                 ✅    │
│ ├─ Install dependencies                      ✅    │
│ ├─ Run linter                                ✅    │
│ ├─ Run tests                                 ✅    │
│ │  └─ Tests: 90 passed                            │
│ ├─ Build                                     ✅    │
│ └─ Upload coverage                           ✅    │
│                                                     │
│ build                                        ✅    │
│ ├─ Checkout code                             ✅    │
│ ├─ Setup Node.js                             ✅    │
│ ├─ Cache npm                                 ✅    │
│ ├─ Install dependencies                      ✅    │
│ ├─ Build app                                 ✅    │
│ └─ Upload artifacts                          ✅    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## ⚠️ ЧТО ЕСЛИ КРАСНЫЙ КРЕСТ (❌)?

### Пример: Тест упал

```
┌─────────────────────────────────────────────────────┐
│ Tests  ❌  FAILED  ~2.1s  18 May 2025, 10:25 AM     │
├─────────────────────────────────────────────────────┤
│                                                     │
│ test (18.x)                                  ❌    │
│ ├─ Checkout code                             ✅    │
│ ├─ Setup Node.js                             ✅    │
│ ├─ Install dependencies                      ✅    │
│ ├─ Run linter                                ✅    │
│ ├─ Run tests                                 ❌    │ ← СЛОМАЛОСЬ!
│ │  └─ TypeError: Cannot read property ...   │
│ │  └─ at Object.<anonymous>                │
│ │  └─ Tests: 88 passed, 2 FAILED           │
│ └─ Build                                     ⏭️    │ ← Пропущен
│                                                     │
│ РЕШЕНИЕ:                                            │
│ 1. Прочитай ошибку выше                            │
│ 2. Исправь код локально                            │
│ 3. npm test (проверь что работает)                 │
│ 4. git add . → git commit → git push                │
│ 5. Workflows снова запустятся автоматически        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📚 СПРАВКА: ФАЙЛЫ WORKFLOWS РАСПОЛОЖЕНИЕ

```
pasco-lab-portal/
├── .github/
│   └── workflows/
│       ├── test.yml          ← Файл workflow-а для тестов
│       └── lint.yml          ← Файл workflow-а для проверки кода
│
└── (остальные файлы проекта)
```

**Важно:** Папка `.github` скрыта на Windows!
- Чтобы видеть: Проводник → Вид → Скрытые элементы [ ✓ ]
- Или используй VSCode (там видно всегда)

---

## ✅ ЧЕКЛИСТ: ВСЁ ЛИ ТЫ ЗАГРУЗИЛ?

Перед `git push` проверь:

```powershell
# 1. Все файлы добавлены?
git status
# Должно быть: nothing to commit (или новые файлы красные)

# 2. Workflows на месте?
ls .github/workflows/
# Должно быть:
# lint.yml
# test.yml

# 3. Тесты работают локально?
npm test
# Должно быть: 90 passed

# 4. Build OK?
npm run build
# Должно быть: keine Error

# ЕСЛИ ВСЁ ✅ → Тогда:
git add .
git commit -m "message"
git push
```

---

## 🎓 ИТОГОМ

|  | Что | Где | Когда |
|---|-----|-----|-------|
| **Код** | Пишешь на компьютере | `D:\pasco-lab-portal` | Всегда |
| **GitHub** | Хранилище кода | github.com | После `git push` |
| **Workflows** | Автоматические проверки | `.github/workflows/` | Каждый `git push` |
| **Результаты** | Видишь статус | github.com/you/repo/actions | 1-2 минуты |

---

## 🚀 БЫС СТАРТ

```bash
# Один раз:
cd D:\pasco-lab-portal
git init
git remote add origin https://github.com/USERNAME/pasco-lab-portal.git

# Каждый раз:
git add .
git commit -m "Описание"
git push

# Смотреть результаты:
https://github.com/USERNAME/pasco-lab-portal/actions
```

**Готово! Workflows работают автоматически! 🎉**
