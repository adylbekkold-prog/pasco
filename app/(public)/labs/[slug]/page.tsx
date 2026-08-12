import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import {
  BookOpenText,
  Camera,
  Clock3,
  FileText,
  FlaskConical,
  Gauge,
  ListChecks,
  PackageCheck,
  Wrench,
} from 'lucide-react'
import BackButton from '@/components/BackButton'
import DataStatusBanner from '@/components/DataStatusBanner'
import LabResources from '@/components/LabResources'
import ResponsiveImage from '@/components/ResponsiveImage'
import StepViewer from '@/components/StepViewer'
import { getDifficultyLabel, getSiteDescription } from '@/lib/content'
import { getPublicDataErrorMessage, isDataNotFoundError, shouldLogDataError } from '@/lib/data-errors'
import { getLabPhotoUrl, getPhotoImageUrl } from '@/lib/lab-photo-url'
import { getAlternateLocale } from '@/lib/locale'
import { getCurrentLocale } from '@/lib/locale-server'
import { getPascoPhotoTarget } from '@/lib/pasco-kit-photo-links'
import { getLabBySlug, getPascoKits } from '@/lib/queries'

import { getSeoDescription } from '@/lib/seo'
import type { Equipment, Locale } from '@/types'

export const dynamic = 'force-dynamic'

interface LabPageProps {
  params: Promise<{ slug: string }>
}

interface LabDetailCopy {
  back: string
  published: string
  draft: string
  unavailable: string
  unavailableText: string
  downloads: string
  backToCatalog: string
  subject: string
  grade: string
  materials: string
  description: string
  photos: string
  equipment: string
  steps: string
  minutes: string
}

function getLabDetailCopy(locale: Locale): LabDetailCopy {
  return locale === 'ky'
    ? {
        back: 'Каталогго кайтуу',
        published: 'Жарыяланган',
        draft: 'Долбоор',
        unavailable: 'Материал азыр жеткиликсиз',
        unavailableText: 'Бул барак лаборатория тууралуу маалыматты жүктөй алган жок.',
        downloads: 'Материалдар',
        backToCatalog: 'Каталогго кайтуу',
        subject: 'Предмет',
        grade: 'Класс',
        materials: 'Материалдар',
        description: 'Лабораториянын сүрөттөлүшү',
        photos: 'Эксперименттин сүрөттөрү',
        equipment: 'Керектүү жабдуулар',
        steps: 'Иштин кадамдары',
        minutes: 'мүнөт',
      }
    : {
        back: 'Назад к каталогу',
        published: 'Опубликовано',
        draft: 'Черновик',
        unavailable: 'Материал временно недоступен',
        unavailableText: 'Страница не смогла загрузить данные лабораторной работы.',
        downloads: 'Материалы',
        backToCatalog: 'В каталог',
        subject: 'Предмет',
        grade: 'Класс',
        materials: 'Материалы',
        description: 'Описание лабораторной работы',
        photos: 'Фотографии эксперимента',
        equipment: 'Оборудование для проведения работы',
        steps: 'Пошаговая инструкция',
        minutes: 'мин',
      }
}

function getLocaleRedirect(locale: Locale) {
  return `/api/locale/open?locale=${locale}&redirect=%2F`
}

