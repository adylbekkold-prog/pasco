/**
 * Утилиты для обработки ошибок в Server Actions и API
 */

import { ZodError } from 'zod'
import { logger } from './logger'
import { monitor } from './monitoring'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  errors?: Record<string, string[]>
}

export class ValidationError extends Error {
  constructor(
    public fieldErrors: Record<string, string[]>,
    message = 'Validation failed'
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Permission denied') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends Error {
  constructor(
    public resource: string,
    public id?: string
  ) {
    super(`${resource} not found${id ? ` (${id})` : ''}`)
    this.name = 'NotFoundError'
  }
}

/**
 * Преобразует Zod ошибки в удобный формат
 */
export function formatZodErrors(error: ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {}

  for (const issue of error.issues) {
    const path = issue.path.join('.')
    if (!errors[path]) {
      errors[path] = []
    }
    errors[path].push(issue.message)
  }

  return errors
}

/**
 * Основной обработчик ошибок для Server Actions
 */
export async function handleServerActionError(
  error: unknown,
  context: string
): Promise<ApiResponse<null>> {
  logger.error(`Server Action Error in ${context}`, error as Error, {
    context,
  })

  if (error instanceof ValidationError) {
    logger.warn(`Validation error in ${context}`, { errors: error.fieldErrors })
    return {
      success: false,
      error: 'Validation failed',
      errors: error.fieldErrors,
    }
  }

  if (error instanceof ZodError) {
    const fieldErrors = formatZodErrors(error)
    logger.warn(`Zod validation error in ${context}`, { errors: fieldErrors })
    return {
      success: false,
      error: 'Validation failed',
      errors: fieldErrors,
    }
  }

  if (error instanceof AuthenticationError) {
    logger.warn(`Authentication error in ${context}`)
    return {
      success: false,
      error: error.message,
    }
  }

  if (error instanceof AuthorizationError) {
    logger.warn(`Authorization error in ${context}`)
    return {
      success: false,
      error: error.message,
    }
  }

  if (error instanceof NotFoundError) {
    logger.warn(`Not found error in ${context}`, {
      resource: error.resource,
      id: error.id,
    })
    return {
      success: false,
      error: error.message,
    }
  }

  if (error instanceof DatabaseError) {
    logger.error(`Database error in ${context}`, error.originalError, {
      context,
    })
    monitor.captureException(
      error.originalError || error,
      { context, type: 'database' }
    )
    return {
      success: false,
      error: 'Database operation failed',
    }
  }

  if (error instanceof Error) {
    logger.error(`Unexpected error in ${context}`, error, { context })
    monitor.captureException(error, { context, type: 'unexpected' })

    return {
      success: false,
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'An unexpected error occurred',
    }
  }

  logger.error(`Unknown error in ${context}`, new Error(String(error)), {
    context,
    error: String(error),
  })

  return {
    success: false,
    error: 'An unexpected error occurred',
  }
}
