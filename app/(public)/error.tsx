'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Public route error:', error)
  }, [error])

  const copy = {
    title: 'Страница недоступна / Барак жеткиликсиз',
    text: 'Проверьте подключение и повторите попытку. Туташууну текшерип, кайра аракет кылыңыз.',
    retry: 'Повторить / Кайталоо',
    catalog: 'В каталог / Каталогго',
  }

  return (
    <section className="page-container py-16 md:py-24" role="alert">
      <div className="mx-auto max-w-2xl rounded-[28px] border border-red-200 bg-white p-6 text-center shadow-[var(--shadow-lg)] md:p-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle size={26} aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-3xl font-bold tracking-[-0.04em] text-[var(--text)]">
          {copy.title}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--muted)] md:text-base">
          {copy.text}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" onClick={reset} className="min-h-11 gap-2 rounded-xl px-5">
            <RefreshCw size={16} aria-hidden="true" />
            {copy.retry}
          </Button>
          <Link href="/labs" className="button-secondary min-h-11 px-5">
            {copy.catalog}
          </Link>
        </div>
      </div>
    </section>
  )
}
