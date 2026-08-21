/* eslint-disable @next/next/no-img-element */

import { ExternalLink } from 'lucide-react'
import { getEmbeddableVideoUrl, isDirectVideoUrl, isImageUrl, isSafeResourceUrl } from '@/lib/media'
import type { LabStep, Locale } from '@/types'

export default function StepViewer({
  steps,
  locale = 'ru',
}: {
  steps: LabStep[]
  locale?: Locale
}) {
  const copy =
    locale === 'ky'
      ? {
          step: 'Кадам',
          imageAlt: 'Кадамдын сүрөтү',
          diagramAlt: 'Лабораториянын схемасы',
          openVideo: 'Видеону ачуу',
        }
      : {
          step: 'Шаг',
          imageAlt: 'Иллюстрация шага',
          diagramAlt: 'Схема лаборатории',
          openVideo: 'Открыть видео',
        }

  return (
    <div className="lab-steps">
      {steps.map((step, index) => (
        <article key={step.id} className="lab-step">
          <div className="lab-step-num">{index + 1}</div>
          <div className="lab-step-content">
            <div className="lab-step-label">
              {copy.step} {index + 1}
            </div>

            {step.block_type === 'text' && <p className="lab-step-text">{step.content}</p>}

            {step.block_type === 'image' && step.content && isSafeImageUrl(step.content) && (
              <MediaFrame caption={step.caption}>
                <div className="lab-step-media">
                  <img
                    src={step.content}
                    alt={step.caption ?? copy.imageAlt}
                    className="h-auto max-h-[420px] w-full object-contain"
                    loading="lazy"
                  />
                </div>
              </MediaFrame>
            )}

            {step.block_type === 'video' && step.content && (
              <MediaFrame caption={step.caption}>
                <StepVideo url={step.content} label={step.caption ?? step.content} locale={locale} />
              </MediaFrame>
            )}

            {step.block_type === 'link' && step.content && isSafeResourceUrl(step.content) && (
              <a
                href={step.content}
                target="_blank"
                rel="noopener noreferrer"
                className="lab-step-link"
              >
                <ExternalLink size={14} />
                {step.caption ?? step.content}
              </a>
            )}

            {step.block_type === 'diagram' && step.content && isSafeImageUrl(step.content) && (
              <MediaFrame caption={step.caption}>
                <div className="lab-step-media">
                  <img
                    src={step.content}
                    alt={step.caption ?? copy.diagramAlt}
                    className="h-auto max-h-72 w-full object-contain"
                    loading="lazy"
                  />
                </div>
              </MediaFrame>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}

function StepVideo({
  url,
  label,
  locale,
}: {
  url: string
  label: string
  locale: Locale
}) {
  if (!isSafeResourceUrl(url)) return null

  const embedUrl = getEmbeddableVideoUrl(url)

  if (embedUrl) {
    return (
      <div className="lab-step-media overflow-hidden rounded-[18px]">
        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            title={label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      </div>
    )
  }

  if (isDirectVideoUrl(url)) {
    return (
      <div className="lab-step-media">
        <video controls preload="metadata" className="w-full bg-gray-900">
          <source src={url} />
        </video>
      </div>
    )
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="lab-step-link">
      <ExternalLink size={14} />
      {locale === 'ky' ? 'Видеону ачуу' : 'Открыть видео'}
    </a>
  )
}

function isSafeImageUrl(url: string) {
  return isSafeResourceUrl(url) && isImageUrl(url)
}

function MediaFrame({
  caption,
  children,
}: {
  caption: string | null
  children: React.ReactNode
}) {
  return (
    <div>
      {children}
      {caption && <p className="lab-step-caption">{caption}</p>}
    </div>
  )
}
