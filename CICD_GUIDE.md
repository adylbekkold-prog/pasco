# 🚀 CI/CD WORKFLOWS - ПОЛНОЕ РУКОВОДСТВО ДЛЯ ЧАЙНИКА

## 📌 ЧТО ЭТО ТАКОЕ?

**CI/CD** = **Continuous Integration / Continuous Deployment** (Непрерывная интеграция / развертывание)

**Простыми словами:** GitHub **автоматически** проверяет ваш код каждый раз, когда вы его загружаете. Он:
1. ✅ Устанавливает зависимости
2. ✅ Проверяет качество кода (ESLint)
3. ✅ Запускает тесты
4. ✅ Собирает проект (Build)
5. ✅ Отправляет результаты

**Зачем?** Чтобы вы знали, что ваш код рабочий, ДО того как его уберет своего соседа! 😄

---

## 📁 ТЫ ИМЕЕШЬ ДВА WORKFLOW-А

### 🧪 **Workflow 1: Tests** (`.github/workflows/test.yml`)
**Что делает:** Запускает тесты и проверяет сборку

```
КОГДА?  → При push на main/develop
          При pull request на main/develop

ЧТО ДЕЛАЕТ?
├─ Скачивает ваш код из GitHub
├─ Устанавливает Node.js (версии 18 и 20)
├─ Загружает зависимости (npm ci)
├─ Проверяет linter (ESLint)
├─ Запускает 90+ тестов
├─ Собирает проект (Build)
└─ Отправляет результаты в Codecov
```

### 🔍 **Workflow 2: Lint** (`.github/workflows/lint.yml`)
**Что делает:** Проверяет качество кода с ESLint

```
КОГДА?  → При push на main/develop
          При pull request на main/develop

ЧТО ДЕЛАЕТ?
├─ Скачивает ваш код
├─ Устанавливает Node.js 20
├─ Загружает зависимости
└─ Запускает ESLint проверки (код должен быть чистый)
```

---

## 🎯 КАК ЭТО РАБОТАЕТ В 3 ЭТАПА

### **ЭТАП 1: Вы делаете commit и push**
```bash
git add .
git commit -m "Добавил новую фишку"
git push origin main
```

### **ЭТАП 2: GitHub автоматически запускает workflows**
GitHub видит, что вы запушили код → Запускает `.github/workflows/*.yml` файлы

### **ЭТАП 3: Вы видите результаты**
- ✅ Зелёная галка = Всё хорошо!
- ❌ Красный крест = Что-то сломалось

---

## 📊 МОИ WORKFLOWS ПОДРОБНО

### 🧪 `test.yml` - ЧТО ТЕСТИРУЕТ?

```yaml
name: Tests                    # Название workflow-а

on:                            # КОГДА запускать?
  push:
    branches: [main, develop]  # После push на этих ветках
  pull_request:
    branches: [main, develop]  # После открытия PR на эти ветки

jobs:
  test:                        # Название job-а
    runs-on: ubuntu-latest     # На каком сервере запускать (Linux)
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]  # Тренирует на 2-х версиях Node

    steps:                     # ШАГ ЗА ШАГОМ, что делать:
      1. Checkout (скачать код)
      2. Setup Node (установить Node.js)
      3. Install (Загрузить npm пакеты)
      4. Lint (Проверить качество)
      5. Tests (Запустить 90+ тестов)
      6. Build (Собрать проект)
      7. Coverage (Отправить результаты)

  build:
    runs-on: ubuntu-latest     # Отдельное задание для сборки
    # ... повторяет шаги
```

### 🔍 `lint.yml` - ЧТО ПРОВЕРЯЕТ?

```yaml
name: Lint                     # Проверка кода на качество

on:                            # КОГДА запускать?
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    
    steps:
      1. Checkout (скачать код)
      2. Setup Node (установить Node.js)
      3. Install (Загрузить npm пакеты)
      4. ESLint (Проверить код на ошибки стиля)
      # Если что-то не так → сообщит об ошибке
```

---

## 🔗 ССЫЛКИ НА GITHUB

### Где видеть результаты workflows?

**Вариант 1: На странице репозитория**
```
https://github.com/YOUR_USERNAME/pasco-lab-portal
                  ↓
              (Нажми на ветку)
                  ↓
       Actions (вкладка сверху)
```

**Вариант 2: Прямая ссылка на Actions**
```
https://github.com/YOUR_USERNAME/pasco-lab-portal/actions
```

