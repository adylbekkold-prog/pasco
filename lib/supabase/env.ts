const PLACEHOLDER_VALUES = new Set([
  '',
  'your-supabase-url',
  'your-anon-key',
  'your-service-role-key',
])

function normalize(value: string | undefined) {
  return value?.trim() ?? ''
}

export function hasSupabasePublicEnv() {
  const url = normalize(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const anonKey = normalize(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (!url || !anonKey) return false
  if (PLACEHOLDER_VALUES.has(url) || PLACEHOLDER_VALUES.has(anonKey)) return false

  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}

export function getSupabasePublicEnvIssue() {
  if (hasSupabasePublicEnv()) return null

  return 'Каталог работает без базы данных. Проверьте `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY` в `.env.local`.'
}
