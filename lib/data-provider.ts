export type DataProvider = 'supabase' | 'hybrid' | 'local'

const VALID_PROVIDERS = new Set<DataProvider>(['supabase', 'hybrid', 'local'])

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

  return 'local'
}

export function shouldTrySupabaseData(provider = getDataProvider()) {
  return provider !== 'local'
}

export function shouldMirrorLocalData(provider = getDataProvider()) {
  return provider !== 'supabase'
}

export function isLocalOnlyMode(provider = getDataProvider()) {
  return provider === 'local'
}
