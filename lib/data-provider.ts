import { hasSupabasePublicEnv } from './supabase/env'

export type DataProvider = 'supabase' | 'hybrid' | 'local' | 'postgresql'

const VALID_PROVIDERS = new Set<DataProvider>(['supabase', 'hybrid', 'local', 'postgresql'])

function hasPostgresEnv() {
  return Boolean(process.env.DATABASE_URL)
}

export function getDataProvider(): DataProvider {
  const provider = (
    process.env.NEXT_PUBLIC_DATA_PROVIDER ??
    process.env.DATA_PROVIDER
  )
    ?.trim()
    .toLowerCase() as DataProvider | undefined

  if (provider && VALID_PROVIDERS.has(provider)) {
    return provider
  }

  // По умолчанию используем PostgreSQL, если он настроен.
  // Supabase остаётся как запасной вариант (hybrid), только если
  // PostgreSQL не настроен, но есть Supabase-ключи.
  if (hasPostgresEnv()) {
    return 'postgresql'
  }

  return hasSupabasePublicEnv() ? 'hybrid' : 'local'
}


export function shouldTrySupabaseData(provider = getDataProvider()) {
  return provider === 'supabase' || provider === 'hybrid'
}

export function shouldMirrorLocalData(provider = getDataProvider()) {
  return provider === 'hybrid' || provider === 'local' || provider === 'postgresql'
}

export function isLocalOnlyMode(provider = getDataProvider()) {
  return provider === 'local'
}
