import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowUpRight, Boxes, PackageOpen } from 'lucide-react'
import ResponsiveImage from '@/components/ResponsiveImage'
import { getCurrentLocale } from '@/lib/locale-server'
import { getLocalSubjects } from '@/lib/local-db'
import { getPascoKits } from '@/lib/queries'
import { getPublicCopy } from '@/lib/i18n/public'


export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale()
  const copy = getPublicCopy(locale, 'pascoKitsCatalog')

  return {
    title: copy.title,
    description: copy.intro,
    alternates: {
      canonical: '/pasco-kits',
    },
  }
}

export default async function PascoKitsCatalogPage() {
  const locale = await getCurrentLocale()
  const copy = getPublicCopy(locale, 'pascoKitsCatalog')
  const [kits, subjects] = await Promise.all([
    getPascoKits(undefined, locale),
    getLocalSubjects(locale),
  ])

  const kitCountLabel = locale === 'ky' ? 'комплект' : kits.length === 1 ? 'комплект' : 'комплектов'
  const heroNote =
    locale === 'ky'
      ? 'Сабакка чейин комплекттин курамын, сүрөттөрүн жана сактоо жерин текшериңиз.'
      : 'Проверяйте состав комплекта, фотографии и место хранения до начала занятия.'

  return (
    <div className="page-container pb-20 pt-8">
      <section className="overflow-hidden rounded-[30px] border border-[var(--border)] bg-white shadow-[var(--shadow-md)]">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-7 md:p-10">
            <span className="section-eyebrow">{copy.kicker}</span>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-[-0.05em] md:text-5xl">{copy.title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted)]">{copy.intro}</p>
            <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
              <Boxes size={16} /> {kits.length} {kitCountLabel}
            </div>
          </div>
          <div className="flex min-h-56 items-center justify-center border-t border-[var(--border)] bg-[var(--navy)] p-8 text-white lg:border-l lg:border-t-0">
            <div className="text-center">
              <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] border border-white/15 bg-white/10"><PackageOpen size={34} /></span>
              <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">{heroNote}</p>
            </div>
          </div>
        </div>
      </section>

      {kits.length === 0 ? (
        <div className="surface-card mt-8 border-dashed px-6 py-16 text-center text-[var(--muted)]">{copy.noKits}</div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {kits.map((kit) => {
            const subject = subjects.find((item) => item.id === kit.subject_id)
            return (
              <Link key={kit.id} href={`/pasco-kits/${kit.slug}`} className="group flex flex-col overflow-hidden rounded-[24px] border border-[var(--border)] bg-white shadow-[var(--shadow-sm)] transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-[var(--shadow-md)]">
                <div className="relative aspect-[4/3] overflow-hidden bg-white">
                  {kit.thumbnail_url ? (
                    <ResponsiveImage src={kit.thumbnail_url} alt={kit.name} className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-[1.035]" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_75%_20%,rgba(29,87,200,0.2),transparent_38%),linear-gradient(145deg,#f8fbff,#eef3f8)]">
                      <span className="flex h-20 w-20 items-center justify-center rounded-[26px] bg-white text-[var(--primary)] shadow-[var(--shadow-md)]"><PackageOpen size={32} /></span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  {subject && <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-[var(--primary)]">{subject.icon} {subject.name}</span>}
                  <h2 className="mt-4 text-xl font-bold tracking-[-0.025em] transition group-hover:text-[var(--primary)]">{kit.name}</h2>
                  {kit.description && <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--muted)]">{kit.description}</p>}
                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-5">
                    <span className="text-sm font-semibold text-[var(--muted)]">{kit.components?.length || 0} {copy.components.toLowerCase()}</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[var(--primary)] transition group-hover:bg-[var(--primary)] group-hover:text-white"><ArrowUpRight size={17} /></span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
