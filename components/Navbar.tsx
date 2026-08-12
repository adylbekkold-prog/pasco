import Link from 'next/link'
import { FlaskConical } from 'lucide-react'
import PublicNavigation from '@/components/PublicNavigation'
import { getCurrentLocale } from '@/lib/locale-server'

export default async function Navbar() {
  const locale = await getCurrentLocale()
  const copy =
    locale === 'ky'
      ? {
          subtitle: 'Мугалим үчүн лабораториялар каталогу',
        }
      : {
          subtitle: 'Каталог лабораторий для учителя',
        }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 shadow-[0_8px_30px_rgba(16,35,63,0.06)] backdrop-blur-xl">
      <div className="page-container relative flex h-[72px] items-center justify-between gap-4">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-3 rounded-xl" aria-label={locale === 'ky' ? 'PASCO Lab — башкы бет' : 'PASCO Lab — главная'}>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--navy)] text-white shadow-[0_8px_22px_rgba(16,42,67,0.22)]">
            <FlaskConical size={20} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-bold tracking-[-0.02em] text-[var(--text)]">
              PASCO <span className="text-[var(--primary)]">Lab</span>
            </span>
            <span className="hidden text-xs text-[var(--muted)] md:block truncate">{copy.subtitle}</span>
          </span>
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-4">
          <PublicNavigation locale={locale} />
        </div>
      </div>
    </header>
  )
}
