# 📅 МИНИМАЛЬНЫЙ ПЛАН РАБОТ ДЛЯ PRODUCTION

**Цель:** Получить production-ready приложение за **4-6 недель**

---

## 🏃 WEEK 1: FOUNDATION (40 часов) 🟢 КРИТИЧЕСКИЙ

### 🎯 Цель: Тестирование + CI/CD + базовая валидация

#### **Day 1-2: Jest Setup & First Tests (16 часов)**
```
Задачи:
□ Установить зависимости (jest, testing-library)
□ Создать jest.config.js и jest.setup.js
□ Написать 10 basic tests для lib/data-provider.ts
□ Setup GitHub Actions для автоматического запуска
□ Настроить codecov для отслеживания покрытия

Файлы для создания:
- jest.config.js
- jest.setup.js
- __tests__/lib/data-provider.test.ts
- .github/workflows/test.yml

Ожидаемый результат:
✅ Jest работает локально
✅ CI запускает тесты при push
✅ Минимум 50 тестов
```

#### **Day 3: Unit Tests для критических lib файлов (12 часов)**
```
Задачи:
□ Написать 80 тестов для lib/sync-queue.ts (критично!)
□ Написать 40 тестов для lib/queries.ts
□ Написать 20 тестов для lib/local-db.ts
□ Убедиться что все тесты зеленые

Минимальные тест-кейсы:
- sync-queue: добавление, чтение, очистка, обработка
- queries: все главные функции получения данных
- local-db: чтение, запись, обновление файлов

Целевое покрытие: >= 70%
```

#### **Day 4: Server-Side Validation (8 часов)**
```
Задачи:
□ Создать lib/validators.ts с Zod schemas
□ Обновить все Server Actions c валидацией
□ Написать 30 тестов для валидации
□ Убедиться что невалидные данные отклоняются

Список Server Actions:
- createLab()
- updateLab()
- deleteLab()
- uploadFile()
```

#### **Day 5: GitHub Actions Workflows (8 часов)**
```
Задачи:
□ Создать .github/workflows/test.yml (запуск при push)
□ Создать .github/workflows/lint.yml (ESLint проверка)
□ Создать .github/workflows/build.yml (проверка сборки)
□ Настроить branch protection rules
□ Проверить что все workflow работают

Workflow должны:
✅ Запускать на все PR
✅ Требовать зеленые тесты перед merge
✅ Собирать coverage reports
```

---

## 📚 WEEK 2: STABILITY (40 часов) 🟠 ВЫСОКИЙ

### 🎯 Цель: Безопасность БД + обработка ошибок + мониторинг

#### **Day 1-2: Database Security (16 часов)**
```
Задачи:
□ Создать SQL миграции в supabase/migrations/
□ Написать 001_init_schema.sql с правильной структурой
□ Включить Row Level Security (RLS) на всех таблицах
□ Написать RLS policies для labs, resources,등
□ Создать 002_add_rls.sql миграцию

Примеры RLS почиcy:
- Публичное только для is_published=true
- Только создатель может редактировать
- Только админ может удалять
- Учителя видят только свои lab ы

Тестирование:
□ Протестировать что неавторизованный не видит приватные
□ Протестировать что невладелец не может редактировать
```

#### **Day 3-4: Error Handling & Logging (16 часов)**
```
Задачи:
□ Создать lib/logger.ts с структурированным логированием
□ Создать lib/monitoring.ts с Sentry интеграцией
□ Создать app/error.tsx (Global Error Boundary)
□ Создать app/(public)/error.tsx для публичной части
□ Создать app/(admin)/error.tsx для админ части
□ Обновить все error throw statements для логирования
□ Написать 25 тестов для error handling

Функциональность:
✅ Все ошибки логируются структурированно
✅ Production ошибки отправляются в Sentry
✅ User видит friendly messages
✅ Developer видит полную информацию об ошибке
```

#### **Day 5: Performance Monitoring (8 часов)**
```
Задачи:
□ Добавить Sentry пакет в package.json и настроить
□ Создать lib/metrics.ts для отслеживания метрик
□ Добавить Web Vitals tracking в layout.tsx
□ Настроить performance monitoring в Sentry dashboard

Что мониторить:
- Core Web Vitals (LCP, FID, CLS)
- Database query times
- API response times
- Error rates
```

---

## 🐳 WEEK 3: DEPLOYMENT (35 часов) 🟡 ВЫСОКИЙ

### 🎯 Цель: Docker + Environment Config + скрипты развертывания