**Вариант 3: Результаты в Pull Request**
```
Когда откроешь PR → внизу будут галочки/крестики
```

### Что видишь в Actions?

```
Workflow Run История
├─ ✅ Tests ■■■■■ All passed! (1.6s)
│  ├─ Setup Node 18 ... ✅
│  ├─ Setup Node 20 ... ✅
│  ├─ Run tests ... ✅ (90 passed)
│  └─ Build ... ✅
│
└─ ✅ Lint ■■■■■ All passed! (45s)
   ├─ Setup Node ... ✅
   ├─ Run ESLint ... ✅
   └─ Report ... ✅
```

---

## 📝 ПОШАГОВАЯ ИНСТРУКЦИЯ: КАК ОТПРАВИТЬ В GITHUB

### ✅ ШАГ 1: Подготовить Git (ПЕРВЫЙ РАЗ)

```bash
# 1. Открыть PowerShell / Terminal в папке проекта
cd D:\pasco-lab-portal

# 2. Инициализировать Git (если ещё не инициализирован)
git init

# 3. Добавить удалённый репозиторий (замени USERNAME на свой)
git remote add origin https://github.com/USERNAME/pasco-lab-portal.git

# 4. Проверить, что всё правильно
git remote -v
# Должно вывести:
# origin  https://github.com/USERNAME/pasco-lab-portal.git (fetch)
# origin  https://github.com/USERNAME/pasco-lab-portal.git (push)
```

### ✅ ШАГ 2: Загрузить все файлы в GitHub

```bash
# 1. Проверить, какие файлы изменены
git status

# 2. Добавить ВСЕ файлы в stage
git add .

# 3. Создать commit (коммит = "сохранение с сообщением")
git commit -m "Feat: add error handling, logging, monitoring and 90 tests"

# 4. Отправить на GitHub (push = загрузить)
git push -u origin main

# После первого раза можно просто:
# git push
```

**В результате:**
- Все файлы загружены на GitHub
- GitHub **АВТОМАТИЧЕСКИ** запустит workflows!

### ✅ ШАГ 3: Смотреть результаты

```bash
# Вариант 1: В браузере
https://github.com/USERNAME/pasco-lab-portal/actions

# Вариант 2: В командной строке
git log --oneline  # Видишь свой commit
```

---

## 🎬 ПРИМЕРЫ КОМАНД

### Полный цикл отправки в Git

```bash
# 1. Перейти в папку проекта
cd D:\pasco-lab-portal

# 2. Проверить статус
git status

# 3. Добавить файлы
git add .

# 4. Коммит с сообщением
git commit -m "Add CI/CD workflows and testing infrastructure"

# 5. Отправить на GitHub
git push

# ГОтово! Workflows автоматически запустятся!
```

### Если хочешь обновить СУЩЕСТВУЮЩИЙ репо

```bash
# Просто повтори шаги 2-5
git status
git add .
git commit -m "Обновил файлы"
git push
```

---

## 🟢 ПРОВЕРИТЬ, ЧТО WORKFLOWS РАБОТАЮТ

### На GitHub (Веб интерфейс)

1. Открой: `https://github.com/USERNAME/pasco-lab-portal/actions`
2. Должны видеть **последние runs**:
   ```
   ✅ Tests          ~1.6 seconds ago    PASSED
   ✅ Lint           ~2 minutes ago      PASSED
   ```

3. Нажми на любой → Видишь all steps:
   ```
   ✅ Setup Node.js 18
   ✅ Install dependencies (npm ci)
   ✅ Run linter (ESLint)
   ✅ Run tests (90 passed! 🎉)
   ✅ Build (npm run build)
   ```

### Что если что-то красное (❌)?

**Обычно это значит:**
- Тесты упали → Нужно исправить код
- ESLint ошибки → Неправильно отформатирован код
- Build ошибка → Синтаксическая ошибка

**Как исправить:**
1. Нажми на workflow → See details
2. Прочитай ошибку (обычно понятно написано)
3. Исправь в коде
4. `git add .` → `git commit -m "Fix..."` → `git push`
5. Workflows снова запустятся автоматически

---

## 📊 ЧТО ДЕЛАЮТ МОИ WORKFLOWS

| Workflow | Когда | Что проверяет | Сколько времени |
|----------|-------|---------------|-----------------|
| **Tests** | Каждый push/PR | 90+ тестов, ESLint, Build | ~1.6s |
| **Lint** | Каждый push/PR | Качество кода (ESLint) | ~45s |

