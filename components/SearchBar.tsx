'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const copy =
    locale === 'ky'
      ? {
          placeholder: 'Аталышы, темасы же жабдуусу боюнча издөө',
          pending: 'Издеп жатабыз...',
          submit: 'Табуу',
        }
      : {
          placeholder: 'Поиск по названию, теме или оборудованию',
          pending: 'Ищем...',
          submit: 'Найти',
        }

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()

    const nextParams = new URLSearchParams(searchParams.toString())
    const normalized = query.trim()

    if (normalized) nextParams.set('search', normalized)
    else nextParams.delete('search')

    startTransition(() => {
      const nextQuery = nextParams.toString()
      router.push(nextQuery ? `/labs?${nextQuery}` : '/labs')
    })
  }

  const shellClassName =
    variant === 'hero'
      ? 'border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]'
      : variant === 'header'
        ? 'border-slate-200 bg-white'
        : 'border-slate-200 bg-slate-50'

  const buttonClassName =
    variant === 'hero'
      ? 'h-[58px] rounded-[18px] bg-[#1848c6] px-6 text-white hover:bg-[#123ba5]'
      : 'rounded-[16px] bg-[#1848c6] px-5 text-white hover:bg-[#123ba5]'

  return (
    <form onSubmit={handleSearch} className="flex w-full flex-col gap-3 sm:flex-row">
      <div
        className={`flex flex-1 items-center gap-3 overflow-hidden rounded-[20px] border px-5 ${shellClassName}`}
      >
        <Search size={18} className="shrink-0 text-slate-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder ?? copy.placeholder}
          className="h-[58px] border-0 bg-transparent px-0 text-[15px] text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:ring-0"
        />
      </div>

      <Button
        type="submit"
        size={variant === 'header' ? 'sm' : 'lg'}
        className={buttonClassName}
        disabled={isPending}
      >
        {isPending ? copy.pending : copy.submit}
      </Button>
    </form>
  )
}