#### **Day 1: Docker Setup (12 часов)**
```
Задачи:
□ Создать Dockerfile (multi-stage build)
□ Создать docker-compose.yml для разработки
□ Создать .dockerignore
□ Добавить health check endpoint (api/health)
□ Протестировать Docker образ локально

Требования:
✅ Image размер < 300MB
✅ Health check работает
✅ Volume mount для разработки
✅ Environment variables работают
```

#### **Day 2: Environment & Secrets (8 часов)**
```
Задачи:
□ Создать полный .env.example со всеми переменными
□ Документировать каждую переменную
□ Создать lib/config.ts для валидации at startup
□ Добавить проверку обязательных переменных
□ Создать scripts/setup-prod.sh сценарий

Переменные для добавления:
- LOG_LEVEL
- SENTRY_DSN
- REDIS_URL
- API_RATE_LIMIT
- SESSION_SECRET
- CORS_ORIGINS
- etc.
```

#### **Day 3: Deployment Workflow (12 часов)**
```
Задачи:
□ Создать .github/workflows/deploy.yml
□ Настроить автоматический деплой при push в main
□ Добавить pre-deployment checks (тесты, build)
□ Создать scripts/deploy.sh локальный скрипт
□ Протестировать deployment на staging

Deploy должен:
✅ Запускаться только на main branch
✅ Требовать все тесты зеленые
✅ Иметь manual approval шаг
✅ Иметь rollback возможность
```

#### **Day 4: API Health & Monitoring (3 часа)**
```
Задачи:
□ Создать app/api/health/route.ts endpoint
□ Мониторить downtime с помощью Sentry/UptimeRobot
□ Настроить alerts при ошибках

Health check должен проверять:
✅ Database connection
✅ Supabase доступность
✅ File storage доступность
```

---

## 🧪 WEEK 4: TESTING & HARDENING (35 часов) 🟡 СРЕДНИЙ

### 🎯 Цель: E2E тесты + Security audit + документация

#### **Day 1-2: E2E Tests (16 часов)**
```
Задачи:
□ Установить и настроить Playwright
□ Написать 10-15 E2E тестов для критических flows:
  - User signup / login
  - Create lab
  - Edit lab
  - Delete lab
  - View published lab
  - Filter and search
□ Добавить E2E тесты в CI/CD pipeline

E2E flow примеры:
- Admin login → Create lab → Edit → Publish
- Student search → View details → Download resources
- Admin delete lab with confirmation
```

#### **Day 3: Security Audit (12 часов)**
```
Задачи:
□ Провести security code review
□ Проверить SQL injection vulnerabilities (все параметризовано ✓)
□ Проверить XSS vulnerabilities
□ Проверить CSRF protection
□ Проверить authentication flows
□ Проверить authorization logic
□ Запустить OWASP ZAP сканирование (если возможно)

Использовать OWASP Top 10 как checklist:
- SQL Injection ✓ (Supabase параметризует)
- XSS ✓ (React автоматически экранирует)
- CSRF ⚠️ (Next.js provides, document)
- Weak auth ⚠️ (Supabase auth, но проверить)
- etc.
```

#### **Day 4-5: Documentation (7 часов)**
```
Задачи:
□ Написать DEVELOPER_GUIDE.md (как запустить)
□ Написать DEPLOYMENT.md (как развернуть)
□ Написать API.md (все endpoints)
□ Написать DATABASE.md (SQL schema)
□ Написать TESTING.md (как писать тесты)
□ Написать TROUBLESHOOTING.md

Документ должны содержать:
- Quick start guide
- Full installation steps
- Architecture overview
- Common issues & solutions
- Contributing guidelines
```

---

## 🎯 WEEK 5: OPTIMIZATION & POLISH (25 часов) 🟢 ОПЦИОНАЛЬНО

### 🎯 Цель: Performance + Additional features

#### **Day 1: Performance Optimization (12 часов)**
```
Задачи:
□ Добавить bundle size analysis
□ Оптимизировать images
□ Настроить database indexes
□ Реализовать pagination для больших списков
□ Добавить npm run analyze скрипт

Targets:
- Bundle size < 500KB (gzipped)
- Lighthouse score > 90
- FCP < 2s
- LCP < 2.5s
```

#### **Day 2-3: Additional Testing (8 часов)**
```
Задачи:
□ Написать integration tests для API routes
□ Добавить load testing для database
□ Тестировать offline functionality
□ Тестировать sync queue в стрессовых условиях
```

