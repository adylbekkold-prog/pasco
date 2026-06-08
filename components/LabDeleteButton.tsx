'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteLabAction } from '@/app/actions/lab.actions'
import type { Locale } from '@/types'

export default function LabDeleteButton({
  labId,
  labTitle,
  locale = 'ru',
}: {
  labId: string
  labTitle: string
  locale?: Locale
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    const confirmed = window.confirm(
      locale === 'ky'
        ? `«${labTitle}» лабораториясын өчүрөсүзбү?\n\nАга байланышкан кадамдар жана материалдар да өчүрүлөт. Бул аракетти артка кайтаруу мүмкүн эмес.`
        : `Удалить лабораторию «${labTitle}»?\n\nБудут удалены связанные шаги и материалы. Это действие нельзя отменить.`
    )

    if (!confirmed) return

    startTransition(async () => {
      await deleteLabAction(labId, locale)
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="btn-danger disabled:opacity-40"
    >
      {isPending
        ? locale === 'ky'
          ? 'Өчүрүлүүдө...'
          : 'Удаляем...'
        : locale === 'ky'
          ? 'Өчүрүү'
          : 'Удалить'}
    </button>
  )
}
