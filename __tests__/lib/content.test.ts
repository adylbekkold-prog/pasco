import { pluralizeLabs } from '@/lib/content'

describe('Content helpers', () => {
  describe('pluralizeLabs', () => {
    it('uses Kyrgyz wording for singular and plural lab counts', () => {
      expect(pluralizeLabs(1, 'ky')).toBe('1 лабораториялык иш')
      expect(pluralizeLabs(2, 'ky')).toBe('2 лабораториялык иштер')
      expect(pluralizeLabs(5, 'ky')).toBe('5 лабораториялык иштер')
    })

    it('keeps Russian pluralization intact', () => {
      expect(pluralizeLabs(1, 'ru')).toBe('1 лаборатория')
      expect(pluralizeLabs(2, 'ru')).toBe('2 лаборатории')
      expect(pluralizeLabs(5, 'ru')).toBe('5 лабораторий')
    })
  })
})