#### **Day 4: Advanced Features (5 часов)**
```
Задачи:
□ Настроить Redis для кэширования (опционально)
□ Добавить email notifications (опционально)
□ Настроить автоматические backups (опционально)
```

---

## 📋 ИТОГОВАЯ ТАБЛИЦА

| Неделя | Фокус | Часов | PR | Тесты | Документация |
|--------|-------|-------|----|----|-----|
| **1** | Foundation | 40 | ✅ 1-2 | 100+ | README updates |
| **2** | Stability | 40 | ✅ 2-3 | 150+ | Error handling |
| **3** | Deployment | 35 | ✅ 1 | 20+ | Docker, Env |
| **4** | Testing | 35 | ✅ 2 | 50+ E2E | Full docs |
| **5** | Optimization | 25 | ✅ 1 | 30+ | Troubleshooting |
| **ИТОГО** | **Production Ready** | **175** | **7-9 PR** | **350+ tests** | **Complete** |

---

## ⚡ МИНИМАЛЬНЫЙ ПУТЬ (2 недели)

Если нужно быстро в production, минимум:

```
НЕДЕЛЯ 1 (40 часов):
□ Jest + 50 базовых unit тестов (20ч)
□ GitHub Actions CI/CD workflow (10ч)
□ Server-side validation всех API (10ч)

НЕДЕЛЯ 2 (40 часов):
□ Docker образ (10ч)
□ Error handling + logging (15ч)
□ Database RLS миграции (15ч)

= 80 часов = можно развертывать, но ТРЕБУЕТСЯ:
- E2E тесты перед production
- Security audit
- Monitoring setup
```

---

## 🚀 FIRST SPRINT (1-2 недели)

### Первые Quick Wins (5-10 часов):

```bash
# 1. Установить Jest и базовые тесты
npm install jest @testing-library/react ts-jest

# 2. Создать первый workflow
.github/workflows/test.yml

# 3. Написать 30 базовых тестов
__tests__/lib/data-provider.test.ts

# 4. Зафиксировать any типы
components/*.tsx → явные интерфейсы

# 5. Добавить .env.example
.env.example с 15+ переменными

# 6. Создать DEVELOPER_GUIDE.md
docs/DEVELOPER_GUIDE.md

# Результат: 3 Merged PR за день, уже лучше!
```

---

## 📊 МЕТРИКИ УСПЕХА ПО НЕДЕЛЯМ

### Week 1 ✅
- [ ] Jest configured & 100+ tests passing
- [ ] CI/CD running on all PRs
- [ ] 0 `any` types in Server Actions
- [ ] Codecov reporting >50% coverage

### Week 2 ✅
- [ ] RLS policies enabled
- [ ] All errors logged
- [ ] Sentry integrated
- [ ] 250+ tests, >70% coverage

### Week 3 ✅
- [ ] Docker works locally
- [ ] Deploy workflow automated
- [ ] .env properly configured
- [ ] Health check passing

### Week 4 ✅
- [ ] 15+ E2E tests
- [ ] Security audit passed
- [ ] Full documentation
- [ ] 350+ tests, >80% coverage

### Week 5 ✅
- [ ] Lighthouse >90
- [ ] No performance issues
- [ ] Monitoring live
- [ ] Ready for production!

---

## ✅ FINAL PRODUCTION CHECKLIST

Перед развертыванием убедиться что ВСЕ пункты ✅:

```
TESTS:
□ Unit tests: >80% coverage
□ Integration tests: все API routes
□ E2E tests: critical flows
□ All tests passing in CI

SECURITY:
□ RLS policies enabled
□ Server-side validation active
□ No hardcoded secrets
□ Security headers configured
□ CORS properly configured
□ Rate limiting active

MONITORING:
□ Sentry configured
□ Logging working
□ Alerts setup
□ Health checks passing
□ Database backups working

DEPLOYMENT:
□ Docker image builds
□ Environment variables set
□ Database migrations applied
□ SSL/HTTPS enabled
□ Disaster recovery plan

DOCUMENTATION:
□ Developer guide complete
□ API documentation
□ Deployment steps
□ Troubleshooting guide
□ Runbooks for common issues

PERFORMANCE:
□ Bundle size <500KB
□ Lighthouse >90
□ Database optimized
□ No N+1 queries
□ Images optimized
```

---

**Статус:** 🚀 READY TO START  
**Целевая дата:** +4-6 недель от сейчас  
**Риск:** Если пропустить Week 1-2 = очень высокий!

