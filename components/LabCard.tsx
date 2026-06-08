import Link from 'next/link'
import {
  ArrowRight,
  BookOpenText,
  Target,
  Wrench,
} from 'lucide-react'
import type { Lab, Locale } from '@/types'

interface LabCardProps {
  lab: Lab
  locale?: Locale
}

export default function LabCard({ lab, locale = 'ru' }: LabCardProps) {
  const subjectColor = lab.subjects?.color ?? '#1255d9'
  const copy =
    locale === 'ky'
      ? {
          topic: 'Тема',
          goal: 'Максат',
          equipment: 'Жабдуу',
          noGrade: 'Класс көрсөтүлгөн эмес',
          noGoal: 'Максат көрсөтүлгөн эмес',
          noTopic: 'Тема көрсөтүлгөн эмес',
          noEquipment: 'Жабдуу көрсөтүлгөн эмес',
          open: 'Лабораторияны ачуу',
        }
      : {
          topic: 'Тема',
          goal: 'Цель',
          equipment: 'Оборудование',
          noGrade: 'Класс не указан',
          noGoal: 'Цель не указана',
          noTopic: 'Тема не указана',
          noEquipment: 'Оборудование не указано',
          open: 'Открыть лабораторную',
        }

  return (
    <Link
      href={`/labs/${lab.slug}`}
      className="group block rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.05)] transition duration-300 hover:border-blue-200 hover:shadow-[0_20px_54px_rgba(15,23,42,0.10)] md:p-6"
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-start">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl"
          style={{ backgroundColor: `${subjectColor}18` }}
        >
          {lab.subjects?.icon ?? '🔬'}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {lab.subjects && (
              <span
                className="rounded-full px-3 py-1.5 text-xs font-semibold"
                style={{ backgroundColor: `${subjectColor}16`, color: subjectColor }}
              >
                {lab.subjects.name}
              </span>
            )}
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
              {lab.grades?.label ?? copy.noGrade}
            </span>
          </div>

          <div className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
            {lab.title}
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            <InfoBlock
              icon={<Target size={16} />}
              label={copy.goal}
              value={lab.goal ?? copy.noGoal}
            />
            <InfoBlock
              icon={<BookOpenText size={16} />}
              label={copy.topic}
              value={lab.topic ?? lab.content ?? copy.noTopic}
            />
            <InfoBlock
              icon={<Wrench size={16} />}
              label={copy.equipment}
              value={lab.equipment && lab.equipment.length > 0 ? lab.equipment[0].name : copy.noEquipment}
            />
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 md:flex-row md:items-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#1647c5] px-4 py-2.5 text-sm font-semibold text-white transition group-hover:bg-[#123ba5] md:ml-auto">
              {copy.open}
              <ArrowRight size={15} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function InfoBlock({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-sm leading-6 text-slate-700">{value}</div>
    </div>
  )
}
