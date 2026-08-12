/**
 * Тесты для Logger (lib/logger.ts)
 */

import { logger } from '@/lib/logger'

describe('Logger', () => {
  beforeEach(() => {
    logger.clearLogs()
    jest.clearAllMocks()
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('debug', () => {
    it('should log debug messages', () => {
      logger.debug('Debug message', { key: 'value' })

      const logs = logger.getLogs()
      expect(logs.length).toBe(1)
      expect(logs[0].level).toBe('debug')
      expect(logs[0].message).toBe('Debug message')
      expect(logs[0].context).toEqual({ key: 'value' })
    })

    it('should add timestamp to debug log', () => {
      logger.debug('Test')

      const logs = logger.getLogs()
      expect(logs[0].timestamp).toBeDefined()
      expect(new Date(logs[0].timestamp)).toBeInstanceOf(Date)
    })
  })

  describe('info', () => {
    it('should log info messages', () => {
      logger.info('Info message')

      const logs = logger.getLogs()
      expect(logs.length).toBe(1)
      expect(logs[0].level).toBe('info')
      expect(logs[0].message).toBe('Info message')
    })

    it('should log info with context', () => {
      logger.info('User logged in', { userId: '123', username: 'john' })

      const logs = logger.getLogs()
      expect(logs[0].context).toEqual({ userId: '123', username: 'john' })
    })
  })

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('Warning: deprecated function', { deprecated: true })

      const logs = logger.getLogs()
      expect(logs.length).toBe(1)
      expect(logs[0].level).toBe('warn')
      expect(logs[0].message).toBe('Warning: deprecated function')
    })
  })

  describe('error', () => {
    it('should log error with Error object', () => {
      const error = new Error('Test error')
      logger.error('An error occurred', error)

      const logs = logger.getLogs()
      expect(logs.length).toBe(1)
      expect(logs[0].level).toBe('error')
      expect(logs[0].message).toBe('An error occurred')
      expect(logs[0].error).toBeDefined()
      expect(logs[0].error?.message).toBe('Test error')
    })

    it('should log error with context', () => {
      const error = new Error('Database error')
      logger.error('Failed to save', error, { table: 'users' })

      const logs = logger.getLogs()
      expect(logs[0].context).toEqual({ table: 'users' })
    })

    it('should capture error stack trace', () => {
      const error = new Error('Stack trace error')
      logger.error('Error with stack', error)

      const logs = logger.getLogs()
      expect(logs[0].error?.stack).toBeDefined()
      expect(logs[0].error?.stack).toContain('Stack trace error')
    })
  })

  describe('Log Management', () => {
    it('should limit stored logs to maxLogs', () => {
      // Log more than 100 messages (default maxLogs)
      for (let i = 0; i < 150; i++) {
        logger.info(`Message ${i}`)
      }

      const logs = logger.getLogs()
      expect(logs.length).toBeLessThanOrEqual(100)
    })

    it('should remove oldest logs when exceeding limit', () => {
      for (let i = 0; i < 110; i++) {
        logger.info(`Message ${i}`)
      }

      const logs = logger.getLogs()
      // First message should be removed, new ones should be present
      const firstLogMessage = logs[0].message
      expect(firstLogMessage).not.toBe('Message 0')
    })

    it('should clear logs', () => {
      logger.info('First message')
      logger.error('Second message', new Error('test'))
      logger.warn('Third message')

      expect(logger.getLogs().length).toBe(3)

      logger.clearLogs()

      expect(logger.getLogs().length).toBe(0)
    })

    it('should return all stored logs', () => {
      logger.debug('Debug')
      logger.info('Info')
      logger.warn('Warn')
      logger.error('Error', new Error('test'))

      const logs = logger.getLogs()
      const levels = logs.map((l) => l.level)

      expect(levels).toEqual(['debug', 'info', 'warn', 'error'])
    })
  })

  describe('Console Output (Development)', () => {
    it('should output to console in development mode', () => {
      const mutableEnv = process.env as Record<string, string | undefined>
      const originalEnv = mutableEnv.NODE_ENV
      mutableEnv.NODE_ENV = 'development'

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      logger.debug('Dev message', { test: true })

      expect(consoleSpy).toHaveBeenCalled()
      expect(consoleSpy.mock.calls[0][0]).toContain('DEBUG')

      mutableEnv.NODE_ENV = originalEnv
      consoleSpy.mockRestore()
    })

    it('should not output to console in production mode', () => {
      const mutableEnv = process.env as Record<string, string | undefined>
      const originalEnv = mutableEnv.NODE_ENV
      mutableEnv.NODE_ENV = 'production'

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      logger.info('Prod message')

      expect(consoleSpy).not.toHaveBeenCalled()

      mutableEnv.NODE_ENV = originalEnv
      consoleSpy.mockRestore()
    })

    it('should use console.error for error logs', () => {
      const mutableEnv = process.env as Record<string, string | undefined>
      const originalEnv = mutableEnv.NODE_ENV
      mutableEnv.NODE_ENV = 'development'

      const errorSpy = jest.spyOn(console, 'error').mockImplementation()

      const error = new Error('Test error')
      logger.error('Critical error', error)

      expect(errorSpy).toHaveBeenCalled()

      mutableEnv.NODE_ENV = originalEnv
      errorSpy.mockRestore()
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing context', () => {
      logger.info('Message without context')

      const logs = logger.getLogs()
      expect(logs[0].context).toBeUndefined()
    })

    it('should handle null context', () => {
      logger.info('Message', undefined)

      const logs = logger.getLogs()
      expect(logs[0].context).toBeUndefined()
    })

    it('should handle error without stack trace', () => {
      const error = new Error('No stack')
      error.stack = undefined

      logger.error('Error without stack', error)

      const logs = logger.getLogs()
      expect(logs[0].error).toBeDefined()
    })

    it('should preserve special characters in messages', () => {
      logger.info('Message: 日本語 🚀 !@#$%', { special: 'мир' })

      const logs = logger.getLogs()
      expect(logs[0].message).toContain('日本語')
      expect(logs[0].message).toContain('🚀')
      expect(logs[0].context?.special).toBe('мир')
    })
  })
})
