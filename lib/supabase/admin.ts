import 'server-only'

import { createClient } from '@supabase/supabase-js'

const PLACEHOLDER_VALUES = new Set([
  '',
  'your-supabase-url',
  'your-anon-key',
  'your-service-key',
  'your-service-role-key',
])

function normalize(value: string | undefined) {
  return value?.trim() ?? ''
}

function getServiceKey() {
  return normalize(process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY)
}

export function hasSupabaseAdminEnv() {
  const url = normalize(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const serviceKey = getServiceKey()

  if (!url || !serviceKey) return false
  if (PLACEHOLDER_VALUES.has(url) || PLACEHOLDER_VALUES.has(serviceKey)) return false

  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}

export function getSupabaseAdminEnvIssue() {
  if (hasSupabaseAdminEnv()) return null

  return 'Для двусторонней синхронизации укажите `NEXT_PUBLIC_SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY` или `SUPABASE_SERVICE_KEY`.'
}

export function createAdminClient() {
  const url = normalize(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const serviceKey = getServiceKey()

  if (!hasSupabaseAdminEnv()) {
    throw new Error(getSupabaseAdminEnvIssue() ?? 'Supabase admin env is not configured.')
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
