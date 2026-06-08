'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { Grade, Locale, Subject } from '@/types'

interface LabFiltersProps {
  subjects: Subject[]
  grades: Grade[]
  currentSubject?: string
  currentGrade?: string
  locale?: Locale
  showSubjectFilter?: boolean
  showDescriptions?: boolean
}

export default function LabFilters({
  subjects,
  grades,
  currentSubject,
  currentGrade,
  locale = 'ru',
  showSubjectFilter = true,
  showDescriptions = true,
}: LabFiltersProps) {
  const params = useSearchParams()
  const copy =
    locale === 'ky'
      ? {
          subject: 'Предметти тандаңыз',
          grade: 'Классты тандаңыз',
          subjectHint: 'Эң оңой башталыш ушу. Адегенде предметти тандасаңыз жетиштүү.',
          gradeHint: 'Керек болсо классты тактаңыз. Тандабасаңыз бардык класстар калат.',
          allSubjects: 'Бардык предметтер',
          allGrades: 'Бардык класстар',
        }
      : {
          subject: 'Выберите предмет',
          grade: 'Выберите класс',
          subjectHint: 'Это самый простой способ начать. Сначала достаточно выбрать только предмет.',
          gradeHint: 'Если нужно, уточните класс. Если не выбирать, останутся все классы.',
          allSubjects: 'Все предметы',
          allGrades: 'Все классы',
        }

  const buildFilterHref = (key: string, value: string) => {
    const nextParams = new URLSearchParams(params.toString())

    if (value) nextParams.set(key, value)
    else nextParams.delete(key)

    if (currentSubject || key === 'subject') {
      nextParams.delete('search')
    }

    const nextQuery = nextParams.toString()
    return nextQuery ? `/labs?${nextQuery}` : '/labs'
  }

  return (
    <div className="space-y-6">
      {showSubjectFilter && (
        <FilterRow title={copy.subject} description={showDescriptions ? copy.subjectHint : undefined}>
          <FilterButton active={!currentSubject} href={buildFilterHref('subject', '')}>
            {copy.allSubjects}
          </FilterButton>
          {subjects.map((subject) => (
            <FilterButton
              key={subject.id}
              active={currentSubject === subject.slug}
              href={buildFilterHref('subject', subject.slug)}
            >
              <span className="mr-2">{subject.icon}</span>
              {subject.name}
            </FilterButton>
          ))}
        </FilterRow>
      )}

      <FilterRow title={copy.grade} description={showDescriptions ? copy.gradeHint : undefined}>
        <FilterButton active={!currentGrade} href={buildFilterHref('grade', '')}>
          {copy.allGrades}
        </FilterButton>
        {grades.map((grade) => (
          <FilterButton
            key={grade.id}
            active={currentGrade === String(grade.level)}
            href={buildFilterHref('grade', String(grade.level))}
          >
            {grade.label}
          </FilterButton>
        ))}
      </FilterRow>
    </div>
  )
}

function FilterRow({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="text-base font-semibold text-slate-950">{title}</div>
      {description && <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>}
      <div className="mt-4 flex flex-wrap gap-3">{children}</div>
    </div>
  )
}

function FilterButton({
  active,
  children,
  href,
}: {
  active: boolean
  children: React.ReactNode
  href: string
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
        active
          ? 'border-blue-200 bg-blue-50 text-[#1647c5] shadow-sm'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950'
      }`}
    >
      {children}
    </Link>
  )
}
