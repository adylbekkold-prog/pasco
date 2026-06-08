// D:\pasco-lab-portal\app\(public)\labs\page.tsx
import Link from 'next/link'
import { Metadata } from 'next'
import DataStatusBanner from '@/components/DataStatusBanner'
import LabCard from '@/components/LabCard'
import LabFilters from '@/components/LabFilters'
import SearchBar from '@/components/SearchBar'
import { pluralizeLabs } from '@/lib/content'
import { getPublicDataErrorMessage, shouldLogDataError } from '@/lib/data-errors'
import { getCurrentLocale } from '@/lib/locale-server'
import { getGrades, getLabs, getSubjects } from '@/lib/queries'
import type { Grade, Lab, Locale, Subject } from '@/types'
import { getPublicCopy } from '@/lib/i18n/public'

export const revalidate = 60
export const dynamic = 'force-dynamic'
interface LabsPageProps { searchParams: Promise<{ subject?: string; grade?: string; search?: string; sort?: string }> }
export async function generateMetadata(): Promise<Metadata> { const locale = await getCurrentLocale(); return { title: locale === 'ky' ? 'Лабораториялык иштер' : 'Лабораторные работы', description: locale === 'ky' ? 'PASCO лабораториялык иштердин толук каталогу' : 'Полный каталог лабораторных работ PASCO' } }
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
    <div className="pb-20 pt-8"><section className="mx-auto w-[min(1280px,calc(100%-32px))] rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-8"><div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]"><div><div className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#1647c5]">{copy.kicker}</div><h1 className="mt-5 max-w-4xl text-3xl font-semibold tracking-[-0.04em] text-slate-950 md:text-4xl">{copy.title}</h1><p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{copy.intro}</p><p className="mt-5 text-sm font-semibold text-slate-900">{labs.length} {pluralizeLabs(labs.length, locale)}</p></div><div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5"><SearchBar initialQuery={searchQuery ?? ''} locale={locale} variant="hero" /><p className="mt-4 text-sm leading-6 text-slate-600">{copy.searchHint}</p></div></div>{dataIssue && <DataStatusBanner className="mt-8" message={dataIssue} locale={locale} />}<div className="mt-8"><LabFilters subjects={subjects} grades={grades} currentSubject={subjectSlug} currentGrade={gradeValue} locale={locale} showDescriptions /></div><div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6"><div className="text-sm text-slate-600">{hasFilters ? copy.filtered : copy.allLabs}</div><div className="text-sm font-semibold text-slate-950">{labs.length} {pluralizeLabs(labs.length, locale)}</div></div>{labs.length === 0 ? (<div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center text-slate-500"><div className="mx-auto max-w-xl"><div className="text-xl font-semibold tracking-[-0.03em] text-slate-950">{copy.emptyTitle}</div><p className="mt-3 text-sm leading-7 text-slate-600">{copy.emptyText}</p><Link href="/labs" className="mt-6 inline-flex items-center rounded-full bg-[#1647c5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123ba5]">{copy.clear}</Link></div></div>) : (<div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{labs.map(lab => <LabCard key={lab.id} lab={lab} locale={locale} />)}</div>)}</section></div>
  )
}