export async function generateMetadata({ params }: LabPageProps): Promise<Metadata> {
  const locale = await getCurrentLocale()
  const { slug } = await params

  try {
    const lab = await getLabBySlug(slug, locale)
    const description = getSeoDescription(lab.content, getSiteDescription(locale))
    const imageUrl = getLabPhotoUrl(lab)

    return {
      title: lab.title,
      description,
      alternates: {
        canonical: `/labs/${lab.slug}`,
      },
      robots: lab.is_published
        ? { index: true, follow: true }
        : { index: false, follow: false },
      openGraph: {
        title: lab.title,
        description,
        type: 'article',
        images: imageUrl ? [{ url: imageUrl, alt: lab.title }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: lab.title,
        description,
        images: imageUrl ? [imageUrl] : undefined,
      },
    }
  } catch {
    return {
      robots: {
        index: false,
        follow: false,
      },
    }
  }
}

export default async function LabPage({ params }: LabPageProps) {
  const locale = await getCurrentLocale()
  const copy = getLabDetailCopy(locale)
  const { slug } = await params

  let lab: Awaited<ReturnType<typeof getLabBySlug>> | null = null
  let dataIssue: string | null = null
  let labMissingInCurrentLocale = false

  try {
    lab = await getLabBySlug(slug, locale)
  } catch (error) {
    if (isDataNotFoundError(error)) {
      labMissingInCurrentLocale = true
    } else {
      dataIssue = getPublicDataErrorMessage(error, locale)
      if (shouldLogDataError(error)) console.error(error)
    }
  }

  if (!lab && labMissingInCurrentLocale) {
    const alternateLocale = getAlternateLocale(locale)
    let labExistsInAlternateLocale = false
    let labMissingInAlternateLocale = false

    try {
      await getLabBySlug(slug, alternateLocale)
      labExistsInAlternateLocale = true
    } catch (error) {
      if (isDataNotFoundError(error)) {
        labMissingInAlternateLocale = true
      } else {
        dataIssue = getPublicDataErrorMessage(error, locale)
        if (shouldLogDataError(error)) console.error(error)
      }
    }

    if (labExistsInAlternateLocale) {
      redirect(getLocaleRedirect(alternateLocale))
    }

    if (labMissingInAlternateLocale) {
      notFound()
    }
  }

  if (!lab) {
    return (
      <div className="mx-auto w-[min(1180px,calc(100%-32px))] pb-16 pt-8">
        <BackButton label={copy.back} />

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="rounded-[32px] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#1647c5]">
              LAB
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-slate-950">
              {copy.unavailable}
            </h1>
            <p className="mt-4 text-base leading-8 text-slate-600">{copy.unavailableText}</p>
            {dataIssue && <DataStatusBanner className="mt-6" message={dataIssue} locale={locale} />}
          </div>
        </div>
      </div>
    )
  }

  const subjectColor = lab.subjects?.color ?? '#1255d9'
  const photoUrls = lab.photo_urls ?? []
  const equipment = lab.equipment ?? []
  const resources = lab.resources ?? []
  const steps = lab.lab_steps ?? []
  const equipmentItems = lab.equipment_items ?? []
  const heroImageUrl = getLabPhotoUrl(lab)
  let pascoKits: Awaited<ReturnType<typeof getPascoKits>> = []

  try {
    pascoKits = await getPascoKits(undefined, locale)
  } catch (error) {
    if (shouldLogDataError(error)) console.error(error)
  }


  return (
    <div className="mx-auto w-[min(1100px,calc(100%-32px))] pb-20 pt-8">
      <BackButton label={copy.back} />

      {dataIssue && <DataStatusBanner className="mt-6" message={dataIssue} locale={locale} />}

      <section className="mt-6 overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="p-6 md:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#1647c5]">
                LAB
              </span>
              <span
                className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
                  lab.is_published
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {lab.is_published ? copy.published : copy.draft}
              </span>
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-slate-950 md:text-5xl">
              {lab.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {lab.subjects && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold"
                  style={{ backgroundColor: `${subjectColor}18`, color: subjectColor }}
                >
                  {lab.subjects.icon} {lab.subjects.name}
                </span>
              )}
              {lab.grades && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-sm font-semibold text-slate-700">
                  {lab.grades.label}
                </span>
              )}
              {lab.duration_minutes && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-sm font-semibold text-slate-700">
                  <Clock3 size={14} /> {lab.duration_minutes} {copy.minutes}
                </span>
              )}
              {lab.difficulty && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1.5 text-sm font-semibold text-[var(--primary)]">
                  <Gauge size={14} /> {getDifficultyLabel(lab.difficulty, locale)}
                </span>
              )}
              {equipment.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-sm font-semibold text-slate-700">
                  <Wrench size={14} /> {equipment.length}
                </span>
              )}
              {resources.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-sm font-semibold text-slate-700">
                  <FileText size={14} /> {resources.length} {copy.materials.toLowerCase()}
                </span>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/labs"
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
              >
                {copy.backToCatalog}
              </Link>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 lg:border-l lg:border-t-0">
            {heroImageUrl ? (
              <div className="relative min-h-[340px] lg:h-full">
                <ResponsiveImage src={heroImageUrl} alt={lab.title} priority sizes="(max-width: 1024px) 100vw, 46vw" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy)]/35 to-transparent" />
              </div>
            ) : (
              <div className="relative flex min-h-[360px] items-center justify-center p-8" style={{ background: `radial-gradient(circle at top right, ${subjectColor}2a 0%, transparent 48%), linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)` }}>
                <span className="flex h-24 w-24 items-center justify-center rounded-[30px] border border-white bg-white/90 text-5xl shadow-[var(--shadow-md)]">
                  {lab.subjects?.icon ?? <FlaskConical size={36} />}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <nav aria-label={locale === 'ky' ? 'Бөлүмдөр' : 'Разделы материала'} className="sticky top-[82px] z-20 mt-5 flex gap-2 overflow-x-auto rounded-2xl border border-[var(--border)] bg-white/95 p-2 shadow-[var(--shadow-sm)] backdrop-blur">
        {[
          ['#overview', copy.description],
          ...(steps.length ? [['#steps', copy.steps]] : []),
          ...(photoUrls.length ? [['#photos', copy.photos]] : []),
          ...((equipment.length || equipmentItems.length) ? [['#equipment', copy.equipment]] : []),
          ['#materials', copy.materials],
        ].map(([href, label]) => (
          <a key={href} href={href} className="flex min-h-10 shrink-0 items-center rounded-xl px-3 text-xs font-bold text-[var(--muted)] transition hover:bg-blue-50 hover:text-[var(--primary)]">{label}</a>
        ))}
      </nav>

      {lab.content && (
        <section id="overview" className="mt-8 scroll-mt-28 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_44px_rgba(15,23,42,0.05)]">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-slate-600">
              <BookOpenText size={18} />
              {copy.description}
            </h2>
          </div>
          <div className="p-6 md:p-8">
            <p className="whitespace-pre-line text-base leading-8 text-slate-700">
              {lab.content}
            </p>
          </div>
        </section>
      )}

      {steps.length > 0 && (
        <section id="steps" className="mt-6 scroll-mt-28 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_44px_rgba(15,23,42,0.05)]">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-slate-600"><ListChecks size={18} />{copy.steps}</h2>
          </div>
          <div className="p-6 md:p-8"><StepViewer steps={steps} locale={locale} /></div>
        </section>
      )}

      {photoUrls.length > 0 && (
        <section id="photos" className="mt-6 scroll-mt-28 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_44px_rgba(15,23,42,0.05)]">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-slate-600">
              <Camera size={18} />
              {copy.photos}
            </h2>
          </div>
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {photoUrls.map((photoPath, index) => {
                const photoUrl = getPhotoImageUrl(photoPath)
                const pascoTarget = getPascoPhotoTarget(photoPath, pascoKits)
                if (!photoUrl) return null

                return (
                  <Link
                    key={index}
                    href={pascoTarget?.href ?? '/pasco-kits'}
                    aria-label={pascoTarget ? `${pascoTarget.componentName}: ${pascoTarget.kitName}` : copy.equipment}
                    className="group block overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition hover:border-blue-300 hover:shadow-md"
                  >
                    <div className="relative h-48 w-full md:h-56">
                      <ResponsiveImage src={photoUrl} alt={`${copy.photos} ${index + 1}`} className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.025]" />
                      {pascoTarget && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent p-3 text-white">
                          <div className="line-clamp-1 text-xs font-bold">{pascoTarget.componentName}</div>
                          <div className="mt-0.5 line-clamp-1 text-[11px] font-semibold text-white/80">{pascoTarget.kitName}</div>
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {(equipment.length > 0 || equipmentItems.length > 0) && (
        <section id="equipment" className="mt-6 scroll-mt-28 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_44px_rgba(15,23,42,0.05)]">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-slate-600">
              <Wrench size={18} />
              {copy.equipment}
            </h2>
          </div>
          <div className="p-6 md:p-8">
            {equipment.length > 0 && <div className="flex flex-wrap gap-2">
              {equipment.map((item: Equipment) => (
                <span
                  key={item.id}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  {item.name}
                </span>
              ))}
            </div>}
            {equipmentItems.length > 0 && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {equipmentItems.map((item) => (
                  <article key={item.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm"><PackageCheck size={18} /></span>
                    <div><div className="font-bold text-slate-900">{item.item_name}</div><div className="mt-1 text-sm text-slate-600">{locale === 'ky' ? 'Саны' : 'Количество'}: {item.quantity}</div>{item.notes && <p className="mt-2 text-xs leading-5 text-slate-500">{item.notes}</p>}</div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section id="materials" className="mt-6 scroll-mt-28 rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_44px_rgba(15,23,42,0.05)]">
        <div className="rounded-t-[27px] border-b border-slate-200 bg-slate-50 px-5 py-4">
          <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-slate-600">
            <FileText size={18} />
            {copy.downloads}
          </h2>
        </div>
        <div className="p-6 md:p-8">
          <LabResources resources={resources} locale={locale} />
        </div>
      </section>
    </div>
  )
}
