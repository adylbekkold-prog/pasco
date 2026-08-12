'use client'

import { useEffect, useId, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoaderCircle, Search, X } from 'lucide-react'
import type { Locale } from '@/types'

interface SearchBarProps {
  initialQuery?: string
  placeholder?: string
  variant?: 'hero' | 'surface' | 'header'
  locale?: Locale
}

export default function SearchBar({
  initialQuery = '',
  placeholder,
  variant = 'hero',
  locale = 'ru',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const [isPending, startTransition] = useTransition()
  const inputId = useId()
  const router = useRouter()
  const searchParams = useSearchParams()
  const copy =
    locale === 'ky'
      ? {
          clear: 'Издөөнү тазалоо',
          label: 'Лабораторияларды издөө',
          pending: 'Издөө...',
          placeholder: 'Аталышы, темасы же жабдуусу боюнча издөө',
          submit: 'Табуу',
        }
      : {
          clear: 'Очистить поиск',
          label: 'Поиск лабораторных работ',
          pending: 'Ищем...',
          placeholder: 'Поиск по названию, теме или оборудованию',
          submit: 'Найти',
        }
  const placeholderText = placeholder ?? copy.placeholder

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  function navigateWithQuery(nextSearch: string | null) {
    const nextParams = new URLSearchParams(searchParams.toString())

    if (nextSearch) nextParams.set('search', nextSearch)
    else nextParams.delete('search')

    startTransition(() => {
      const nextQuery = nextParams.toString()
      router.push(nextQuery ? `/labs?${nextQuery}` : '/labs')
    })
  }

  function handleSearch(event: React.FormEvent) {
    event.preventDefault()
    navigateWithQuery(query.trim() || null)
  }

  function handleClear() {
    setQuery('')
    navigateWithQuery(null)
  }

  const shellClassName =
    variant === 'hero'
      ? 'min-h-[64px] border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.10)]'
      : variant === 'header'
        ? 'min-h-[48px] border-slate-200 bg-white shadow-sm'
        : 'min-h-[54px] border-slate-200 bg-slate-50 shadow-sm'

  const submitButtonClassName =
    variant === 'hero'
      ? 'min-h-11 px-5 text-sm'
      : variant === 'header'
        ? 'min-h-9 px-4 text-xs'
        : 'min-h-10 px-4 text-sm'

  return (
    <form onSubmit={handleSearch} role="search" className="w-full">
      <label htmlFor={inputId} className="sr-only">
        {copy.label}
      </label>

      <div
        className={`flex w-full items-center gap-2 rounded-[18px] border px-3 transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 sm:gap-3 sm:px-4 ${shellClassName}`}
      >
        <Search size={19} className="shrink-0 text-slate-400" aria-hidden="true" />
        <input
          id={inputId}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholderText}
          autoComplete="off"
          className="h-11 min-w-0 flex-1 border-0 bg-transparent px-0 text-[15px] font-medium text-slate-950 outline-none placeholder:text-slate-400 focus-visible:outline-none"
        />

        {query.trim().length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            aria-label={copy.clear}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}

        <button
          type="submit"
          disabled={isPending}
          className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1647c5] font-bold text-white transition hover:bg-[#123ba5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1647c5] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 ${submitButtonClassName}`}
        >
          {isPending && <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />}
          <span>{isPending ? copy.pending : copy.submit}</span>
        </button>
      </div>
    </form>
  )
}
