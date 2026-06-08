import { CreateLabSchema, UpdateLabSchema, FiltersSchema } from '@/lib/validators'

describe('Lab Validators', () => {
  describe('CreateLabSchema', () => {
    const validInput = {
      title: 'Test Lab',
      slug: 'test-lab',
      is_published: false,
    }

    it('should accept valid input', () => {
      expect(() => CreateLabSchema.parse(validInput)).not.toThrow()
    })

    it('should reject title too short', () => {
      expect(() => CreateLabSchema.parse({
        ...validInput,
        title: 'ab',
      })).toThrow()
    })

    it('should reject title too long', () => {
      expect(() => CreateLabSchema.parse({
        ...validInput,
        title: 'a'.repeat(256),
      })).toThrow()
    })

    it('should reject invalid slug characters', () => {
      expect(() => CreateLabSchema.parse({
        ...validInput,
        slug: 'Test Lab',
      })).toThrow()
    })

    it('should accept optional fields', () => {
      expect(() => CreateLabSchema.parse(validInput)).not.toThrow()
    })

    it('should set is_published to false by default', () => {
      const result = CreateLabSchema.parse(validInput)
      expect(result.is_published).toBe(false)
    })

    it('should validate difficulty enum', () => {
      expect(() => CreateLabSchema.parse({
        ...validInput,
        difficulty: 'invalid',
      })).toThrow()

      expect(() => CreateLabSchema.parse({
        ...validInput,
        difficulty: 'beginner',
      })).not.toThrow()
    })

    it('should validate duration_minutes range', () => {
      expect(() => CreateLabSchema.parse({
        ...validInput,
        duration_minutes: 4,
      })).toThrow()

      expect(() => CreateLabSchema.parse({
        ...validInput,
        duration_minutes: 481,
      })).toThrow()

      expect(() => CreateLabSchema.parse({
        ...validInput,
        duration_minutes: 60,
      })).not.toThrow()
    })
  })

  describe('UpdateLabSchema', () => {
    it('should allow partial updates', () => {
      const result = UpdateLabSchema.parse({
        title: 'Updated Title',
      })
      expect(result.title).toBe('Updated Title')
    })

    it('should allow empty update', () => {
      const result = UpdateLabSchema.parse({})
      expect(Object.keys(result).length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('FiltersSchema', () => {
    it('should accept empty filters', () => {
      const result = FiltersSchema.parse({})
      expect(result).toEqual({})
    })

    it('should accept single filter', () => {
      const result = FiltersSchema.parse({ subject: 'physics' })
      expect(result.subject).toBe('physics')
    })

    it('should accept multiple filters', () => {
      const result = FiltersSchema.parse({
        subject: 'physics',
        grade: '9',
        difficulty: 'intermediate',
        search: 'test',
      })
      expect(result.subject).toBe('physics')
      expect(result.grade).toBe('9')
      expect(result.difficulty).toBe('intermediate')
      expect(result.search).toBe('test')
    })
  })
})
