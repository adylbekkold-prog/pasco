/**
 * Тесты для Monitoring (lib/monitoring.ts)
 */

import { monitor } from '@/lib/monitoring'
import { logger } from '@/lib/logger'

describe('Monitor', () => {
  beforeEach(() => {
    logger.clearLogs()
  })

  afterEach(() => {
    logger.clearLogs()
  })

  describe('init', () => {
    it('should initialize monitor with config', () => {
      monitor.init({
        enableRemoteTracking: false,
        environment: 'test',
      })

      expect(monitor.isRemoteTrackingEnabled()).toBe(false)
    })

    it('should initialize with default config', () => {
      monitor.init({})
      expect(monitor.isRemoteTrackingEnabled()).toBeDefined()
    })
  })

  describe('captureException', () => {
    it('should log captured exceptions', () => {
      const error = new Error('Test exception')
      monitor.captureException(error)

      const logs = logger.getLogs()
      expect(logs.length).toBeGreaterThan(0)
      expect(logs[0].level).toBe('error')
    })

    it('should include context with exception', () => {
      const error = new Error('Database error')
      const context = { table: 'users' }

      monitor.captureException(error, context)

      const logs = logger.getLogs()
      expect(logs.length).toBeGreaterThan(0)
    })

    it('should not throw when capturing exception', () => {
      const error = new Error('Critical error')

      expect(() => {
        monitor.captureException(error)
      }).not.toThrow()
    })
  })

  describe('captureMessage', () => {
    it('should capture info messages', () => {
      monitor.captureMessage('Test message', 'info')

      const logs = logger.getLogs()
      expect(logs.length).toBeGreaterThan(0)
      expect(logs[0].level).toBe('info')
    })

    it('should capture warning messages', () => {
      monitor.captureMessage('Warning', 'warning')

      const logs = logger.getLogs()
      expect(logs.length).toBeGreaterThan(0)
      expect(logs[0].level).toBe('warn')
    })

    it('should capture error messages', () => {
      monitor.captureMessage('Error', 'error')

      const logs = logger.getLogs()
      expect(logs.length).toBeGreaterThan(0)
      expect(logs[0].level).toBe('error')
    })

    it('should default to info level', () => {
      monitor.captureMessage('Default message')

      const logs = logger.getLogs()
      expect(logs.length).toBeGreaterThan(0)
      expect(logs[0].level).toBe('info')
    })
  })

  describe('recordMetric', () => {
    it('should record metrics', () => {
      monitor.recordMetric('response_time', 150)

      const logs = logger.getLogs()
      expect(logs.length).toBeGreaterThan(0)
      expect(logs[0].level).toBe('debug')
    })

    it('should record metrics with tags', () => {
      monitor.recordMetric('requests', 100, { service: 'api' })

      const logs = logger.getLogs()
      expect(logs.length).toBeGreaterThan(0)
    })
  })

  describe('recordTiming', () => {
    it('should record timing', () => {
      monitor.recordTiming('db_query', 245)

      const logs = logger.getLogs()
      expect(logs.length).toBeGreaterThan(0)
      expect(logs[0].level).toBe('debug')
    })

    it('should record timing with tags', () => {
      monitor.recordTiming('api_call', 150, { endpoint: '/labs' })

      const logs = logger.getLogs()
      expect(logs.length).toBeGreaterThan(0)
    })
  })

  describe('isRemoteTrackingEnabled', () => {
    it('should return remote tracking status', () => {
      monitor.init({ enableRemoteTracking: true })
      expect(monitor.isRemoteTrackingEnabled()).toBe(true)

      monitor.init({ enableRemoteTracking: false })
      expect(monitor.isRemoteTrackingEnabled()).toBe(false)
    })
  })

  describe('Integration', () => {
    it('should handle multiple calls', () => {
      for (let i = 0; i < 5; i++) {
        monitor.captureMessage(`Message ${i}`)
        monitor.recordMetric(`metric_${i}`, i)
      }

      const logs = logger.getLogs()
      expect(logs.length).toBeGreaterThan(0)
    })
  })
})
