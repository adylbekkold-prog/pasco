import { getAlternateLocale, resolveLocale } from '@/lib/locale'

describe('Locale utilities', () => {
  describe('resolveLocale', () => {
    it('should return ru for ru input', () => {
      expect(resolveLocale('ru')).toBe('ru')
    })

    it('should return ky for ky input', () => {
      expect(resolveLocale('ky')).toBe('ky')
    })

    it('should return ky as default for invalid locale', () => {
      expect(resolveLocale('en')).toBe('ky')
      expect(resolveLocale('unknown')).toBe('ky')
    })

    it('should handle undefined as default', () => {
      expect(resolveLocale(undefined)).toBe('ky')
    })

    it('should handle null as default', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(resolveLocale(null as any)).toBe('ky')
    })
  })

  describe('getAlternateLocale', () => {
    it('should return ky as alternate for ru', () => {
      expect(getAlternateLocale('ru')).toBe('ky')
    })

    it('should return ru as alternate for ky', () => {
      expect(getAlternateLocale('ky')).toBe('ru')
    })

    it('should return ky as default alternate', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(getAlternateLocale('en' as any)).toBe('ky')
    })
  })
})
