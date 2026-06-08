import { getDataProvider } from '@/lib/data-provider'
import { resolveLocale } from '@/lib/locale'
import { getSupabasePublicEnvIssue } from '@/lib/supabase/env'
import type { Locale } from '@/types'

type ErrorLike = Error & { code?: string }

function getMessage(error: unknown) {
  if (error instanceof Error) return error.message

  if (error && typeof error === 'object' && 'message' in error) {
    return typeof error.message === 'string' ? error.message : ''
  }

  return ''
}

function getCode(error: unknown) {
  if (error && typeof error === 'object' && 'code' in error) {
    return typeof error.code === 'string' ? error.code : ''
  }

  return ''
}

function shouldReportSupabaseConfigIssue() {
  return getDataProvider() === 'supabase'
}

export function isDataNotFoundError(error: unknown) {
  const code = getCode(error)
  const message = getMessage(error).toLowerCase()

  return code === 'PGRST116' || message.includes('no rows returned')
}

export function isSupabaseConfigError(error: unknown) {
  if (shouldReportSupabaseConfigIssue() && getSupabasePublicEnvIssue()) return true

  const message = getMessage(error).toLowerCase()

  return (
    message.includes('invalid api key') ||
    message.includes('invalid jwt') ||
    message.includes('jwt malformed') ||
    message.includes('supabase') ||
    message.includes('auth session missing') ||
    message.includes('failed to fetch')
  )
}

export function shouldLogDataError(error: unknown) {
  return !isSupabaseConfigError(error)
}

export function getPublicDataErrorMessage(error: unknown, locale: Locale = 'ru') {
  const currentLocale = resolveLocale(locale)
  const envIssue = shouldReportSupabaseConfigIssue() ? getSupabasePublicEnvIssue() : null
  if (envIssue) return envIssue

  if (isSupabaseConfigError(error)) {
    return currentLocale === 'ky'
      ? 'Каталог маалыматтарына туташуу мүмкүн болгон жок. Supabase долбоорунун URL дарегин жана anon key ачкычын текшериңиз.'
      : 'Не удалось подключиться к данным каталога. Проверьте URL проекта и anon key Supabase.'
  }

  return currentLocale === 'ky'
    ? 'Маалыматтар убактылуу жеткиликсиз. Баракты жаңыртыңыз же жергиликтүү сактагычты текшериңиз.'
    : 'Данные временно недоступны. Обновите страницу или проверьте локальное хранилище.'
}

export type { ErrorLike }
