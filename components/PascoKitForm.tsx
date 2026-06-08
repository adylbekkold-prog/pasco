'use client'

import { useState, type FormEvent } from 'react'
import { createPascoKitAction, updatePascoKitAction } from '@/app/actions/pasco-kit.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Grade, Locale, PascoKit, Subject } from '@/types'

interface PascoKitFormProps {
  subjects: Subject[]
  locale: Locale
  initialKit?: PascoKit | null
  onSuccess: (kit: PascoKit) => void
}

function getCopy(locale: Locale) {
  if (locale === 'ky') {
    return {
      sections: {
        main: 'Негизги маалымат',
      },
      fields: {
        name: 'Комплекттин аталышы',
        subject: 'Предмет',
        description: 'Сүрөттөлүшү',
        thumbnail: 'Миниатюрасы',
      },
      placeholders: {
        name: 'Мисалы: Механика комплекти',
        description: 'Комплект эмне үчүн колдонулат жана анын мазмуну',
      },
      selects: {
        subject: 'Предметти тандаңыз',
      },
      buttons: {
        create: 'Комплект түзүү',
        update: 'Комплекти жаңыртуу',
        saving: 'Сакталууда...',
        cancel: 'Жокко чыгуу',
      },
      error: 'Ката кетти',
    }
  }

  return {
    sections: {
      main: 'Основная информация',
    },
    fields: {
      name: 'Название комплекта',
      subject: 'Предмет',
      description: 'Описание',
      thumbnail: 'Миниатюра',
    },
    placeholders: {
      name: 'например: Комплект по механике',
      description: 'Для чего предназначен этот комплект и что в него входит',
    },
    selects: {
      subject: 'Выберите предмет',
    },
    buttons: {
      create: 'Создать комплект',
      update: 'Обновить комплект',
      saving: 'Сохраняется...',
      cancel: 'Отмена',
    },
    error: 'Произошла ошибка',
  }
}

export function PascoKitForm({
  subjects,
  locale,
  initialKit,
  onSuccess,
}: PascoKitFormProps) {
  const copy = getCopy(locale)
  const isEditing = !!initialKit

  const [data, setData] = useState({
    name: initialKit?.name ?? '',
    subject_id: initialKit?.subject_id ?? '',
    description: initialKit?.description ?? '',
    thumbnail_url: initialKit?.thumbnail_url ?? '',
  })

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!data.name.trim()) {
      setError('Название обязательно')
      return
    }

    if (!data.subject_id) {
      setError('Выберите предмет')
      return
    }

    try {
      setIsSaving(true)

      let kit: PascoKit
      if (isEditing && initialKit) {
        kit = await updatePascoKitAction(initialKit.id, {
          name: data.name.trim(),
          subject_id: data.subject_id,
          description: data.description.trim() || null,
          thumbnail_url: data.thumbnail_url,
        })
      } else {
        kit = await createPascoKitAction({
          name: data.name.trim(),
          subject_id: data.subject_id,
          description: data.description.trim() || null,
          thumbnail_url: data.thumbnail_url,
        })
      }

      onSuccess(kit)
    } catch (error) {
      setError(error instanceof Error ? error.message : copy.error)
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="section-kicker">Комплект</div>
        <h2 className="section-title">{copy.sections.main}</h2>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        <div>
          <Label>{copy.fields.name}</Label>
          <Input
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            placeholder={copy.placeholders.name}
            disabled={isSaving}
          />
        </div>

        <div>
          <Label>{copy.fields.subject}</Label>
          <select
            value={data.subject_id}
            onChange={(e) => setData({ ...data, subject_id: e.target.value })}
            disabled={isSaving}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">{copy.selects.subject}</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>{copy.fields.description}</Label>
          <Textarea
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            placeholder={copy.placeholders.description}
            disabled={isSaving}
            rows={4}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? copy.buttons.saving : (isEditing ? copy.buttons.update : copy.buttons.create)}
        </Button>
      </div>
    </form>
  )
}
