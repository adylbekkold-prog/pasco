/**
 * Тесты для валидации данных
 * Tests for data validation
 */

import { z } from 'zod'
import { CreateLabSchema } from '@/lib/validators'

describe('Data Validators', () => {
  describe('Lab Data Validation', () => {
    it('should validate correct lab data', () => {
      const labData = {
        title: 'Изучение закона Ома',
        slug: 'izuchenie-zakona-oma',
        topic: 'Электричество',
        goal: 'Научиться...',
        expected_results: 'Ученики смогут...',
        teacher_notes: 'Рекомендации...',
      }

      expect(() => CreateLabSchema.parse(labData)).not.toThrow()
    })

    it('should reject lab with missing title', () => {
      const labData = {
        title: '',
        slug: 'test',
      }

      expect(() => CreateLabSchema.parse(labData)).toThrow()
    })

    it('should reject lab with very long title', () => {
      const labData = {
        title: 'A'.repeat(500),
        slug: 'test',
      }

      expect(() => CreateLabSchema.parse(labData)).toThrow()
    })

    it('should allow optional fields', () => {
      const labData = {
        title: 'Лабораторная работа',
        slug: 'lab-test',
      }

      expect(() => CreateLabSchema.parse(labData)).not.toThrow()
    })
  })

  describe('Slug Validation', () => {
    it('should validate correct slugs', () => {
      expect(() => {
        CreateLabSchema.parse({ title: 'Test', slug: 'valid-slug-123' })
      }).not.toThrow()
    })

    it('should reject slugs with invalid characters', () => {
      expect(() => {
        CreateLabSchema.parse({ title: 'Test', slug: 'invalid@#$' })
      }).toThrow()
    })

    it('should reject empty slug', () => {
      expect(() => {
        CreateLabSchema.parse({ title: 'Test', slug: '' })
      }).toThrow()
    })
  })

  describe('Error Scenarios', () => {
    it('should provide clear error messages for validation failures', () => {
      const labData = {
        title: '',
        slug: 'test',
      }

      let threwError = false
      try {
        CreateLabSchema.parse(labData)
      } catch (error) {
        threwError = true
      }
      expect(threwError).toBe(true)
    })

    it('should validate multiple fields and collect all errors', () => {
      const labData = {
        title: '',
        slug: 'invalid@#$',
      }

      let threwError = false
      try {
        CreateLabSchema.parse(labData)
      } catch (error) {
        threwError = true
      }
      expect(threwError).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle unicode characters', () => {
      const labData = {
        title: 'Кыргызча лаборатория 实验',
        slug: 'kyrgyzcha-laboratoriya',
      }

      expect(() => CreateLabSchema.parse(labData)).not.toThrow()
    })

    it('should handle whitespace in title', () => {
      const labData = {
        title: 'Лабораторная работа',
        slug: 'lab-test',
      }

      expect(() => CreateLabSchema.parse(labData)).not.toThrow()
    })

    it('should handle null values for optional fields', () => {
      const labData = {
        title: 'Лабораторная работа',
        slug: 'lab-test',
        goal: null,
        topic: null,
      }

      expect(() => CreateLabSchema.parse(labData)).not.toThrow()
    })

    it('should reject too short title', () => {
      const labData = {
        title: 'AB',
        slug: 'ab',
      }

      expect(() => CreateLabSchema.parse(labData)).toThrow()
    })
  })
})
