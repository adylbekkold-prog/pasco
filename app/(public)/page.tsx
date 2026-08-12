import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, Boxes, CheckCircle2, FlaskConical, Search, Wrench, type LucideIcon } from 'lucide-react'
import DataStatusBanner from '@/components/DataStatusBanner'
import LabCard from '@/components/LabCard'
import SearchBar from '@/components/SearchBar'
import { getPublicDataErrorMessage, shouldLogDataError } from '@/lib/data-errors'
import { getSiteDescription, pluralizeLabs, siteConfig } from '@/lib/content'
import { getCurrentLocale } from '@/lib/locale-server'
import { getLabs, getSubjects } from '@/lib/queries'
import type { Lab, Subject } from '@/types'
import { getPublicCopy } from '@/lib/i18n/public'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale()

  return {
    title: siteConfig.name,
    description: getSiteDescription(locale),
    alternates: {
      canonical: '/',
    },
  }
}

export default async function HomePage() {
  const locale = await getCurrentLocale()
  const copy = getPublicCopy(locale, 'home')
  let subjects: Subject[] = []
  let labs: Lab[] = []
  let dataIssue: string | null = null

  try {
    ;[subjects, labs] = await Promise.all([getSubjects(locale), getLabs({ locale })])
  } catch (error) {
    dataIssue = getPublicDataErrorMessage(error, locale)
    if (shouldLogDataError(error)) console.error(error)
  }

  const featuredLabs = labs.slice(0, 3)
  const gradeCount = new Set(labs.map((lab) => lab.grades?.level).filter(Boolean)).size
  const quickSteps: Array<{ icon: LucideIcon; label: string }> = [
    { icon: FlaskConical, label: locale === 'ky' ? 'Даяр ишти тандаңыз' : 'Выберите готовую работу' },
    { icon: Wrench, label: locale === 'ky' ? 'Жабдууну текшериңиз' : 'Проверьте оборудование' },
    { icon: Boxes, label: locale === 'ky' ? 'Кадамдар боюнча иштеңиз' : 'Следуйте по шагам' },
  ]

  return (
    <div>
      <section className="relative overflow-hidden bg-[var(--navy)] py-12 text-white md:py-16 lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(54,116,232,0.35),transparent_32%),radial-gradient(circle_at_15%_90%,rgba(214,163,59,0.16),transparent_30%)]" />
        <div className="page-container relative grid items-center gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:gap-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-blue-100">
              <FlaskConical size={15} aria-hidden="true" />
              {copy.kicker}
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[1.04] tracking-[-0.055em] sm:text-5xl lg:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">{copy.intro}</p>
            <div className="mt-8 max-w-3xl">
              <SearchBar placeholder={copy.searchPlaceholder} locale={locale} variant="hero" />
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-300" />{pluralizeLabs(labs.length, locale)}</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-300" />{subjects.length} {locale === 'ky' ? 'предмет' : 'предмета'}</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-300" />{gradeCount} {locale === 'ky' ? 'класс' : 'классов'}</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="absolute -inset-6 rounded-[40px] bg-blue-400/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[30px] border border-white/15 bg-white/10 p-5 shadow-[0_32px_80px_rgba(0,0,0,0.28)] backdrop-blur-md md:p-6">
              <div className="rounded-[24px] bg-white p-5 text-[var(--text)] md:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">PASCO LAB</div>
                    <div className="mt-2 text-xl font-bold">{locale === 'ky' ? 'Сабакты тез даярдоо' : 'Быстрая подготовка к уроку'}</div>
                  </div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[var(--primary)]"><Search size={22} /></span>
                </div>
                <div className="mt-6 grid gap-3">
                  {quickSteps.map(({ icon: Icon, label }, index) => (
                    <div key={label} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-slate-50 px-4 py-3.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm"><Icon size={17} /></span>
                      <span className="text-sm font-bold text-slate-700">{index + 1}. {label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {dataIssue && <div className="page-container pt-8"><DataStatusBanner message={dataIssue} locale={locale} /></div>}

      <section className="page-container py-16 md:py-20">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="section-eyebrow">{locale === 'ky' ? 'Предметтер' : 'Предметы'}</span>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.045em] md:text-4xl">{copy.subjectsTitle}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-base">{copy.subjectsText}</p>
          </div>
          <Link href="/subjects" className="button-secondary shrink-0">{locale === 'ky' ? 'Бардык предметтер' : 'Все предметы'}<ArrowRight size={16} /></Link>
        </div>

        {subjects.length === 0 ? (
          <div className="surface-card mt-8 px-6 py-14 text-center text-[var(--muted)]">{copy.empty}</div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => {
              const subjectLabs = labs.filter((lab) => lab.subjects?.slug === subject.slug)
              return (
                <Link key={subject.id} href={`/labs?subject=${subject.slug}`} className="group surface-card flex min-h-48 flex-col p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-[var(--shadow-md)]">
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl" style={{ backgroundColor: `${subject.color ?? '#1d57c8'}18` }}>{subject.icon}</span>
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: subject.color ?? '#1d57c8' }} />
                  </div>
                  <h3 className="mt-6 text-xl font-bold tracking-[-0.025em] group-hover:text-[var(--primary)]">{subject.name}</h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">{pluralizeLabs(subjectLabs.length, locale)}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-[var(--primary)]">{copy.openCatalog}<ArrowRight size={15} /></span>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <section className="border-y border-[var(--border)] bg-white py-16 md:py-20">
        <div className="page-container">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="section-eyebrow">{copy.featuredKicker}</span>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.045em] md:text-4xl">{copy.featuredTitle}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-base">{copy.featuredText}</p>
            </div>
            <Link href="/labs" className="button-primary shrink-0">{copy.allLabs}<ArrowRight size={16} /></Link>
          </div>
          {featuredLabs.length > 0 && <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{featuredLabs.map((lab) => <LabCard key={lab.id} lab={lab} locale={locale} />)}</div>}
        </div>
      </section>

      <section id="how-it-works" className="page-container py-16 md:py-20">
        <span className="section-eyebrow">{copy.howKicker}</span>
        <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-[-0.045em] md:text-4xl">{copy.howTitle}</h2>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {copy.howSteps.map(([title, text]: [string, string], index: number) => (
            <article key={title} className="surface-card p-6 md:p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--navy)] text-sm font-bold text-white">0{index + 1}</span>
              <h3 className="mt-6 text-xl font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-container pb-16 md:pb-20">
        <div className="overflow-hidden rounded-[30px] bg-[var(--navy)] p-7 text-white shadow-[var(--shadow-lg)] md:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div>
            <span className="inline-flex rounded-full border border-amber-200/20 bg-amber-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-amber-200">{copy.kitsKicker}</span>
            <h2 className="mt-5 max-w-3xl text-3xl font-bold tracking-[-0.045em] md:text-4xl">{copy.kitsTitle}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{copy.kitsText}</p>
          </div>
          <Link href="/pasco-kits" className="mt-7 inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-300 px-5 text-sm font-black text-slate-950 shadow-[0_14px_34px_rgba(251,191,36,0.34)] ring-1 ring-black/10 transition hover:-translate-y-1 hover:bg-amber-200 hover:shadow-[0_18px_42px_rgba(251,191,36,0.42)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200 lg:mt-0">{copy.openKits}<ArrowRight size={16} /></Link>
        </div>
      </section>

      <section id="contact" className="page-container pb-6">
        <div className="surface-card grid gap-6 p-7 md:p-9 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <span className="section-eyebrow">{copy.contactKicker}</span>
            <h2 className="mt-4 text-2xl font-bold tracking-[-0.035em] md:text-3xl">{copy.contactTitle}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">{copy.contactText}</p>
          </div>
          <Link href="/labs" className="button-primary">{copy.openCatalog}<ArrowRight size={16} /></Link>
        </div>
      </section>
    </div>
  )
}
