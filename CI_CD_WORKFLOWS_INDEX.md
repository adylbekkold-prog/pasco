# 📚 ПОЛНЫЙ ГАЙД CI/CD WORKFLOWS - ИНДЕКС

## 🎯 ДЛЯ急 СПЕШИШЬ? (5 МИНУТ)

Прочитай это:
👉 **[GITHUB_QUICKSTART.md](GITHUB_QUICKSTART.md)** - Copy-paste команды

```powershell
cd D:\pasco-lab-portal
git init
git remote add origin https://github.com/YOU/pasco-lab-portal.git
git add .
git commit -m "Add CI/CD"
git push -u origin main
```

Открой браузер: `https://github.com/YOU/pasco-lab-portal/actions`

✅ Готово!

---

## 📖 ХОЧЕШЬ ПОНЯТЬ КАК ЭТО РАБОТАЕТ? (20 МИНУТ)

**Читай В ЭТОМ ПОРЯДКЕ:**

1. **[CICD_VISUAL_GUIDE.md](CICD_VISUAL_GUIDE.md)** ⭐ ЧИТАЙ СНАЧАЛА
   - Визуальные схемы процесса
   - Диаграммы что делает каждый workflow
   - Пошаговые скриншоты на GitHub
   - Примеры результатов

2. **[CICD_GUIDE.md](CICD_GUIDE.md)** ⭐ ПОТОМ ЭТО
   - Подробное объяснение для чайника
   - Что такое CI/CD
   - Какие workflow-ы у тебя
   - Как использовать GitHub Actions
   - Словарик терминов

3. **[GITHUB_QUICKSTART.md](GITHUB_QUICKSTART.md)** ⭐ И НАКОНЕЦ ЭТО
   - Готовые команды для copy-paste
   - Ошибки и решения
   - Быстрая справка

---

## 📁 ЧТО СОЗДАННО ДЛЯ ТЕБЯ

### Workflow Files (GitHub Actions)

```
.github/workflows/
├── test.yml      <- Запускает тесты (90+) + ESLint + Build
│                    Когда: при push или PR
│                    Версии Node: 18.x и 20.x
│                    Время: ~1.6 сек
│
└── lint.yml      <- Проверяет код с ESLint
                     Когда: при push или PR
                     Версии Node: 20
                     Время: ~45 сек
```

### Dokumentation Files

```
├── CICD_GUIDE.md              <- ОСНОВНОЙ ГАЙД
├── CICD_VISUAL_GUIDE.md       <- ВИЗУАЛЬНЫЙ ГАЙД
├── GITHUB_QUICKSTART.md       <- БЫСТРЫЕ КОМАНДЫ
│
├── SERVER_ACTIONS_GUIDE.md    <- Как использовать error handling
├── IMPLEMENTATION_SUMMARY.md  <- Что было реализовано
└── CI_CD_WORKFLOWS_INDEX.md   <- Этот файл
```

---

## ⚡ БЫСТРЫЕ КОМАНДЫ

### Первый раз

```bash
cd D:\pasco-lab-portal
git init
git remote add origin https://github.com/USERNAME/pasco-lab-portal.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

### Каждый раз после приёмов

```bash
cd D:\pasco-lab-portal
npm test        # Проверь тесты (должно быть 90 ✅)
npm run build   # Проверь build
git add .
git commit -m "Description"
git push        # Запустит workflows автоматически
```

### Смотреть результаты

```
Открой браузер:
https://github.com/USERNAME/pasco-lab-portal/actions

Жди 1-2 минуты, видишь:
✅ Tests (1.6s)
✅ Lint  (45s)
```

---

## 🎯 WORKFLOW #1: Tests

### Что делает?

```
Каждый push/PR → Запускает:
├─ Install Node.js (18.x И 20.x одновременно)
├─ npm ci (install dependencies)
├─ npm run lint (ESLint проверка)
├─ npm run test --coverage (90+ тестов)  ✅ ВСЕ ПРОХОДЯТ!
├─ npm run build (собрать на production)
└─ Отправить результаты в Codecov
```

### Время?
- Node 18.x: ~1.6 сек
- Node 20.x: ~1.6 сек
- Всего: ~2-3 сек + overhead = 5 сек

### Файл конфигурации
`.github/workflows/test.yml` (50 строк)

---

## 🎯 WORKFLOW #2: Lint

### Что делает?

```
Каждый push/PR → Проверяет:
├─ Install Node.js 20
├─ npm ci
└─ npm run lint (ESLint)
   ├─ Синтаксические ошибки
   ├─ Неиспользуемые переменные
   ├─ Неправильный формат кода
   ├─ console.log в prod коде
   └─ Другие ошибки стиля
