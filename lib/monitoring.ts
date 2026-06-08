/**
 * Мониторинг и отслеживание ошибок
 * Готово к интеграции с Sentry в будущем
 */

import { logger } from './logger'

interface MonitoringConfig {
  enableRemoteTracking: boolean
  sentryDsn?: string
  environment: string
}

class Monitor {
  private config: MonitoringConfig = {
    enableRemoteTracking: false,
    sentryDsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
  }

  init(config: Partial<MonitoringConfig>) {
    this.config = { ...this.config, ...config }

    if (this.config.enableRemoteTracking && this.config.sentryDsn) {
      logger.info('Monitoring initialized with remote tracking', {
        env: this.config.environment,
      })
    }
  }

  captureException(error: Error, context?: Record<string, unknown>) {
    logger.error(`Captured exception: ${error.message}`, error, context)

    // В будущем отправить в Sentry
    if (this.config.enableRemoteTracking && this.config.sentryDsn) {
      // Sentry.captureException(error, { extra: context })
      console.warn('Remote error tracking not configured yet')
    }
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    logger[level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'info'](
      message
    )

    // В будущем отправить в Sentry
    if (this.config.enableRemoteTracking && this.config.sentryDsn) {
      // Sentry.captureMessage(message, level)
    }
  }

  recordMetric(name: string, value: number, tags?: Record<string, string>) {
    logger.debug(`Metric recorded: ${name}`, { value, tags })

    // В будущем отправить метрики в мониторинг сервис
  }

  recordTiming(name: string, duration: number, tags?: Record<string, string>) {
    logger.debug(`Timing recorded: ${name}`, { duration, tags })

    // В будущем отправить в сервис мониторинга
  }

  isRemoteTrackingEnabled() {
    return this.config.enableRemoteTracking
  }
}

export const monitor = new Monitor()

// Initialize с config из окружения
monitor.init({
  enableRemoteTracking:
    process.env.SENTRY_DSN !== undefined &&
    process.env.NODE_ENV === 'production',
  environment: process.env.NODE_ENV || 'development',
})
