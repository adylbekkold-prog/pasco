'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import type { Locale } from '@/types'

const NAV_ITEMS = {
  ru: [
    { href: '/labs', label: 'Лаборатории' },
    { href: '/subjects', label: 'Предметы' },
    { href: '/grades', label: 'Классы' },
    { href: '/pasco-kits', label: 'PASCO-комплекты', featured: true },
  ],
  ky: [
    { href: '/labs', label: 'Лабораториялар' },
    { href: '/subjects', label: 'Предметтер' },
    { href: '/grades', label: 'Класстар' },
    { href: '/pasco-kits', label: 'PASCO комплекттери', featured: true },
  ],
} satisfies Record<Locale, Array<{ href: string; label: string; featured?: boolean }>>

export default function PublicNavigation({ locale }: { locale: Locale }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const menuLabel = locale === 'ky' ? 'Навигация менюсу' : 'Меню навигации'

  useEffect(() => {
    if (!open) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [open])

  return (
    <>
      <nav className="hidden items-center gap-1 lg:flex" aria-label={menuLabel}>
        {NAV_ITEMS[locale].map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const featuredClass = item.featured
            ? 'border border-blue-100 bg-blue-50/80 text-[var(--primary)] hover:border-blue-200 hover:bg-blue-100'
            : 'text-[var(--muted)] hover:bg-slate-50 hover:text-[var(--text)]'

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                active ? 'bg-blue-50 text-[var(--primary)]' : featuredClass
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="hidden items-center gap-3 md:flex">
        <LanguageSwitcher locale={locale} />
      </div>

      <button
        type="button"
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--text)] shadow-sm transition hover:border-blue-200 hover:text-[var(--primary)] lg:hidden"
        aria-label={open ? (locale === 'ky' ? 'Менюну жабуу' : 'Закрыть меню') : menuLabel}
        aria-expanded={open}
        aria-controls="public-mobile-menu"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>

      {open && (
        <div
          id="public-mobile-menu"
          className="absolute inset-x-0 top-full border-b border-[var(--border)] bg-white shadow-[var(--shadow-lg)] lg:hidden"
        >
          <div className="page-container py-4">
            <nav className="grid gap-1" aria-label={menuLabel}>
              {NAV_ITEMS[locale].map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
                const featuredClass = item.featured
                  ? 'border border-blue-100 bg-blue-50 text-[var(--primary)]'
                  : 'text-[var(--text)] hover:bg-slate-50'

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-11 items-center rounded-xl px-4 text-sm font-bold ${
                      active ? 'bg-blue-50 text-[var(--primary)]' : featuredClass
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="mt-4 border-t border-[var(--border)] pt-4 md:hidden">
              <LanguageSwitcher locale={locale} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
