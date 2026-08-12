# PostgreSQL на VPS для PASCO Lab Portal

## Как будет работать база

В production нужно включить режим:

```env
DATA_PROVIDER=postgresql
NEXT_PUBLIC_DATA_PROVIDER=postgresql
DATABASE_URL=postgresql://pasco_user:STRONG_PASSWORD@127.0.0.1:5432/pasco_lab
DATABASE_SSL=disable
DATABASE_POOL_MAX=20
ADMIN_PASSWORD=VERY_STRONG_ADMIN_PASSWORD
ADMIN_SESSION_SECRET=VERY_LONG_RANDOM_SESSION_SECRET
```

После этого:

- каталог лабораторий, предметы, классы, ресурсы, шаги и PASCO-комплекты читаются из PostgreSQL;
- школы, группы, учителя школьного портала, тесты, доступы к тестам, попытки учеников, оценки и активности тоже хранятся в PostgreSQL;
- загруженные файлы (`pdf`, `mp4`, `.spklab`) остаются на диске VPS в `public/uploads`, а в PostgreSQL хранится путь к файлу;
- SPARKvue остаётся статической offline-папкой `sparkvue-pwa`, база ему не нужна.

## Установка PostgreSQL на Ubuntu VPS

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib postgresql-client
sudo systemctl enable --now postgresql
```

## Создание базы и пользователя

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE pasco_lab;
CREATE USER pasco_user WITH PASSWORD 'STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE pasco_lab TO pasco_user;
\c pasco_lab
GRANT ALL ON SCHEMA public TO pasco_user;
\q
```

## Применение схемы

Из корня проекта на VPS:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/sql/2026-07-09_postgresql_schema.sql
```

## Проверка подключения

```bash
psql "$DATABASE_URL" -c "select count(*) from labs;"
psql "$DATABASE_URL" -c "select count(*) from school_portal_schools;"
```

Первый запуск школьного портала автоматически засеет список школ и группы, если таблицы пустые.

## Важно про авторизацию

Сейчас PostgreSQL отвечает за данные. Админка защищена отдельным паролем через `ADMIN_PASSWORD` и открывается только по `/sersdp`. Supabase в проекте пока остаётся для учительского кабинета, если включён не локальный режим. Если нужно полностью убрать Supabase, следующим шагом надо сделать отдельную авторизацию на PostgreSQL: таблицы `users`, пароли через `bcrypt/argon2`, сессии в httpOnly-cookie.

## Админка `/sersdp`

Админская панель скрыта с публичного `/admin` и открывается только через `/sersdp`.
Для входа обязательно задайте `ADMIN_PASSWORD`; сессия хранится в подписанной `httpOnly` cookie.
`ADMIN_SESSION_SECRET` должен быть длинной случайной строкой и не должен совпадать с паролем.