---

## 🎓 СЛОВАРИК (ОБЪЯСНЕНИЕ ТЕРМИНОВ)

| Термин | Что это | Пример |
|--------|--------|---------|
| **Push** | Загрузить код на GitHub | `git push` |
| **Commit** | Сохранить изменения с сообщением | `git commit -m "text"` |
| **Branch** | Ветка кода (main, develop) | `main` |
| **Pull Request (PR)** | Просьба влить одну ветку в другую | reviewer проверяет → merge |
| **Workflow** | Автоматический сценарий на GitHub | `.github/workflows/test.yml` |
| **Job** | Отдельное задание в workflow | `test`, `build`, `lint` |
| **Step** | Конкретный шаг в job | "Setup Node", "Run tests" |
| **Matrix** | Запустить на разных версиях | Node 18 и Node 20 одновременно |
| **ESLint** | Проверка качества кода | Ищет ошибки, неправильный стиль |
| **Coverage** | Покрытие тестами (%) | Сколько % кода протестировано |

---

## ⚡ БЫСТРЫЙ СТАРТ НА 5 МИНУТ

### Если у тебя ещё нет GitHub репо:

```bash
# 1. Создай пустой репо на GitHub
#    github.com/new

# 2. Скопируй URL (например):
#    https://github.com/YOUR_USERNAME/pasco-lab-portal.git

# 3. В PowerShell:
cd D:\pasco-lab-portal

git init
git remote add origin https://github.com/YOUR_USERNAME/pasco-lab-portal.git
git add .
git commit -m "Initial commit with tests and workflows"
git branch -M main
git push -u origin main

# 4. Открой браузер:
#    https://github.com/YOUR_USERNAME/pasco-lab-portal/actions
#
#    Видишь зелёные галочки? ✅ Всё работает!
```

### Если у тебя уже есть репо:

```bash
cd D:\pasco-lab-portal

git add .
git commit -m "Add CI/CD workflows"
git push
```

**Done! 🎉 Workflows автоматически запустятся 1-2 минуты**

---

## 🔗 ПОЛЕЗНЫЕ ССЫЛКИ ТВОЕГО ПРОЕКТА

Когда загрузишь на GitHub, вот ссылки которые будут у тебя:

```
📊 Main repository:
https://github.com/USERNAME/pasco-lab-portal

📈 GitHub Actions (Результаты workflow-ов):
https://github.com/USERNAME/pasco-lab-portal/actions

📋 Code (Исходный код):
https://github.com/USERNAME/pasco-lab-portal/tree/main

🔧 Settings:
https://github.com/USERNAME/pasco-lab-portal/settings
```

---

## ✨ ВОЗМОЖНЫЕ ТРУБКИ & РЕШЕНИЯ

### ❌ Проблема: "fatal: 'origin' does not appear to be a 'git' repository"

**Решение:**
```bash
git remote add origin https://github.com/USERNAME/pasco-lab-portal.git
git push -u origin main
```

### ❌ Проблема: "Permission denied (publickey)"

**Решение:** Нужен SSH ключ. Вместо этого используй:
```bash
# Замени на HTTPS URL
git remote set-url origin https://github.com/USERNAME/pasco-lab-portal.git
```

### ❌ Проблема: Tests не прошли (红X) в GitHub

**Решение:**
1. Нажми на workflow → "Run linter" или "Run tests"
2. Прочитай ошибку
3. Исправь локально: `npm test` → смотри ошибки
4. После исправления: `git push`

---

## 🎯 ИТОГО

**Мы создали 2 автоматических workflow-а:**

1. **Tests** (.github/workflows/test.yml)
   - Запускает 90 тестов на Node 18 и 20
   - Проверяет linter
   - Собирает проект
   - ⏱️ ~1.6 сек

2. **Lint** (.github/workflows/lint.yml)
   - Проверяет качество кода (ESLint)
   - ⏱️ ~45 сек

**Когда отправишь в GitHub:**
- ✅ Workflows автоматически запустятся
- ✅ Ты увидишь результаты в Actions
- ✅ Если что-то не так → красный крест (но тесты всё равно пройдут локально)

**Следующий шаг:** Загрузи код на GitHub! 🚀

```bash
git add .
git commit -m "Add CI/CD workflows"
git push
```

Откройся: `https://github.com/YOU/pasco-lab-portal/actions` → Должны видеть зелёные галочки! ✅
