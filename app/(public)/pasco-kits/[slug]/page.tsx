import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, Boxes, MapPin, PackageOpen } from 'lucide-react'
import { notFound } from 'next/navigation'
import ResponsiveImage from '@/components/ResponsiveImage'
import { getSiteDescription } from '@/lib/content'
import { getCurrentLocale } from '@/lib/locale-server'
import { getLocalSubjects } from '@/lib/local-db'
import { getPascoKitBySlug } from '@/lib/queries'
import { getPublicCopy } from '@/lib/i18n/public'

import { getPascoComponentAnchor } from '@/lib/pasco-kit-photo-links'
import { getSeoDescription } from '@/lib/seo'

export const dynamic = 'force-dynamic'

interface KitDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: KitDetailPageProps): Promise<Metadata> {
  const locale = await getCurrentLocale()
  const { slug } = await params
  const kit = await getPascoKitBySlug(slug, locale)


  if (!kit) {
    return {
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const description = getSeoDescription(kit.description, getSiteDescription(locale))

  return {
    title: kit.name,
    description,
    alternates: {
      canonical: `/pasco-kits/${kit.slug}`,
    },
    openGraph: {
      title: kit.name,
      description,
      type: 'article',
      images: kit.thumbnail_url ? [{ url: kit.thumbnail_url, alt: kit.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: kit.name,
      description,
      images: kit.thumbnail_url ? [kit.thumbnail_url] : undefined,
    },
  }
}

export default async function KitDetailPage({ params }: KitDetailPageProps) {
  const locale = await getCurrentLocale()
  const { slug } = await params
  const copy = getPublicCopy(locale, 'pascoKitDetail')
  const [kit, subjects] = await Promise.all([
    getPascoKitBySlug(slug, locale),
    getLocalSubjects(locale),
  ])


  if (!kit) notFound()
  const subject = subjects.find((item) => item.id === kit.subject_id)

  return (
    <div className="page-container pb-20 pt-8">
      <Link href="/pasco-kits" className="button-secondary"><ArrowLeft size={16} />{copy.backToCatalog}</Link>

      <section className="mt-6 overflow-hidden rounded-[30px] border border-[var(--border)] bg-white shadow-[var(--shadow-md)]">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-72 bg-white lg:min-h-[480px]">
            {kit.thumbnail_url ? (
              <ResponsiveImage src={kit.thumbnail_url} alt={kit.name} priority sizes="(max-width: 1024px) 100vw, 45vw" className="h-full w-full object-contain p-6" />
            ) : (
              <div className="flex h-full min-h-72 items-center justify-center bg-[radial-gradient(circle_at_75%_20%,rgba(29,87,200,0.2),transparent_38%),linear-gradient(145deg,#f8fbff,#eef3f8)]"><span className="flex h-24 w-24 items-center justify-center rounded-[30px] bg-white text-[var(--primary)] shadow-[var(--shadow-md)]"><PackageOpen size={38} /></span></div>
            )}
          </div>
          <div className="p-7 md:p-10">
            {subject && <span className="section-eyebrow">{subject.icon} {subject.name}</span>}
            <h1 className="mt-5 text-4xl font-bold tracking-[-0.05em] md:text-5xl">{kit.name}</h1>
            {kit.description && <div className="mt-7"><h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{copy.description}</h2><p className="mt-3 whitespace-pre-line text-base leading-8 text-slate-700">{kit.description}</p></div>}
            <div className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-slate-100 px-5 py-4">
              <Boxes size={21} className="text-[var(--primary)]" />
              <div><div className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{copy.components}</div><div className="mt-1 text-2xl font-bold">{kit.components?.length || 0}</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4"><div><span className="section-eyebrow">PASCO</span><h2 className="mt-4 text-3xl font-bold tracking-[-0.04em]">{copy.components}</h2></div></div>
        {!kit.components?.length ? (
          <div className="surface-card mt-6 border-dashed px-6 py-14 text-center text-[var(--muted)]"><PackageOpen size={32} className="mx-auto mb-4" />{copy.noComponents}</div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {kit.components.map((component) => (
              <article key={component.id} id={getPascoComponentAnchor(component.id)} className="surface-card scroll-mt-28 overflow-hidden">
                <div className="grid h-full sm:grid-cols-[180px_1fr]">
                  <div className="relative min-h-44 bg-white">
                    {component.photo_url ? <ResponsiveImage src={component.photo_url} alt={component.name} className="h-full w-full object-contain p-4" sizes="(max-width: 640px) 100vw, 180px" /> : <div className="flex h-full min-h-44 items-center justify-center bg-slate-100 text-slate-400"><PackageOpen size={32} /></div>}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3"><h3 className="text-lg font-bold">{component.name}</h3><span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-[var(--primary)]">x{component.quantity}</span></div>
                    {component.description && <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{component.description}</p>}
                    {component.storage_location && <div className="mt-4 inline-flex items-start gap-2 text-sm font-semibold text-slate-600"><MapPin size={15} className="mt-0.5 shrink-0 text-[var(--primary)]" />{component.storage_location}</div>}
                    {component.notes && <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">{component.notes}</p>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
