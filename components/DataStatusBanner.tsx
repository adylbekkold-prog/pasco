import { AlertTriangle, DatabaseZap } from 'lucide-react'
import type { Locale } from '@/types'

interface DataStatusBannerProps {
  title?: string
  message: string
  className?: string
  locale?: Locale
}

export default function DataStatusBanner({
  title,
  message,
  className = '',
  locale = 'ru',
}: DataStatusBannerProps) {
  const fallbackTitle =
    locale === 'ky'
      ? 'Каталог чектелген режимде иштеп жатат'
      : 'Каталог работает в ограниченном режиме'

  return (
    <div
      className={`overflow-hidden rounded-[20px] border border-[rgba(245,166,35,.24)] bg-[rgba(245,166,35,.08)] p-5 shadow-[var(--shadow-sm)] ${className}`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[rgba(245,166,35,.12)] text-[var(--accent)]">
          <DatabaseZap size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
            <AlertTriangle size={16} />
            {title ?? fallbackTitle}
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{message}</p>
        </div>
      </div>
    </div>
  )
}
