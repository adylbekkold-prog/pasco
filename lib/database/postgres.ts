import { Pool } from 'pg'

let pool: Pool | null = null

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

export function getPostgresPool() {
  if (!hasPostgresEnv()) {
    throw new Error('DATABASE_URL is not configured')
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: getPostgresSslConfig(),
      max: getPoolMax(),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    })
  }

  return pool
}

export async function queryPostgres<T extends Record<string, unknown> = Record<string, unknown>>(text: string, params: unknown[] = []) {
  const client = await getPostgresPool().connect()

  try {
    const result = await client.query<T>(text, params)
    return result.rows
  } finally {
    client.release()
  }
}
