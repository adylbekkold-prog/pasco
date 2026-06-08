import Link from 'next/link'
import { ChevronRight, FlaskConical, Menu } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { getCurrentLocale } from '@/lib/locale-server'

export default async function Navbar() {
  const locale = await getCurrentLocale()
  const copy =
    locale === 'ky'
      ? {
          subtitle: 'Мугалим үчүн лабораториялар каталогу',
          home: 'Башкы бет',
          catalog: 'Каталог',
          dashboard: 'Мугалим кабинети',
          menu: 'Меню',
        }
      : {
          subtitle: 'Каталог лабораторий для учителя',
          home: 'Главная',
          catalog: 'Каталог',
          dashboard: 'Кабинет учителя',
          menu: 'Меню',
        }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white shadow-sm">
      <div className="mx-auto flex h-16 w-[min(1280px,calc(100%-32px))] items-center justify-between gap-6">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)] text-white font-bold text-lg">
            <FlaskConical size={18} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-bold tracking-[-0.02em] text-[var(--text)]">
              PASCO Lab
            </span>
            <span className="hidden text-xs text-[var(--muted)] md:block truncate">{copy.subtitle}</span>
          </span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher locale={locale} variant="default" />
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--primary-strong)]"
          >
            {copy.dashboard}
            <ChevronRight size={14} />
          </Link>
        </div>

        <details className="relative md:hidden">
          <summary className="flex list-none cursor-pointer items-center rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--text)] shadow-sm hover:shadow-md">
            <Menu size={16} />
          </summary>

          <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(88vw,300px)] rounded-lg border border-[var(--border)] bg-white shadow-lg">
            <div className="p-4">
              <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                {copy.menu}
              </div>
              <div className="mb-4">
                <LanguageSwitcher locale={locale} variant="default" />
              </div>
              <div className="grid gap-2">
                <Link
                  href="/admin"
                  className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)]"
                >
                  {copy.dashboard}
                </Link>
              </div>
            </div>
          </div>
        </details>
      </div>
    </header>
  )
}
