// D:\pasco-lab-portal\app\(public)\page.tsx
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import DataStatusBanner from '@/components/DataStatusBanner'
import { getPublicDataErrorMessage, shouldLogDataError } from '@/lib/data-errors'
import { pluralizeLabs } from '@/lib/content'
import { getCurrentLocale } from '@/lib/locale-server'
import { getLabs, getSubjects } from '@/lib/queries'
import type { Lab, Subject } from '@/types'
import { getPublicCopy } from '@/lib/i18n/public'

export const revalidate = 60
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const locale = await getCurrentLocale()
  const copy = getPublicCopy(locale, 'home')
  let subjects: Subject[] = [], labs: Lab[] = [], dataIssue: string | null = null
  try { [subjects, labs] = await Promise.all([getSubjects(locale), getLabs({ locale })]) } catch (error) { dataIssue = getPublicDataErrorMessage(error, locale); if (shouldLogDataError(error)) console.error(error) }
  return (
    <div className="py-12"><section className="mx-auto w-[min(1180px,calc(100%-32px))]"><div className="mb-12"><div className="inline-flex rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">{copy.kicker}</div><h1 className="mt-4 text-5xl font-bold tracking-[-0.03em] text-[var(--text)] md:text-6xl">{copy.title}</h1><p className="mt-4 text-lg leading-8 text-[var(--muted)] max-w-2xl">{copy.intro}</p></div>{dataIssue && <DataStatusBanner className="mb-8" message={dataIssue} locale={locale} />}{subjects.length === 0 ? <div className="rounded-lg border border-[var(--border)] bg-[var(--background-2)] px-8 py-16 text-center text-[var(--muted)]">{copy.empty}</div> : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{subjects.map(subject => { const subjectLabs = labs.filter(lab => lab.subjects?.slug === subject.slug); return (<Link key={subject.id} href={`/subjects?subject=${subject.slug}`} className="group card overflow-hidden border-2 border-[var(--border)]"><div className="p-6 flex flex-col h-full"><div className="flex items-start justify-between gap-4 mb-4"><div className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl flex-shrink-0" style={{ backgroundColor: `${subject.color ?? '#0066cc'}20` }}>{subject.icon}</div><div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: subject.color ?? '#0066cc' }} /></div><h3 className="text-xl font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition">{subject.name}</h3><p className="mt-2 text-sm text-[var(--muted)] flex-grow">{subjectLabs.length} {pluralizeLabs(subjectLabs.length, locale)}</p><div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] group-hover:gap-3 transition">{copy.openCatalog}<ArrowRight size={16} /></div></div></Link>)})}</div>}</section></div>
  )
}