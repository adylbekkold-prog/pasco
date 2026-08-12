'use client'

import { useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { setLocale as setLocaleAction } from '@/app/actions/locale.actions'
import { getLocaleName, locales } from '@/lib/locale'
import type { Locale } from '@/types'

const LAB_DETAIL_PATH_PATTERN = /^\/labs\/[^/]+\/?$/

export default function LanguageSwitcher({
  locale,
  variant = 'default',
}: {
  locale: Locale
  variant?: 'default' | 'dark'
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return
    startTransition(async () => {
      await setLocaleAction(nextLocale)

      if (LAB_DETAIL_PATH_PATTERN.test(pathname ?? '')) {
        router.push('/')
        return
      }

      router.refresh()
    })
  }

  return (
    <div
      role="group"
      aria-label={locale === 'ky' ? 'Интерфейстин тили' : 'Язык интерфейса'}
      className={`inline-flex items-center gap-1 rounded-lg p-0.5 border ${
        variant === 'dark'
          ? 'border-[var(--border)] bg-[var(--surface-muted)]'
          : 'border-[var(--border)] bg-[var(--surface)]'
      }`}
    >
      {locales.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => switchLocale(item)}
          disabled={isPending}
          aria-pressed={item === locale}
          aria-label={
            locale === 'ky'
              ? `${getLocaleName(item)} тилин тандоо`
              : `Выбрать язык ${getLocaleName(item)}`
          }
          className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition ${
            item === locale
              ? 'bg-[var(--primary)] text-white shadow-sm'
              : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--background-2)]'
          } ${isPending ? 'opacity-60' : ''}`}
        >
          {getLocaleName(item)}
        </button>
      ))}
    </div>
  )
}
