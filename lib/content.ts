import type { Difficulty, Locale } from '@/types'

export const siteConfig = {
  name: 'PASCO Lab',
  shortName: 'PASCO Lab',
}

const siteDescriptions: Record<Locale, string> = {
  ru: 'Русскоязычный портал школьных лабораторных работ с понятными сценариями, материалами и инструментами для преподавателя.',
  ky: 'Мугалим үчүн түшүнүктүү сценарийлер, материалдар жана куралдар менен мектептик лабораториялык иштердин кыргызча порталы.',
}

const difficultyLabelsByLocale: Record<Locale, Record<Difficulty, string>> = {
  ru: {
    beginner: 'Базовый',
    intermediate: 'Средний',
    advanced: 'Продвинутый',
    professional: 'Профи',
  },
  ky: {
    beginner: 'Баштапкы',
    intermediate: 'Орто',
    advanced: 'Тереңдетилген',
    professional: 'Профи',
  },
}

const emptyDifficultyLabels: Record<Locale, string> = {
  ru: 'Не указан',
  ky: 'Көрсөтүлгөн эмес',
}

export const difficultyClasses: Record<Difficulty, string> = {
  beginner: 'border-[rgba(16,214,122,.28)] bg-[rgba(16,214,122,.12)] text-[var(--success)]',
  intermediate: 'border-[rgba(245,166,35,.28)] bg-[rgba(245,166,35,.12)] text-[var(--accent)]',
  advanced: 'border-[rgba(255,77,106,.28)] bg-[rgba(255,77,106,.12)] text-[var(--danger)]',
  professional: 'border-[rgba(139,92,246,.28)] bg-[rgba(139,92,246,.12)] text-[#8b5cf6]',
}

export function getSiteDescription(locale: Locale) {
  return siteDescriptions[locale]
}

export function getDifficultyLabel(
  value: Difficulty | null | undefined,
  locale: Locale = 'ru'
) {
  return value ? difficultyLabelsByLocale[locale][value] : emptyDifficultyLabels[locale]
}

export function getDifficultyClass(value: Difficulty | null | undefined) {
  return value
    ? difficultyClasses[value]
    : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted-soft)]'
}

export function pluralizeLabs(count: number, locale: Locale = 'ru') {
  if (locale === 'ky') {
    return count === 1 ? `${count} лабораториялык иш` : `${count} лабораториялык иштер`
  }

  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) return `${count} лаборатория`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${count} лаборатории`
  }

  return `${count} лабораторий`
}
