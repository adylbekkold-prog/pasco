/**
 * Структурированное логирование
 * Используется для отслеживания ошибок и событий в приложении
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
  error?: Error
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 100

  private createEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    }
  }

  private log(entry: LogEntry) {
    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Также вывести в console основываясь на окружении
    const isDev = process.env.NODE_ENV === 'development'

    if (isDev) {
      if (entry.error) {
        console.error(
          `[${entry.level.toUpperCase()}] ${entry.message}`,
          entry.context,
          entry.error
        )
      } else {
        console.log(
          `[${entry.level.toUpperCase()}] ${entry.message}`,
          entry.context
        )
      }
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log(this.createEntry('debug', message, context))
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log(this.createEntry('info', message, context))
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log(this.createEntry('warn', message, context))
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    this.log(this.createEntry('error', message, context, error))
  }

  getLogs() {
    return this.logs
  }

  clearLogs() {
    this.logs = []
  }
}

export const logger = new Logger()
