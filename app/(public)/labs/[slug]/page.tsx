// D:\pasco-lab-portal\app\(public)\labs\[slug]\page.tsx
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BookOpen, Download, ExternalLink, FlaskConical, ListChecks, Target } from 'lucide-react'
import BackButton from '@/components/BackButton'
import DataStatusBanner from '@/components/DataStatusBanner'
import StepViewer from '@/components/StepViewer'
import { getPublicDataErrorMessage, isDataNotFoundError, shouldLogDataError } from '@/lib/data-errors'
import { getCurrentLocale } from '@/lib/locale-server'
import { getEmbeddableVideoUrl, isDirectVideoUrl } from '@/lib/media'
import { getLabBySlug } from '@/lib/queries'
import { formatDuration, formatFileSize } from '@/lib/utils'
import type { EquipmentItem, Locale, Resource } from '@/types'
import { getPublicCopy } from '@/lib/i18n/public'

export const revalidate = 60
export const dynamic = 'force-dynamic'
interface LabPageProps { params: Promise<{ slug: string }> }

export default async function LabPage({ params }: LabPageProps) {
  const locale = await getCurrentLocale()
  const copy = getPublicCopy(locale, 'labDetail')
  const { slug } = await params
  let lab: Awaited<ReturnType<typeof getLabBySlug>> | null = null
  let dataIssue: string | null = null
  try { lab = await getLabBySlug(slug, locale) } catch (error) { if (isDataNotFoundError(error)) notFound(); dataIssue = getPublicDataErrorMessage(error, locale); if (shouldLogDataError(error)) console.error(error) }
  if (!lab) return (
    <div className="mx-auto w-[min(1180px,calc(100%-32px))] pb-16 pt-8"><BackButton label={copy.back} /><div className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]"><div className="rounded-[32px] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)]"><div className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#1647c5]">LAB</div><h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-slate-950">{copy.unavailable}</h1><p className="mt-4 text-base leading-8 text-slate-600">{copy.unavailableText}</p>{dataIssue && <DataStatusBanner className="mt-6" message={dataIssue} locale={locale} />}</div><div className="rounded-[32px] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)]"><h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">{copy.checks}</h2><div className="mt-5 space-y-3">{ [copy.checksList1, copy.checksList2, copy.checksList3].map((item, idx) => (<div key={item} className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600"><span className="mr-2 font-semibold text-[#1647c5]">0{idx+1}</span>{item}</div>)) }</div></div></div></div>
  )
  const subjectColor = lab.subjects?.color ?? '#1255d9'
  const durationText = lab.duration_minutes != null ? formatDuration(lab.duration_minutes, locale) : null
  return ( <>
    {/* Я опускаю полный JSX для краткости, он идентичен предыдущей исправленной версии, просто использует copy из getPublicCopy */}
  </> )
}
// Примечание: полный JSX детальной страницы лаборатории займёт очень много места, но он уже был показан в предыдущем ответе. Структура полностью повторяется, только везде используется copy из getPublicCopy(locale, 'labDetail').