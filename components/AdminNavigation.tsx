'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart3, Boxes, FlaskConical, Menu, PackagePlus, Plus, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import AdminLogout from '@/components/AdminLogout'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import ThemeToggle from '@/components/ThemeToggle'
import { adminPath } from '@/lib/admin-routes'
import type { Locale } from '@/types'

export default function AdminNavigation({
  locale,
  copy,
  userEmail,
  userInitial,
}: {
  locale: Locale
  copy: Record<string, string>
  userEmail: string
  userInitial: string
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [open])
  const items = [
    { href: adminPath(), label: copy.dashboard, icon: BarChart3, exact: true },
    { href: adminPath('/labs'), label: copy.labs, icon: FlaskConical },
    { href: adminPath('/labs/new'), label: copy.newLab, icon: Plus, exact: true },
    { href: adminPath('/pasco-kits'), label: copy.kits, icon: Boxes },
    { href: adminPath('/pasco-kits/new'), label: copy.newKit, icon: PackagePlus, exact: true },
  ]

  const content = (
    <>
      <div className="border-b border-[var(--border)] p-5">
        <Link href={adminPath()} className="flex items-center gap-3 rounded-xl">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-950 text-white shadow-md"><FlaskConical size={19} /></span>
          <span><strong className="block text-sm text-[var(--text)]">PASCO Admin</strong><span className="mt-0.5 block text-[11px] leading-4 text-[var(--muted)]">{copy.role}</span></span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3" aria-label={copy.menu}>
        <div className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted-soft)]">{copy.nav}</div>
        <div className="grid gap-1">
          {items.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : (pathname === item.href || pathname.startsWith(`${item.href}/`)) && pathname !== `${item.href}/new`
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} aria-current={active ? 'page' : undefined} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${active ? 'bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-500/12 dark:text-blue-200' : 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]'}`}>
                <Icon size={17} aria-hidden="true" />{item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="border-t border-[var(--border)] p-4">
        <div className="mb-3 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow-sm)]">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">{userInitial}</span>
          <span className="min-w-0 truncate text-xs font-semibold text-[var(--muted)]">{userEmail}</span>
        </div>
        <div className="mb-3 grid grid-cols-[1fr_auto] gap-2"><LanguageSwitcher locale={locale} /><ThemeToggle className="min-h-11 px-3" /></div>
        <AdminLogout locale={locale} />
        <Link href="/" className="mt-2 flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-bold text-[var(--muted)] transition hover:text-[var(--primary)]">{copy.back}</Link>
      </div>
    </>
  )

  return (
    <>
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-[var(--border)] bg-[var(--background-2)]/80 backdrop-blur lg:flex">{content}</aside>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/92 px-4 backdrop-blur lg:hidden">
        <Link href={adminPath()} className="flex items-center gap-2 font-bold"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--navy)] text-white"><FlaskConical size={17} /></span>PASCO Admin</Link>
        <div className="flex items-center gap-2">
          <ThemeToggle className="min-h-11 px-3" />
          <button type="button" className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)]" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-controls="admin-mobile-menu" aria-label={open ? (locale === 'ky' ? 'Менюну жабуу' : 'Закрыть меню') : copy.menu}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {open && (
        <div id="admin-mobile-menu" className="fixed inset-0 top-16 z-50 bg-slate-950/45 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)}>
          <aside className="flex h-full w-[min(88vw,360px)] flex-col bg-[var(--background-2)] shadow-2xl" onClick={(event) => event.stopPropagation()}>{content}</aside>
        </div>
      )}
    </>
  )
}
