import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { getDifficultyClass, getDifficultyLabel } from '@/lib/content'
import type { Difficulty, Locale } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB'
  return Math.round(bytes / (1024 * 1024)) + ' MB'
}

export function getDifficultyMeta(
  difficulty: Difficulty | null | undefined,
  locale: Locale = 'ru'
) {
  return {
    label: getDifficultyLabel(difficulty, locale),
    className: getDifficultyClass(difficulty),
  }
}

export function formatDuration(minutes: number | null | undefined, locale: Locale = 'ru') {
  if (!minutes) {
    return locale === 'ky' ? 'Убакыт көрсөтүлгөн эмес' : 'Время не указано'
  }

  if (minutes < 60) {
    return locale === 'ky' ? `${minutes} мүн` : `${minutes} мин`
  }

  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  if (rest === 0) {
    return locale === 'ky' ? `${hours} саат` : `${hours} ч`
  }

  return locale === 'ky' ? `${hours} саат ${rest} мүн` : `${hours} ч ${rest} мин`
}
