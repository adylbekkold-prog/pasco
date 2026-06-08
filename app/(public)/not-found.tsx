// D:\pasco-lab-portal\app\(public)\not-found.tsx
import Link from 'next/link'
import { getCurrentLocale } from '@/lib/locale-server'
import { getPublicCopy } from '@/lib/i18n/public'

export default async function NotFound() {
  const locale = await getCurrentLocale()
  const copy = getPublicCopy(locale, 'notFound')
  return (
    <div className="flex min-h-[72vh] items-center justify-center py-16"><div className="max-w-2xl rounded-lg border border-[var(--border)] bg-white px-8 py-16 text-center shadow-sm"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-blue-50 text-2xl font-bold text-[var(--primary)]">404</div><h1 className="mt-6 text-4xl font-bold tracking-[-0.03em] text-[var(--text)]">{copy.title}</h1><p className="mx-auto mt-4 max-w-xl text-base leading-8 text-[var(--muted)]">{copy.text}</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/labs" className="inline-flex items-center rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--primary-strong)]">{copy.catalog}</Link><Link href="/" className="inline-flex items-center rounded-lg border border-[var(--border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--background-2)]">{copy.home}</Link></div></div></div>
  )
}