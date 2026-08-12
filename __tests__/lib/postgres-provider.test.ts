import { getDataProvider, isLocalOnlyMode, shouldMirrorLocalData, shouldTrySupabaseData } from '@/lib/data-provider'

describe('postgres data provider', () => {
  const originalProvider = process.env.NEXT_PUBLIC_DATA_PROVIDER

  afterEach(() => {
    if (originalProvider === undefined) {
      delete process.env.NEXT_PUBLIC_DATA_PROVIDER
    } else {
      process.env.NEXT_PUBLIC_DATA_PROVIDER = originalProvider
    }
  })

  it('recognizes the explicit postgresql provider', () => {
    process.env.NEXT_PUBLIC_DATA_PROVIDER = 'postgresql'

    expect(getDataProvider()).toBe('postgresql')
    expect(shouldTrySupabaseData()).toBe(false)
    expect(shouldMirrorLocalData()).toBe(true)
    expect(isLocalOnlyMode()).toBe(false)
  })
})
