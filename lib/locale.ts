import type { Locale } from '@/types'

export const locales = ['ky', 'ru'] as const
export const defaultLocale: Locale = 'ky'
export const localeCookieName = 'pasco_locale'

export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'ru' || value === 'ky'
}

export function resolveLocale(value: string | null | undefined): Locale {
  return isLocale(value) ? value : defaultLocale
}

export function getLocaleName(locale: Locale) {
  return locale === 'ky'
    ? '\u041a\u044b\u0440\u0433\u044b\u0437\u0447\u0430'
    : '\u0420\u0443\u0441\u0441\u043a\u0438\u0439'
}

export function getAlternateLocale(locale: Locale): Locale {
  return locale === 'ky' ? 'ru' : 'ky'
}
