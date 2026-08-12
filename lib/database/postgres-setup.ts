import { readFileSync } from 'node:fs'
import path from 'node:path'
import { getPostgresPool } from './postgres'

export async function initializePostgresSchema() {
  const pool = getPostgresPool()
  const client = await pool.connect()

  try {
    const schemaPath = path.join(process.cwd(), 'supabase', 'sql', '2026-07-09_postgresql_schema.sql')
    const schemaSql = readFileSync(schemaPath, 'utf8')
    await client.query(schemaSql)
  } finally {
    client.release()
  }
}
