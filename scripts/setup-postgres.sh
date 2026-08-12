#!/usr/bin/env bash
set -euo pipefail

if ! command -v docker >/dev/null 2>&1; then
  echo 'Docker not found'
  exit 1
fi

docker compose up -d postgres
sleep 5

docker compose exec -T postgres psql -U pasco_user -d pasco_lab_db -f /docker-entrypoint-initdb.d/2026-07-09_postgresql_schema.sql

docker compose exec -T postgres psql -U pasco_user -d pasco_lab_db -f /docker-entrypoint-initdb.d/2026-07-09_postgresql_schema.sql

docker compose exec -T postgres psql -U pasco_user -d pasco_lab_db -f /docker-entrypoint-initdb.d/../sql/2026-07-09_postgresql_schema.sql
