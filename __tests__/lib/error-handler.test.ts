/**
 * Тесты для Error Handler (lib/error-handler.ts)
 */

import { ZodError, z } from 'zod'
import {
  handleServerActionError,
  ValidationError,
  DatabaseError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  formatZodErrors,
} from '@/lib/error-handler'
import { logger } from '@/lib/logger'

describe('Error Handler', () => {
  beforeEach(() => {
    logger.clearLogs()
  })

  afterEach(() => {
    logger.clearLogs()
  })

  describe('formatZodErrors', () => {
    it('should format single field error', () => {
      const schema = z.object({ email: z.string().email() })
      let zodError: ZodError | null = null

      try {
        schema.parse({ email: 'invalid' })
      } catch (e) {
        zodError = e as ZodError
      }

      expect(zodError).toBeDefined()
      const formatted = formatZodErrors(zodError!)
      expect(formatted.email).toBeDefined()
      expect(Array.isArray(formatted.email)).toBe(true)
    })

    it('should format multiple field errors', () => {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
      })
      let zodError: ZodError | null = null

      try {
        schema.parse({ email: 'invalid', password: 'short' })
      } catch (e) {
        zodError = e as ZodError
      }

      expect(zodError).toBeDefined()
      const formatted = formatZodErrors(zodError!)
      expect(Object.keys(formatted).length).toBeGreaterThan(0)
    })
  })

  describe('Custom Error Classes', () => {
    it('should create ValidationError with field errors', () => {
      const fieldErrors = { email: ['Invalid email'] }
      const error = new ValidationError(fieldErrors, 'Validation failed')

      expect(error.name).toBe('ValidationError')
      expect(error.fieldErrors).toEqual(fieldErrors)
      expect(error.message).toBe('Validation failed')
    })

    it('should create DatabaseError with original error', () => {
      const originalError = new Error('Connection timeout')
      const error = new DatabaseError('Failed to save data', originalError)

      expect(error.name).toBe('DatabaseError')
      expect(error.originalError).toBe(originalError)
      expect(error.message).toBe('Failed to save data')
    })

    it('should create AuthenticationError', () => {
      const error = new AuthenticationError('Please login')

      expect(error.name).toBe('AuthenticationError')
      expect(error.message).toBe('Please login')
    })

    it('should create AuthorizationError', () => {
      const error = new AuthorizationError('You do not have permission')

      expect(error.name).toBe('AuthorizationError')
      expect(error.message).toBe('You do not have permission')
    })

    it('should create NotFoundError', () => {
      const error = new NotFoundError('Lab', 'lab-123')

      expect(error.name).toBe('NotFoundError')
      expect(error.resource).toBe('Lab')
      expect(error.id).toBe('lab-123')
      expect(error.message).toContain('Lab not found')
    })
  })

  describe('handleServerActionError', () => {
    it('should handle ValidationError', async () => {
      const fieldErrors = { title: ['Title is required'] }
      const error = new ValidationError(fieldErrors)

      const result = await handleServerActionError(error, 'createLab')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Validation failed')
      expect(result.errors).toEqual(fieldErrors)
    })

    it('should handle ZodError', async () => {
      const schema = z.object({ email: z.string().email() })
      let zodError: ZodError | null = null

      try {
        schema.parse({ email: 'invalid' })
      } catch (e) {
        zodError = e as ZodError
      }

      expect(zodError).toBeDefined()
      const result = await handleServerActionError(zodError!, 'validateInput')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Validation failed')
      expect(result.errors).toBeDefined()
    })

    it('should handle AuthenticationError', async () => {
      const error = new AuthenticationError('Please login first')

      const result = await handleServerActionError(error, 'updateLab')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Please login first')
    })

    it('should handle AuthorizationError', async () => {
      const error = new AuthorizationError('Insufficient permissions')

      const result = await handleServerActionError(error, 'deleteLab')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Insufficient permissions')
    })

    it('should handle NotFoundError', async () => {
      const error = new NotFoundError('Lab', 'lab-456')

      const result = await handleServerActionError(error, 'getLab')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Lab not found')
    })

    it('should handle DatabaseError', async () => {
      const originalError = new Error('Connection failed')
      const error = new DatabaseError('Failed to connect', originalError)

      const result = await handleServerActionError(error, 'saveData')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database operation failed')
    })

    it('should not throw exceptions', async () => {
      const error = new Error('Critical error')

      expect(async () => {
        await handleServerActionError(error, 'test')
      }).not.toThrow()

      const result = await handleServerActionError(error, 'test')
      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('error')
    })
  })
})
