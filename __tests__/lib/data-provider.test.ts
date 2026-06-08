import {
  getDataProvider,
  shouldTrySupabaseData,
  shouldMirrorLocalData,
  isLocalOnlyMode,
} from '@/lib/data-provider'

describe('Data Provider', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('getDataProvider', () => {
    it('should return local as default', () => {
      delete process.env.NEXT_PUBLIC_DATA_PROVIDER
      delete process.env.DATA_PROVIDER
      
      const provider = getDataProvider()
      expect(provider).toBe('local')
    })

    it('should use NEXT_PUBLIC_DATA_PROVIDER if set', () => {
      process.env.NEXT_PUBLIC_DATA_PROVIDER = 'supabase'
      delete process.env.DATA_PROVIDER
      
      const provider = getDataProvider()
      expect(provider).toBe('supabase')
    })

    it('should prefer NEXT_PUBLIC_DATA_PROVIDER over DATA_PROVIDER', () => {
      process.env.NEXT_PUBLIC_DATA_PROVIDER = 'hybrid'
      process.env.DATA_PROVIDER = 'local'
      
      const provider = getDataProvider()
      expect(provider).toBe('hybrid')
    })

    it('should handle whitespace in env variable', () => {
      process.env.DATA_PROVIDER = '  local  '
      
      const provider = getDataProvider()
      expect(provider).toBe('local')
    })

    it('should handle invalid provider value', () => {
      process.env.DATA_PROVIDER = 'invalid-provider'
      
      const provider = getDataProvider()
      expect(provider).toBe('local')
    })
  })

  describe('shouldTrySupabaseData', () => {
    it('should return true for supabase mode', () => {
      expect(shouldTrySupabaseData('supabase')).toBe(true)
    })

    it('should return true for hybrid mode', () => {
      expect(shouldTrySupabaseData('hybrid')).toBe(true)
    })

    it('should return false for local mode', () => {
      expect(shouldTrySupabaseData('local')).toBe(false)
    })
  })

  describe('shouldMirrorLocalData', () => {
    it('should return true for hybrid mode', () => {
      expect(shouldMirrorLocalData('hybrid')).toBe(true)
    })

    it('should return true for local mode', () => {
      expect(shouldMirrorLocalData('local')).toBe(true)
    })

    it('should return false for supabase mode', () => {
      expect(shouldMirrorLocalData('supabase')).toBe(false)
    })
  })

  describe('isLocalOnlyMode', () => {
    it('should return true for local mode', () => {
      expect(isLocalOnlyMode('local')).toBe(true)
    })

    it('should return false for hybrid mode', () => {
      expect(isLocalOnlyMode('hybrid')).toBe(false)
    })

    it('should return false for supabase mode', () => {
      expect(isLocalOnlyMode('supabase')).toBe(false)
    })
  })
})
