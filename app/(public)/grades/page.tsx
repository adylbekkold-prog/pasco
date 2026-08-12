// D:\pasco-lab-portal\app\(public)\grades\page.tsx
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { pluralizeLabs } from '@/lib/content'
import { getCurrentLocale } from '@/lib/locale-server'
import { getGrades, getLabs } from '@/lib/queries'
import type { Lab, Grade } from '@/types'
import { getPublicCopy } from '@/lib/i18n/public'

export const revalidate = 60
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale()
  const copy = getPublicCopy(locale, 'grades')

  return {
    title: copy.title,
    description: copy.intro,
    alternates: {
      canonical: '/grades',
    },
  }
}

export default async function GradesPage() {
  const locale = await getCurrentLocale()
  const copy = getPublicCopy(locale, 'grades')
  let grades: Grade[] = [], labs: Lab[] = []
  try { [grades, labs] = await Promise.all([getGrades(locale), getLabs({ locale })]) } catch (error) { console.error(error) }
  const labCountByGrade = grades.reduce((acc, grade) => { acc[grade.level] = labs.filter(lab => lab.grades?.level === grade.level).length; return acc }, {} as Record<number, number>)
  return (
    <div className="pb-20 pt-8"><section className="mx-auto w-[min(1180px,calc(100%-32px))] rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-8"><div className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#1647c5]">{copy.kicker}</div><h1 className="mt-5 max-w-4xl text-3xl font-semibold tracking-[-0.04em] text-slate-950 md:text-4xl">{copy.title}</h1><p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{copy.intro}</p>{grades.length === 0 ? <div className="mt-12 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center text-slate-500">{copy.empty}</div> : <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{grades.map(grade => (<Link key={grade.level} href={`/labs?grade=${grade.level}`} className="group rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 text-center shadow-[0_12px_32px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_16px_48px_rgba(15,23,42,0.08)]"><div className="text-3xl font-bold tracking-[-0.03em] text-[#1647c5]">{grade.label}</div><p className="mt-2 text-xs text-slate-500">{copy.ages}</p><div className="mt-4 text-sm text-slate-600">{pluralizeLabs(labCountByGrade[grade.level] || 0, locale)}</div><div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#1647c5] transition group-hover:gap-2">{copy.toLabs}<ArrowRight size={12} /></div></Link>))}</div>}</section></div>
  )
}
