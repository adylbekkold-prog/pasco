// D:\pasco-lab-portal\app\(public)\layout.tsx
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getCurrentLocale } from '@/lib/locale-server'
import { getPublicCopy } from '@/lib/i18n/public'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const locale = await getCurrentLocale()
  const copy = getPublicCopy(locale, 'publicLayout')
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <Navbar />
      <main className="relative">{children}</main>
      <footer id="about" className="mt-20 border-t border-[var(--border)] bg-[var(--background-2)]">
        <div className="mx-auto grid w-[min(1280px,calc(100%-32px))] gap-12 py-16 lg:grid-cols-[1.2fr_0.5fr_0.5fr]">
          <div><div className="inline-flex rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">PASCO Education</div><h2 className="mt-6 max-w-xl text-3xl font-bold tracking-[-0.03em] text-[var(--text)] md:text-4xl">{copy.title}</h2><p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted)]">{copy.description}</p><p className="mt-6 text-sm text-[var(--muted-soft)]">{copy.footer}</p></div>
          <div><div className="text-sm font-bold uppercase tracking-wider text-[var(--text)] mb-6">{copy.catalog}</div><div className="space-y-3"><Link href="/labs?sort=new" className="block text-sm text-[var(--muted)] transition hover:text-[var(--primary)]">{copy.catalogLinks[0]}</Link><Link href="/subjects" className="block text-sm text-[var(--muted)] transition hover:text-[var(--primary)]">{copy.catalogLinks[1]}</Link><Link href="/grades" className="block text-sm text-[var(--muted)] transition hover:text-[var(--primary)]">{copy.catalogLinks[2]}</Link></div></div>
          <div><div className="text-sm font-bold uppercase tracking-wider text-[var(--text)] mb-6">{copy.company}</div><div className="space-y-3"><Link href="#" className="block text-sm text-[var(--muted)] transition hover:text-[var(--primary)]">{copy.about}</Link><Link href="#" className="block text-sm text-[var(--muted)] transition hover:text-[var(--primary)]">{copy.help}</Link><Link href="#" className="block text-sm text-[var(--muted)] transition hover:text-[var(--primary)]">{copy.contacts}</Link></div></div>
        </div>
        <div className="border-t border-[var(--border)]"><div className="mx-auto flex w-[min(1280px,calc(100%-32px))] flex-col gap-4 py-8 text-sm text-[var(--muted-soft)] md:flex-row md:items-center md:justify-between"><p>{copy.copyright}</p><p>{copy.tech}</p></div></div>
      </footer>
    </div>
  )
}