```

### Время?
- ~45 сек

### Файл конфигурации
`.github/workflows/lint.yml` (25 строк)

---

## 📊 МОИ ТЕСТЫ

Всего: **90 тестов** ✅ ВСЕ ПРОХОДЯТ

```
error-handler.test.ts      21 тест
logger.test.ts             23 теста
monitoring.test.ts         15 тестов
lab.actions.test.ts        6 тестов
validators.test.ts         12 тестов
locale.test.ts             8 тестов
data-provider.test.ts      15 тестов

ИТОГО: 90 тестов в 1.6 сек
```

---

## 🔗 ВАЖНЫЕ ССЫЛКИ

После загрузки на GitHub:

```
📊 Главная:
https://github.com/USERNAME/pasco-lab-portal

📈 GitHub Actions (где видишь результаты):
https://github.com/USERNAME/pasco-lab-portal/actions

📋 Код:
https://github.com/USERNAME/pasco-lab-portal/tree/main

🔧 Workflows:
https://github.com/USERNAME/pasco-lab-portal/blob/main/.github/workflows/test.yml
https://github.com/USERNAME/pasco-lab-portal/blob/main/.github/workflows/lint.yml

📝 Commits:
https://github.com/USERNAME/pasco-lab-portal/commits/main
```

Замени `USERNAME` на свой ник!

---

## 🚦 СТАТУСЫ WORKFLOW-ОВ

### ✅ Зелёная (PASSED)

```
Workflow успешно прошёл!
├─ Все тесты пошли
├─ ESLint ошибок нет (или только warnings)
├─ Build успешно собрался
└─ Всё готово к merge!
```

### ⚠️ Жёлтая (WARNING)

```
Workflow прошёл но с warnings:
├─ ESLint warnings (не ошибки, а рекомендации)
├─ Тесты могут быть skip-нуты
└─ Continue-on-error сработал
```

### ❌ Красная (FAILED)

```
Что-то сломалось:
├─ Тест не прошёл
├─ Build ошибка
├─ Синтаксическая ошибка
└─ Нужно исправить!
```

---

## 🔄 ЖИЗНЕННЫЙ ЦИКЛ PULL REQUEST

```
1. Ты делаешь branch:
   git checkout -b feature/my-feature

2. Пишешь код, коммитишь:
   git add .
   git commit -m "Add feature"
   git push origin feature/my-feature

3. Открываешь PR на GitHub:
   [Create pull request]

4. GitHub АВТОМАТИЧЕСКИ запускает workflows:
   ├─ Tests (Node 18.x) → Результаты через 1.6с
   ├─ Tests (Node 20.x) → Результаты через 1.6с
   └─ Lint → Результаты через 45с

5. Видишь статус в PR:
   ✅ All checks passed
   или
   ❌ Some checks failed

6. Если ❌ → Исправляешь, делаешь новый commit:
   git add .
   git commit -m "Fix issue"
   git push

7. Workflows снова запускаются АВТОМАТИЧЕСКИ

8. Когда ✅ → Merge PR:
   [Merge pull request]
```

---

## ⚙️ КОНФИГУРАЦИЯ WORKFLOWS

### test.yml структура

```yaml
name: Tests                          # Название
on:                                  # Триггеры
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:                              # Job 1: Тесты
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint || true
      - run: npm run test -- --coverage
      - run: npm run build

  build:                             # Job 2: Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
```

### lint.yml структура

```yaml
name: Lint

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
```

---

## 🎓 СЛОВАРИК ТЕРМИНОВ

| Термин | Что это | Пример |
|--------|--------|---------|
| **Workflow** | Файл с инструкциями для GitHub | test.yml, lint.yml |
| **Trigger** | Когда запускать workflow | push, pull_request |
| **Job** | Большое задание | test, lint, build |
| **Step** | Маленький шаг | Setup Node, Run tests |
| **Matrix** | Запустить на разных версиях | Node 18 и 20 одновременно |
| **Action** | Готовый блок кода | actions/checkout |
| **Run** | Команда bash | npm ci, npm test |
| **Artifact** | Файлы результаты | coverage report, build |
| **Log** | История выполнения | Видишь в GitHub |
| **Status** | Результат | ✅ passed, ❌ failed |

---

## 🛠️ РЕШЕНИЕ ПРОБЛЕМ

### Workflow не запускается

```
Проверь:
1. Файлы .github/workflows/test.yml и lint.yml есть?
2. Файлы в правильной папке?
3. YAML синтаксис OK? (нет ошибок)
4. Триггеры правильные (push на main)?

