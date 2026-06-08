'use client'

import {
  ArrowDown,
  ArrowUp,
  BarChart2,
  FileText,
  ImageIcon,
  Link as LinkIcon,
  Trash2,
  Video,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClientId } from '@/lib/client-id'
import type { LabStepDraft, Locale, StepBlockType } from '@/types'

function getCopy(locale: Locale) {
  if (locale === 'ky') {
    return {
      labels: {
        text: 'Текст',
        image: 'Сүрөт',
        video: 'Видео',
        link: 'Шилтеме',
        diagram: 'Схема',
      } satisfies Record<StepBlockType, string>,
      textPlaceholder: 'Лабораториялык иштин кадамын сүрөттөп жазыңыз...',
      urlPlaceholder: 'URL же файлга жол',
      captionPlaceholder: 'Материалга аталыш же түшүндүрмө',
      empty: 'Азырынча бир да кадам кошула элек. Төмөндөн биринчи блокту тандаңыз.',
    }
  }

  return {
    labels: {
      text: 'Текст',
      image: 'Изображение',
      video: 'Видео',
      link: 'Ссылка',
      diagram: 'Схема',
    } satisfies Record<StepBlockType, string>,
    textPlaceholder: 'Опишите шаг лабораторной работы...',
    urlPlaceholder: 'URL или путь к файлу',
    captionPlaceholder: 'Подпись к материалу',
    empty: 'Пока не добавлено ни одного шага. Выберите первый блок ниже.',
  }
}

const BLOCK_ICONS: Record<StepBlockType, React.ReactNode> = {
  text: <FileText size={14} />,
  image: <ImageIcon size={14} />,
  video: <Video size={14} />,
  link: <LinkIcon size={14} />,
  diagram: <BarChart2 size={14} />,
}

export default function StepBuilder({
  steps,
  onChange,
  locale = 'ru',
}: {
  steps: LabStepDraft[]
  onChange: (steps: LabStepDraft[]) => void
  locale?: Locale
}) {
  const copy = getCopy(locale)

  const addStep = (type: StepBlockType) => {
    onChange([
      ...steps,
      {
        id: createClientId('step'),
        block_type: type,
        content: '',
        caption: '',
      },
    ])
  }

  const updateStep = (id: string, field: keyof LabStepDraft, value: string) => {
    onChange(steps.map((step) => (step.id === id ? { ...step, [field]: value } : step)))
  }

  const removeStep = (id: string) => {
    onChange(steps.filter((step) => step.id !== id))
  }

  const moveStep = (index: number, direction: 1 | -1) => {
    const next = [...steps]
    const targetIndex = index + direction

    if (targetIndex < 0 || targetIndex >= next.length) return

    ;[next[index], next[targetIndex]] = [next[targetIndex], next[index]]
    onChange(next)
  }

  return (
    <div>
      <div className="mb-6">
        {steps.map((step, index) => (
          <div key={step.id} className="step-block">
            <div className="step-block-header">
              <div className="step-block-num">{index + 1}</div>
              <span className="step-block-type">{copy.labels[step.block_type]}</span>

              <div className="step-block-actions">
                <button
                  type="button"
                  className="step-block-action"
                  onClick={() => moveStep(index, -1)}
                  disabled={index === 0}
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  type="button"
                  className="step-block-action"
                  onClick={() => moveStep(index, 1)}
                  disabled={index === steps.length - 1}
                >
                  <ArrowDown size={13} />
                </button>
                <button
                  type="button"
                  className="step-block-action del"
                  onClick={() => removeStep(step.id)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {step.block_type === 'text' ? (
              <Textarea
                placeholder={copy.textPlaceholder}
                value={step.content}
                onChange={(event) => updateStep(step.id, 'content', event.target.value)}
                rows={3}
              />
            ) : (
              <div className="space-y-3">
                <Input
                  placeholder={copy.urlPlaceholder}
                  value={step.content}
                  onChange={(event) => updateStep(step.id, 'content', event.target.value)}
                />
                <Input
                  placeholder={copy.captionPlaceholder}
                  value={step.caption}
                  onChange={(event) => updateStep(step.id, 'caption', event.target.value)}
                />
              </div>
            )}
          </div>
        ))}

        {steps.length === 0 && <div className="admin-empty-state">{copy.empty}</div>}
      </div>

      <div className="step-add-bar">
        {(['text', 'image', 'video', 'link', 'diagram'] as StepBlockType[]).map((type) => (
          <button
            key={type}
            type="button"
            className="step-add-btn"
            onClick={() => addStep(type)}
          >
            {BLOCK_ICONS[type]}
            {copy.labels[type]}
          </button>
        ))}
      </div>
    </div>
  )
}
