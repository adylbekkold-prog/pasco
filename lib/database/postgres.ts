import { Pool } from 'pg'
import type { Locale } from '@/types'

// Отдельные пулы для каждой языковой базы данных.
// Русская версия -> pasco_lab_ru, Кыргызская версия -> pasco_lab_ky.
const pools: Record<Locale, Pool | null> = { ru: null, ky: null }

function normalize(value: string | undefined) {
  return value?.trim() ?? ''
}

function getPostgresSslConfig() {
  const sslMode = normalize(process.env.DATABASE_SSL).toLowerCase()

  if (sslMode === 'true' || sslMode === 'require') {
    return {
      rejectUnauthorized: normalize(process.env.DATABASE_SSL_REJECT_UNAUTHORIZED).toLowerCase() !== 'false',
    }
  }

  if (sslMode === 'false' || sslMode === 'disable') {
    return false
  }

  return normalize(process.env.DATABASE_URL).includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false
}

function getPoolMax() {
  const value = Number.parseInt(normalize(process.env.DATABASE_POOL_MAX), 10)
  return Number.isFinite(value) && value > 0 ? value : 20
}

export function hasPostgresEnv() {
  return Boolean(normalize(process.env.DATABASE_URL))
}

/**
 * Возвращает имя базы данных для указанной локали.
 * Русская версия -> pasco_lab_ru, Кыргызская версия -> pasco_lab_ky.
 */
export function getDatabaseName(locale: Locale): string {
  return locale === 'ky' ? 'pasco_lab_ky' : 'pasco_lab_ru'
}

/**
 * Строит connection string для указанной локали, заменяя имя базы данных
 * в DATABASE_URL на соответствующее (pasco_lab_ru / pasco_lab_ky).
 */
function getConnectionString(locale: Locale): string {
  const base = normalize(process.env.DATABASE_URL)
  const dbName = getDatabaseName(locale)
  // Заменяем последний сегмент пути (имя базы) на нужное.
  return base.replace(/\/[^/]*$/, `/${dbName}`)
}

export function getPostgresPool(locale: Locale = 'ru') {
  if (!hasPostgresEnv()) {
    throw new Error('DATABASE_URL is not configured')
  }

  if (!pools[locale]) {
    pools[locale] = new Pool({
      connectionString: getConnectionString(locale),
      ssl: getPostgresSslConfig(),
      max: getPoolMax(),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    })
  }

  return pools[locale]
}

export async function queryPostgres<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
  locale: Locale = 'ru'
) {
  const client = await getPostgresPool(locale).connect()

  try {
    const result = await client.query<T>(text, params)
    return result.rows
  } finally {
    client.release()
  }
}
