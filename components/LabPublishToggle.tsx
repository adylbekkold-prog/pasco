'use client'

import { useState, useTransition } from 'react'
import { togglePublishAction } from '@/app/actions/lab.actions'
import type { Locale } from '@/types'

export default function LabPublishToggle({
  labId,
  isPublished,
  locale = 'ru',
}: {
  labId: string
  isPublished: boolean
  locale?: Locale
}) {
  const [published, setPublished] = useState(isPublished)
  const [isPending, startTransition] = useTransition()

  const toggle = () => {
    const nextPublished = !published
    setPublished(nextPublished)

    startTransition(async () => {
      await togglePublishAction(labId, nextPublished, locale)
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className={`status-pill ${
        published ? 'status-published' : 'status-draft'
      } ${isPending ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      {isPending
        ? locale === 'ky'
          ? 'Сакталууда...'
          : 'Сохраняем...'
        : published
          ? locale === 'ky'
            ? 'Жарыяланган'
            : 'Опубликовано'
          : locale === 'ky'
            ? 'Черновик'
            : 'Черновик'}
    </button>
  )
}
