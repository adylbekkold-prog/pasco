// D:\pasco-lab-portal\app\(public)\labs\page.tsx
import Link from 'next/link'
import { Metadata } from 'next'
import { SlidersHorizontal } from 'lucide-react'
import DataStatusBanner from '@/components/DataStatusBanner'
import LabCard from '@/components/LabCard'
import LabFilters from '@/components/LabFilters'
import SearchBar from '@/components/SearchBar'
import { pluralizeLabs } from '@/lib/content'
import { getPublicDataErrorMessage, shouldLogDataError } from '@/lib/data-errors'
import { getCurrentLocale } from '@/lib/locale-server'
import { getGrades, getLabs, getSubjects } from '@/lib/queries'
import type { Grade, Lab, Subject } from '@/types'
import { getPublicCopy } from '@/lib/i18n/public'

export const revalidate = 60
export const dynamic = 'force-dynamic'
interface LabsPageProps { searchParams: Promise<{ subject?: string; grade?: string; search?: string; sort?: string }> }
export async function generateMetadata(): Promise<Metadata> { const locale = await getCurrentLocale(); return { title: locale === 'ky' ? 'Лабораториялык иштер' : 'Лабораторные работы', description: locale === 'ky' ? 'PASCO лабораториялык иштердин толук каталогу' : 'Полный каталог лабораторных работ PASCO', alternates: { canonical: '/labs' } } }
function normalizeParam(value?: string | string[]) { return Array.isArray(value) ? value[0] : value }

export default async function LabsPage({ searchParams }: LabsPageProps) {
  const locale = await getCurrentLocale()
  const copy = getPublicCopy(locale, 'labsCatalog')
  const params = await searchParams
  const subjectSlug = normalizeParam(params.subject)
  const gradeValue = normalizeParam(params.grade)
  const searchQuery = normalizeParam(params.search)
  const sortBy = normalizeParam(params.sort)
  const gradeLevel = gradeValue ? Number.parseInt(gradeValue, 10) : undefined
  let subjects: Subject[] = [], grades: Grade[] = [], labs: Lab[] = [], dataIssue: string | null = null
  try { [subjects, grades, labs] = await Promise.all([getSubjects(locale), getGrades(locale), getLabs({ locale, subjectSlug, gradeLevel, search: searchQuery })]) } catch (error) { dataIssue = getPublicDataErrorMessage(error, locale); if (shouldLogDataError(error)) console.error(error) }
  if (sortBy === 'new' && labs.length) labs = [...labs].sort((a, b) => (new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()))
  const hasFilters = Boolean(subjectSlug || gradeValue || searchQuery)

  return (
    <div className="pb-20 pt-6 md:pt-8">
      <div className="page-container">
        {/* Hero section */}
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-6 md:p-8 lg:p-10">
              <div className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#1647c5]">
                {copy.kicker}
              </div>
              <h1 className="mt-5 max-w-2xl text-3xl font-bold tracking-[-0.04em] text-slate-900 md:text-4xl">
                {copy.title}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-500">
                {copy.intro}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                  {pluralizeLabs(labs.length, locale)}
                </span>
              </div>
            </div>
            <div className="border-t border-slate-200 bg-slate-50 p-6 md:p-8 lg:border-l lg:border-t-0">
              <SearchBar initialQuery={searchQuery ?? ''} locale={locale} variant="hero" />
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {copy.searchHint}
              </p>
            </div>
          </div>
        </div>

        {dataIssue && <DataStatusBanner className="mt-6" message={dataIssue} locale={locale} />}

        {/* Filters section */}
        <details className="mt-6 rounded-[20px] border border-slate-200 bg-white shadow-sm lg:hidden">
          <summary className="flex min-h-14 list-none items-center justify-between gap-3 px-5 text-sm font-bold text-slate-900">
            <span className="inline-flex items-center gap-2"><SlidersHorizontal size={17} />{locale === 'ky' ? 'Чыпкалар' : 'Фильтры'}</span>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs text-[var(--primary)]">{hasFilters ? (locale === 'ky' ? 'Тандалды' : 'Активны') : (locale === 'ky' ? 'Баары' : 'Все')}</span>
          </summary>
          <div className="border-t border-slate-200 p-5">
            <LabFilters subjects={subjects} grades={grades} currentSubject={subjectSlug} currentGrade={gradeValue} locale={locale} showDescriptions={false} />
          </div>
        </details>

        <div className="mt-6 hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6 lg:block">
          <LabFilters
            subjects={subjects}
            grades={grades}
            currentSubject={subjectSlug}
            currentGrade={gradeValue}
            locale={locale}
            showDescriptions
          />
        </div>

        {/* Results count bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-500">
            {hasFilters ? copy.filtered : copy.allLabs}
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-700">
            {pluralizeLabs(labs.length, locale)}
          </div>
        </div>

        {/* Labs grid */}
        {labs.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
            <div className="mx-auto max-w-md">
              <div className="text-xl font-bold tracking-[-0.03em] text-slate-900">
                {copy.emptyTitle}
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                {copy.emptyText}
              </p>
              <Link
                href="/labs"
                className="mt-6 inline-flex items-center rounded-full bg-[#1647c5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123ba5]"
              >
                {copy.clear}
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {labs.map(lab => <LabCard key={lab.id} lab={lab} locale={locale} />)}
          </div>
        )}
      </div>
    </div>
  )
}
