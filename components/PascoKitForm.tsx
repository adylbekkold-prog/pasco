'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createPascoKitAction, updatePascoKitAction } from '@/app/actions/pasco-kit.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { adminPath } from '@/lib/admin-routes'
import type { Locale, PascoKit, Subject } from '@/types'

interface PascoKitFormProps {
  subjects: Subject[]
  locale: Locale
  initialKit?: PascoKit | null
  onSuccess?: (kit: PascoKit) => void
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
      },
      placeholders: {
        name: 'Мисалы: Механика комплекти',
        description: 'Комплект эмнеге колдонулат жана анын курамында эмне бар',
      },
      selects: {
        subject: 'Предметти тандаңыз',
      },
      buttons: {
        create: 'Комплект түзүү',
        update: 'Комплектти жаңыртуу',
        saving: 'Сакталууда...',
      },
      saved: 'Комплект сакталды.',
      requiredName: 'Аталышын жазыңыз',
      requiredSubject: 'Предметти тандаңыз',
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
    },
    placeholders: {
      name: 'Например: Комплект по механике',
      description: 'Для чего предназначен комплект и что входит в его состав',
    },
    selects: {
      subject: 'Выберите предмет',
    },
    buttons: {
      create: 'Создать комплект',
      update: 'Обновить комплект',
      saving: 'Сохраняется...',
    },
    saved: 'Комплект сохранен.',
    requiredName: 'Название обязательно',
    requiredSubject: 'Выберите предмет',
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
  const router = useRouter()
  const isEditing = !!initialKit

  const [data, setData] = useState({
    name: initialKit?.name ?? '',
    subject_id: initialKit?.subject_id ?? '',
    description: initialKit?.description ?? '',
    thumbnail_url: initialKit?.thumbnail_url ?? '',
  })

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSaved(false)

    if (!data.name.trim()) {
      setError(copy.requiredName)
      return
    }

    if (!data.subject_id) {
      setError(copy.requiredSubject)
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
          thumbnail_url: data.thumbnail_url || null,
          locale,
        })
      } else {
        kit = await createPascoKitAction({
          name: data.name.trim(),
          subject_id: data.subject_id,
          description: data.description.trim() || null,
          thumbnail_url: data.thumbnail_url || null,
          locale,
        })
      }

      if (onSuccess) {
        onSuccess(kit)
      } else if (isEditing) {
        setSaved(true)
        router.refresh()
        window.setTimeout(() => setSaved(false), 3000)
      } else {
        router.push(adminPath(`/pasco-kits/${kit.id}`))
      }
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
        <div className="section-kicker">PASCO</div>
        <h2 className="section-title">{copy.sections.main}</h2>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {saved && (
        <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          {copy.saved}
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
