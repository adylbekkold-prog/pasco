// D:\pasco-lab-portal\app\(public)\layout.tsx
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { adminPath } from '@/lib/admin-routes'
import { getCurrentLocale } from '@/lib/locale-server'
import { getPublicCopy } from '@/lib/i18n/public'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const locale = await getCurrentLocale()
  const copy = getPublicCopy(locale, 'publicLayout')
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <a href="#main-content" className="skip-link">{copy.skip}</a>
      <Navbar />
      <main id="main-content" className="relative min-h-[60vh]">{children}</main>
      <footer id="about" className="mt-20 border-t border-white/10 bg-[var(--navy)] text-white">
        <div className="page-container grid gap-12 py-14 lg:grid-cols-[1.3fr_0.7fr_0.7fr] lg:py-16">
          <div>
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-blue-100">PASCO Education</div>
            <h2 className="mt-6 max-w-xl text-3xl font-bold tracking-[-0.04em] md:text-4xl">{copy.title}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{copy.description}</p>
            <p className="mt-5 text-sm text-slate-400">{copy.footer}</p>
          </div>
          <div>
            <div className="mb-5 text-xs font-bold uppercase tracking-[0.14em] text-blue-200">{copy.catalog}</div>
            <div className="space-y-3">
              <Link href="/labs?sort=new" className="block text-sm text-slate-300 transition hover:text-white">{copy.catalogLinks[0]}</Link>
              <Link href="/subjects" className="block text-sm text-slate-300 transition hover:text-white">{copy.catalogLinks[1]}</Link>
              <Link href="/grades" className="block text-sm text-slate-300 transition hover:text-white">{copy.catalogLinks[2]}</Link>
              <Link href="/pasco-kits" className="block text-sm text-slate-300 transition hover:text-white">{copy.kits}</Link>
            </div>
          </div>
          <div>
            <div className="mb-5 text-xs font-bold uppercase tracking-[0.14em] text-blue-200">{copy.company}</div>
            <div className="space-y-3">
              <Link href="/#how-it-works" className="block text-sm text-slate-300 transition hover:text-white">{copy.about}</Link>
              <Link href="/#contact" className="block text-sm text-slate-300 transition hover:text-white">{copy.help}</Link>
              <Link href="/#contact" className="block text-sm text-slate-300 transition hover:text-white">{copy.contacts}</Link>
              <Link href={adminPath()} className="block text-sm text-slate-300 transition hover:text-white">{copy.admin}</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="page-container flex flex-col gap-3 py-6 text-xs text-slate-400 md:flex-row md:items-center md:justify-between md:text-sm">
            <p>{copy.copyright}</p><p>{copy.tech}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