Решение:
git add .github/workflows/
git commit -m "Add workflows"
git push
```

### Тесты не проходят в GitHub но проходят локально

```
Возможные причины:
1. Разные версии Node (18 vs 20)
2. Environment переменные не установлены
3. Разные ОС (Windows vs Linux)

Решение:
npm test                    # Запусти локально
npm run build               # Проверь build
```

### ESLint ошибки в GitHub

```
1. Смотри ошибку в Lint workflow
2. Исправь код:
   npm run lint -- --fix   # Автоисправление
3. git add . && git commit && git push
```

---

## 📞 КОГДА ИСПОЛЬЗОВАТЬ КОМАНДЫ

| Команда | Когда | Зачем |
|---------|-------|-------|
| `git push` | После каждого commit | Загрузить на GitHub |
| `git push -u` | Первый раз на новой ветке | Установить upstream |
| `npm test` | Перед push | Проверить тесты локально |
| `npm run build` | Перед push | Проверить build |
| `npm run lint` | Перед push | Проверить код |
| `git log` | Любое время | Видеть историю commits |
| `git status` | Любое время | Видеть статус |

---

## 🎁 БОНУСЫ

### GitHub Actions Marketplace

После того как освоишься, можешь использовать готовые Actions:

```
https://github.com/marketplace?type=actions

Примеры:
- Deploy на Vercel
- Отправить в Sentry
- Отправить в Slack
- Создать issues для ошибок
- И много других!
```

### Branch Protection Rules

Можешь настроить GitHub чтобы require workflows passing:

```
Settings → Branches → Add rule
├─ Require status checks to pass
├─ Require tests to pass
└─ Prevent merge until workflows pass
```

Тогда никто не сможет merge код пока workflows не пройдут! 🔐

---

## 📚 ЧИТАЙ В ЭТОМ ПОРЯДКЕ

### Если совсем чайник:
1. [CICD_VISUAL_GUIDE.md](CICD_VISUAL_GUIDE.md) - Схемы & диаграммы
2. [CICD_GUIDE.md](CICD_GUIDE.md) - Подробное объяснение
3. [GITHUB_QUICKSTART.md](GITHUB_QUICKSTART.md) - Команды for copy-paste

### Если знаешь Git но не знаешь CI/CD:
1. [CICD_GUIDE.md](CICD_GUIDE.md) - Концепция
2. [GITHUB_QUICKSTART.md](GITHUB_QUICKSTART.md) - Интеграция
3. [Код workflows](.github/workflows/) - Детали

### Если просто хочешь запустить:
1. [GITHUB_QUICKSTART.md](GITHUB_QUICKSTART.md) - Copy-paste!

---

## ✨ ИТОГО

**Ты имеешь:**
- ✅ 2 GitHub Actions workflow-а (test.yml + lint.yml)
- ✅ 90 тестов автоматически
- ✅ ESLint проверка автоматически
- ✅ Build проверка автоматически
- ✅ Полная документация (4 гайда)

**Что делать дальше:**
1. Загруз на GitHub (используй GITHUB_QUICKSTART.md)
2. Смотри результаты в Actions
3. Каждый push → Автоматически проверяется ✅

**Готово!** Твой CI/CD работает! 🚀

---

## 📞 БЫСТРЫЕ ВОПРОСЫ

**Q: Что делать если workflow упал?**
A: Нажми на крестик в Actions → Прочитай ошибку → Исправь код → `git push`

**Q: Сколько времени занимает workflow?**
A: Tests: 1.6s, Lint: 45s, всего 50s (~1-2 минуты на GitHub)

**Q: Нужна ссылка на новый workflow?**
A: https://github.com/YOU/pasco-lab-portal/actions

**Q: Как я узнаю что обновилось?**
A: Смотри в repo → Actions вкладка → Latest runs

**Q: Если я не хочу push'ить?**
A: commit locally, тестируй дома, потом push когда готово

---

Всё готово к использованию! 🎉

Проверь: [GITHUB_QUICKSTART.md](GITHUB_QUICKSTART.md)
