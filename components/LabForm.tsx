'use client'

import { useState, type FormEvent } from 'react'
import { createLabAction } from '@/app/actions/lab.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ResourcesManager from '@/components/ResourcesManager'
import EquipmentPhotoBrowser from '@/components/EquipmentPhotoBrowser'
import type { Equipment, Grade, Locale, Subject } from '@/types'

interface LabFormProps {
  subjects: Subject[]
  grades: Grade[]
  equipment: Equipment[]
  locale?: Locale
}

function getPublishValue(event: FormEvent<HTMLFormElement>) {
  const submitEvent = event.nativeEvent as SubmitEvent
  const submitter = submitEvent.submitter

  if (submitter instanceof HTMLButtonElement) {
    return submitter.dataset.publish === 'true'
  }

  return false
}

function getCopy(locale: Locale) {
  if (locale === 'ky') {
    return {
      sections: {
        main: 'Негизги маалымат',
        content: 'Мазмуну',
        photos: 'Фотографиялар',
        equipment: 'Жабдуулар',
        publish: 'Жарыялоо',
      },
      fields: {
        title: 'Лабораториянын аталышы',
        content: 'Лабораториянын мазмуну',
        subject: 'Предмет',
        grade: 'Класс',
        equipment: 'Жабдуулар',
      },
      placeholders: {
        title: 'Мисалы: Ом мыйзамын изилдөө',
        content: 'Лабораториянын толук сүрөттөлүшү, максаты жана ишти ондустануу тартиби',
      },
      selects: {
        subject: 'Предметти тандаңыз',
        grade: 'Классты тандаңыз',
      },
      publishText:
        'Черновик админкада гана калат. Жарыялангандан кийин лаборатория каталогдо көрүнөт.',
      saveDraft: 'Черновик кылып сактоо',
      publish: 'Лабораторияны жарыялоо',
      saving: 'Сакталууда...',
      error: 'Лабораторияны сактоо мүмкүн болгон жок.',
    }
  }

  return {
    sections: {
      main: 'Основная информация',
      content: 'Содержание',
      photos: 'Фотографии',
      equipment: 'Оборудование',
      publish: 'Публикация',
    },
    fields: {
      title: 'Название лаборатории',
      content: 'Содержание лаборатории',
      subject: 'Предмет',
      grade: 'Класс',
      equipment: 'Оборудование',
    },
    placeholders: {
      title: 'Например: Изучение закона Ома',
      content:
        'Полное описание лаборатории, её цель и порядок проведения работы',
    },
    selects: {
      subject: 'Выберите предмет',
      grade: 'Выберите класс',
    },
    publishText:
      'Черновик остаётся только в админке. После публикации лаборатория появится в каталоге.',
    saveDraft: 'Сохранить как черновик',
    publish: 'Опубликовать лабораторию',
    saving: 'Сохраняем...',
    error: 'Не удалось сохранить лабораторию.',
  }
}

export default function LabForm({
  subjects,
  grades,
  equipment,
  locale = 'ru',
}: LabFormProps) {
  const copy = getCopy(locale)
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [subjectId, setSubjectId] = useState('')

  const filteredEquipment = subjectId
    ? equipment.filter((eq) => eq.subject_id === subjectId)
    : equipment

  const handleEquipmentToggle = (equipmentId: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(equipmentId)
        ? prev.filter((id) => id !== equipmentId)
        : [...prev, equipmentId]
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    const publish = getPublishValue(event)

    try {
      const formData = new FormData(event.currentTarget)
      formData.set('locale', locale)
      formData.set('equipment_ids', JSON.stringify(selectedEquipment))
      formData.set('photos', JSON.stringify(selectedPhotos))
      formData.set('is_published', String(publish))

      await createLabAction(formData)

      setSelectedEquipment([])
      setSelectedPhotos([])
      setSubjectId('')
      event.currentTarget.reset()
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : copy.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />

      <section className="admin-form-card">
        <div className="admin-form-section-title">{copy.sections.main}</div>

        <div className="space-y-5">
          <div className="form-field">
            <Label htmlFor="title">{copy.fields.title}</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder={copy.placeholders.title}
            />
          </div>

          <div className="form-grid-3">
            <div className="form-field">
              <Label htmlFor="subject_id">{copy.fields.subject}</Label>
              <select
                id="subject_id"
                name="subject_id"
                value={subjectId}
                onChange={(event) => setSubjectId(event.target.value)}
                className="form-select"
                required
              >
                <option value="">{copy.selects.subject}</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.icon} {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <Label htmlFor="grade_id">{copy.fields.grade}</Label>
              <select
                id="grade_id"
                name="grade_id"
                className="form-select"
                required
              >
                <option value="">{copy.selects.grade}</option>
                {grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="admin-form-card">
        <div className="admin-form-section-title">{copy.sections.content}</div>

        <div className="form-field">
          <Label htmlFor="content">{copy.fields.content}</Label>
          <Textarea
            id="content"
            name="content"
            rows={6}
            required
            placeholder={copy.placeholders.content}
          />
        </div>
      </section>

      <section className="admin-form-card">
        <div className="admin-form-section-title">{copy.sections.photos}</div>

        <EquipmentPhotoBrowser 
          equipment={filteredEquipment}
          onPhotosSelect={setSelectedPhotos}
          locale={locale}
        />
      </section>

      <section className="admin-form-card">
        <div className="admin-form-section-title">{copy.sections.equipment}</div>

        {!subjectId ? (
          <p className="text-gray-500 text-sm">
            Сначала выберите предмет, чтобы увидеть доступное оборудование.
          </p>
        ) : filteredEquipment.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Для этого предмета нет оборудования.
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Выберите оборудование, которое будет использоваться в этой лабораторной работе
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEquipment.map((item) => (
                <div
                  key={item.id}
                  className="border-2 rounded-lg p-3 cursor-pointer transition"
                  style={{
                    borderColor: selectedEquipment.includes(item.id)
                      ? '#3b82f6'
                      : '#e5e7eb',
                    backgroundColor: selectedEquipment.includes(item.id)
                      ? '#eff6ff'
                      : 'white',
                  }}
                  onClick={() => handleEquipmentToggle(item.id)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedEquipment.includes(item.id)}
                      onChange={() => {}}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <section className="admin-form-card">
        <ResourcesManager labId="new-lab" locale={locale} />
      </section>

      <section className="admin-form-card">
        <div className="admin-form-section-title">{copy.sections.publish}</div>
        <p className="text-sm text-gray-600 mb-4">{copy.publishText}</p>
        <div className="flex gap-3">
          <Button
            type="submit"
            data-publish="false"
            variant="outline"
            disabled={loading}
          >
            {loading ? copy.saving : copy.saveDraft}
          </Button>
          <Button
            type="submit"
            data-publish="true"
            disabled={loading}
          >
            {loading ? copy.saving : copy.publish}
          </Button>
        </div>
      </section>
    </form>
  )
}
