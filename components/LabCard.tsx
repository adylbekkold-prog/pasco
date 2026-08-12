import Link from 'next/link'
import { ArrowUpRight, Clock3, FlaskConical, Gauge, Wrench } from 'lucide-react'
import ResponsiveImage from '@/components/ResponsiveImage'
import { getDifficultyLabel } from '@/lib/content'
import { getLabPhotoUrl } from '@/lib/lab-photo-url'
import type { Lab, Locale } from '@/types'

interface LabCardProps {
  lab: Lab
  locale?: Locale
}

export default function LabCard({ lab, locale = 'ru' }: LabCardProps) {
  const subjectColor = lab.subjects?.color ?? '#1d57c8'
  const imageUrl = getLabPhotoUrl(lab)
  const copy = locale === 'ky'
    ? { open: 'Ишти ачуу', equipment: 'жабдуу', minutes: 'мүнөт', class: 'Класс' }
    : { open: 'Открыть работу', equipment: 'позиций', minutes: 'мин', class: 'Класс' }

  return (
    <Link
      href={`/labs/${lab.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-[var(--border)] bg-white shadow-[var(--shadow-sm)] transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
        {imageUrl ? (
          <ResponsiveImage
            src={imageUrl}
            alt={lab.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
          />
        ) : (
          <div
            className="flex h-full items-center justify-center"
            style={{ background: `radial-gradient(circle at 75% 20%, ${subjectColor}30, transparent 38%), linear-gradient(145deg, #f8fbff, #eef3f8)` }}
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-[26px] border border-white/80 bg-white/80 text-4xl shadow-lg backdrop-blur-sm">
              {lab.subjects?.icon ?? <FlaskConical size={30} className="text-[var(--primary)]" />}
            </span>
          </div>
        )}
        {lab.subjects && (
          <span
            className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur"
            style={{ color: subjectColor }}
          >
            {lab.subjects.icon} {lab.subjects.name}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1.5">{lab.grades?.label ?? copy.class}</span>
          {lab.duration_minutes ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5"><Clock3 size={13} />{lab.duration_minutes} {copy.minutes}</span>
          ) : null}
          {lab.difficulty ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[var(--primary)]"><Gauge size={13} />{getDifficultyLabel(lab.difficulty, locale)}</span>
          ) : null}
        </div>

        <h3 className="mt-4 line-clamp-2 text-xl font-bold leading-snug tracking-[-0.025em] text-[var(--text)] transition group-hover:text-[var(--primary)]">
          {lab.title}
        </h3>

        {lab.content && <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--muted)]">{lab.content}</p>}

        <div className="mt-auto pt-5">
          {(lab.equipment?.length ?? 0) > 0 && (
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
              <Wrench size={14} aria-hidden="true" />
              {lab.equipment!.length} {copy.equipment}
            </div>
          )}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-sm font-bold text-[var(--primary)]">{copy.open}</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[var(--primary)] transition group-hover:bg-[var(--primary)] group-hover:text-white">
              <ArrowUpRight size={17} aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
