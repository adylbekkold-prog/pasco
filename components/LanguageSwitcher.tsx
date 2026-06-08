'use client'

import { useState } from 'react'
import { getLocaleName, locales } from '@/lib/locale'
import type { Locale } from '@/types'

export default function LanguageSwitcher({
  locale,
  variant = 'default',
}: {
  locale: Locale
  variant?: 'default' | 'dark'
}) {
  const [isPending, setIsPending] = useState(false)

  const switchLocale = async (nextLocale: Locale) => {
    console.log('switchLocale called with:', nextLocale, 'current:', locale)
    if (nextLocale === locale) {
      console.log('Same locale, skipping')
      return
    }
    setIsPending(true)

    try {
      console.log('Sending request to /api/locale')
      const response = await fetch('/api/locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: nextLocale }),
        credentials: 'include',
      })

      console.log('Response status:', response.status)
      if (response.ok) {
        console.log('Reloading page...')
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to switch locale:', error)
      setIsPending(false)
    }
  }

  return (
    <div
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
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
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
