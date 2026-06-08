'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { pluralizeLabs } from '@/lib/content'
import type { Grade, Lab, Locale, Subject } from '@/types'

interface SubjectLabBrowserProps {
  labs: Lab[]
  grades: Grade[]
  subject: Subject
  initialGrade?: string
  locale: Locale
}

export default function SubjectLabBrowser({
  labs,
  grades,
  subject,
  initialGrade,
  locale,
}: SubjectLabBrowserProps) {
  const [selectedGrade, setSelectedGrade] = useState(initialGrade ?? '')
  const copy = getCopy(locale)
  const filteredLabs = useMemo(
    () =>
      selectedGrade
        ? labs.filter((lab) => String(lab.grades?.level) === selectedGrade)
        : labs,
    [labs, selectedGrade]
  )
  const activeGrade = grades.find((grade) => String(grade.level) === selectedGrade)

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      setSelectedGrade(params.get('grade') ?? '')
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const selectGrade = (grade: string) => {
    setSelectedGrade(grade)

    const params = new URLSearchParams(window.location.search)
    params.set('subject', subject.slug)

    if (grade) {
      params.set('grade', grade)
    } else {
      params.delete('grade')
    }

    params.delete('search')
    window.history.pushState(null, '', `/labs?${params.toString()}`)
  }

  return (
    <section className="mx-auto mt-6 w-[min(1120px,calc(100%-32px))] rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
      <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <div>
          <div className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">
            {copy.classTitle}
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{copy.classText}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <GradeButton active={!selectedGrade} onClick={() => selectGrade('')}>
              {copy.allGrades}
            </GradeButton>
            {grades.map((grade) => (
              <GradeButton
                key={grade.id}
                active={selectedGrade === String(grade.level)}
                onClick={() => selectGrade(String(grade.level))}
              >
                {grade.label}
              </GradeButton>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {subject.name}: {copy.resultsTitle}
              </div>
              {activeGrade && <div className="mt-1 text-sm text-slate-500">{activeGrade.label}</div>}
            </div>
            <div className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {pluralizeLabs(filteredLabs.length, locale)}
            </div>
          </div>

          <div className="mt-5">
            {filteredLabs.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
                <Sparkles className="mx-auto text-slate-400" size={32} />
                <div className="mt-4 text-xl font-semibold tracking-[-0.03em] text-slate-950">
                  {copy.emptyTitle}
                </div>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-600">
                  {copy.emptyText}
                </p>
              </div>
            ) : (
              <LabTopicList labs={filteredLabs} locale={locale} />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function GradeButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
        active
          ? 'border-blue-200 bg-blue-50 text-[#1647c5] shadow-sm'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950'
      }`}
    >
      {children}
    </button>
  )
}

function LabTopicList({ labs, locale }: { labs: Lab[]; locale: Locale }) {
  const copy = getCopy(locale)

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_44px_rgba(15,23,42,0.05)]">
      {labs.map((lab, index) => {
        const title = lab.title || copy.noTopic

        return (
          <Link
            key={lab.id}
            href={`/labs/${lab.slug}`}
            className="group grid gap-4 border-b border-slate-200 px-5 py-5 transition last:border-b-0 hover:bg-slate-50 md:grid-cols-[72px_1fr_auto] md:items-center"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-sm font-bold text-[#1647c5]">
              {String(index + 1).padStart(2, '0')}
            </div>

            <div className="min-w-0">
              <div className="text-lg font-semibold leading-7 text-slate-950">{title}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                  {lab.grades?.label ?? copy.noGrade}
                </span>
              </div>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#1647c5] px-4 py-2.5 text-sm font-semibold text-white transition group-hover:bg-[#123ba5]">
              {copy.open}
              <ArrowRight size={15} />
            </span>
          </Link>
        )
      })}
    </div>
  )
}

function getCopy(locale: Locale) {
  return locale === 'ky'
    ? {
        allGrades: 'Бардык класстар',
        classTitle: 'Классты тандаңыз',
        classText: 'Класс тандалбаса, предметтин бардык лабораториялары көрсөтүлөт.',
        emptyTitle: 'Бул класс үчүн лаборатория табылган жок',
        emptyText: 'Башка классты тандаңыз же бардык класстарды көрсөтүңүз.',
        noGrade: 'Класс көрсөтүлгөн эмес',
        noTopic: 'Тема көрсөтүлгөн эмес',
        open: 'Ачуу',
        resultsTitle: 'лабораториялык иштер',
        topic: 'Тема',
      }
    : {
        allGrades: 'Все классы',
        classTitle: 'Выберите класс',
        classText: 'Если класс не выбран, показываются все лабораторные этого предмета.',
        emptyTitle: 'Для этого класса лабораторных пока нет',
        emptyText: 'Выберите другой класс или покажите все классы.',
        noGrade: 'Класс не указан',
        noTopic: 'Тема не указана',
        open: 'Открыть',
        resultsTitle: 'лабораторные работы',
        topic: 'Тема',
      }
}
