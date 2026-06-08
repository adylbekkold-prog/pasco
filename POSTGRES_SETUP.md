# PostgreSQL Development Setup

Этот документ описывает, как настроить локальную базу данных PostgreSQL для разработки.

## Требования

- Docker
- Docker Compose

## Быстрый старт

### 1. Запуск PostgreSQL

```bash
# Запустить контейнеры PostgreSQL и PgAdmin
docker-compose up -d

# Проверить статус
docker-compose ps
```

### 2. Подключение к базе данных

**Параметры подключения:**
- Хост: `localhost`
- Порт: `5432`
- База данных: `pasco_lab_db`
- Пользователь: `pasco_user`
- Пароль: `pasco_password`

**Connection string:**
```
postgresql://pasco_user:pasco_password@localhost:5432/pasco_lab_db
```

### 3. PgAdmin (Web интерфейс)

- URL: http://localhost:5050
- Email: admin@example.com
- Пароль: admin

#### Добавить сервер в PgAdmin:
1. Перейти в http://localhost:5050
2. Нажать "Add New Server"
3. Вкладка "General": Name = `pasco-postgres`
4. Вкладка "Connection":
   - Host name: `postgres`
   - Port: `5432`
   - Username: `pasco_user`
   - Password: `pasco_password`
   - Database: `pasco_lab_db`

## Использование

### Выбрать окружение

Для использования локальной PostgreSQL, используйте файл `.env.postgres`:

```bash
# Опция 1: Скопировать содержимое
copy .env.postgres .env.local

# Опция 2: Создать симлинк (Linux/Mac)
ln -s .env.postgres .env.local
```

### Остановить PostgreSQL

```bash
docker-compose down
```

### Очистить данные

```bash
# Остановить контейнеры и удалить том
docker-compose down -v
```

### Просмотр логов

```bash
# Логи PostgreSQL
docker-compose logs postgres

# Логи в реальном времени
docker-compose logs -f postgres

# Логи всех сервисов
docker-compose logs -f
```

## Миграции

Миграции из папки `supabase/migrations/` применяются автоматически при запуске контейнера.

Для ручного применения миграций:

```bash
# Подключиться к контейнеру
docker-compose exec postgres psql -U pasco_user -d pasco_lab_db

# Выполнить SQL скрипт
\i /path/to/migration.sql

# Выйти
\q
```

## Отладка

### Проверить подключение

```bash
# Подключиться к базе из контейнера
docker-compose exec postgres psql -U pasco_user -d pasco_lab_db -c "SELECT 1;"
```

### Просмотреть таблицы

```bash
docker-compose exec postgres psql -U pasco_user -d pasco_lab_db -c "\dt"
```

### Дамп базы данных

```bash
docker-compose exec postgres pg_dump -U pasco_user pasco_lab_db > backup.sql
```

### Восстановление из дампа

```bash
docker-compose exec -T postgres psql -U pasco_user pasco_lab_db < backup.sql
```

## Тиширование

### Запустить все тесты

```bash
npm test
```

### Запустить конкретные тесты

```bash
# Тесты обработки ошибок
npm test error-handler

# Тесты с покрытием
npm test -- --coverage
```

### Watch режим

```bash
npm run test:watch
```

## Переключение между окружениями

| Окружение | Файл | Описание |
|-----------|------|---------|
| Локальная БД | `.env.local` | PostgreSQL на localhost:5432 |
| Supabase Dev | `.env.local` | Облачная база (текущая) |
| Supabase Prod | `.env.production` | Production база (если есть) |

## Проблемы и решения

### Порт 5432 уже используется

```bash
# Найти процесс
lsof -i :5432

# Или в docker-compose.yml изменить порт:
# ports:
#   - "5434:5432"
```

### Permissions denied ошибка

```bash
# Проверить права доступа
sudo chmod 777 docker.sock

# Или запустить с sudo
sudo docker-compose up
```

### Connection refused

```bash
# Убедиться что контейнер запущен
docker-compose ps

# Проверить логи
docker-compose logs postgres

# Перезапустить
docker-compose restart postgres
```

## Полезные команды

```bash
# Состояние
docker-compose ps

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose stop

# Удаление контейнеров
docker-compose rm

# Перестроение образов
docker-compose build --no-cache

# Заново запустить все
docker-compose down && docker-compose up -d
```
