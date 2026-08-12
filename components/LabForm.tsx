'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createLabAction } from '@/app/actions/lab.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ResourcesManager from '@/components/ResourcesManager'
import EquipmentPhotoBrowser from '@/components/EquipmentPhotoBrowser'
import StepBuilder from '@/components/StepBuilder'
import { adminPath } from '@/lib/admin-routes'
import type { Equipment, Grade, LabStepDraft, Locale, Resource, Subject } from '@/types'

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
        steps: 'Иштин кадамдары',
        publish: 'Жарыялоо',
      },
      fields: {
        title: 'Лабораториянын аталышы',
        content: 'Лабораториянын мазмуну',
        subject: 'Предмет',
        grade: 'Класс',
        equipment: 'Жабдуулар',
        difficulty: 'Татаалдыгы',
        duration: 'Узактыгы (мүнөт)',
      },
      placeholders: {
        title: 'Мисалы: Ом мыйзамын изилдөө',
        content: 'Лабораториянын толук сүрөттөлүшү, максаты жана ишти ондустануу тартиби',
      },
      selects: {
        subject: 'Предметти тандаңыз',
        grade: 'Классты тандаңыз',
        difficulty: 'Татаалдыкты тандаңыз',
      },
      publishText:
        'Долбоор башкаруу панелинде гана калат. Жарыялангандан кийин лаборатория каталогдо көрүнөт.',
      saveDraft: 'Долбоор катары сактоо',
      publish: 'Лабораторияны жарыялоо',
      saving: 'Сакталууда...',
      error: 'Лабораторияны сактоо мүмкүн болгон жок.',
      difficultyOptions: ['Баштапкы', 'Орто', 'Тереңдетилген', 'Профи'],
      equipmentEmpty: 'Бул предмет үчүн жабдуу кошула элек.',
      stepsHelp: 'Текстти, сүрөттү, видеону же шилтемени керектүү тартипте кошуңуз.',
    }
  }

  return {
    sections: {
      main: 'Основная информация',
      content: 'Содержание',
      photos: 'Фотографии',
      equipment: 'Оборудование',
      steps: 'Пошаговая инструкция',
      publish: 'Публикация',
    },
    fields: {
      title: 'Название лаборатории',
      content: 'Содержание лаборатории',
      subject: 'Предмет',
      grade: 'Класс',
      equipment: 'Оборудование',
      difficulty: 'Сложность',
      duration: 'Длительность (минуты)',
    },
    placeholders: {
      title: 'Например: Изучение закона Ома',
      content:
        'Полное описание лаборатории, её цель и порядок проведения работы',
    },
    selects: {
      subject: 'Выберите предмет',
      grade: 'Выберите класс',
      difficulty: 'Выберите сложность',
    },
    publishText:
      'Черновик остаётся только в админке. После публикации лаборатория появится в каталоге.',
    saveDraft: 'Сохранить как черновик',
    publish: 'Опубликовать лабораторию',
    saving: 'Сохраняем...',
    error: 'Не удалось сохранить лабораторию.',
    difficultyOptions: ['Базовый', 'Средний', 'Продвинутый', 'Профи'],
    equipmentEmpty: 'Для этого предмета оборудование пока не добавлено.',
    stepsHelp: 'Добавляйте текст, изображения, видео и ссылки в нужном порядке.',
  }
}

export default function LabForm({
  subjects,
  grades,
  equipment,
  locale = 'ru',
}: LabFormProps) {
  const router = useRouter()
  const copy = getCopy(locale)
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([])
  const [steps, setSteps] = useState<LabStepDraft[]>([])
  const [resources, setResources] = useState<Resource[]>([])

  const filteredEquipment = subjectId
    ? equipment.filter((eq) => eq.subject_id === subjectId)
    : equipment

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    const publish = getPublishValue(event)

    try {
      const formData = new FormData(event.currentTarget)
      formData.set('locale', locale)
      formData.set('equipment_ids', JSON.stringify(selectedEquipmentIds))
      formData.set('photos', JSON.stringify(selectedPhotos))
      formData.set('steps', JSON.stringify(steps))
      formData.set('resources', JSON.stringify(resources))
      formData.set('is_published', String(publish))

      await createLabAction(formData)

      // Redirect to labs list on success
      router.push(adminPath('/labs'))
      router.refresh()
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

            <div className="form-field">
              <Label htmlFor="difficulty">{copy.fields.difficulty}</Label>
              <select id="difficulty" name="difficulty" className="form-select" defaultValue="">
                <option value="">{copy.selects.difficulty}</option>
                {(['beginner', 'intermediate', 'advanced', 'professional'] as const).map((value, index) => (
                  <option key={value} value={value}>{copy.difficultyOptions[index]}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <Label htmlFor="duration_minutes">{copy.fields.duration}</Label>
              <Input id="duration_minutes" name="duration_minutes" type="number" min={5} max={480} step={5} placeholder="45" />
            </div>
          </div>
        </div>
      </section>

      <section className="admin-form-card">
        <div className="admin-form-section-title">{copy.sections.equipment}</div>
        {filteredEquipment.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">{copy.equipmentEmpty}</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {filteredEquipment.map((item) => {
              const checked = selectedEquipmentIds.includes(item.id)
              return (
                <label key={item.id} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${checked ? 'border-blue-300 bg-blue-50 text-[var(--primary)]' : 'border-[var(--border)] bg-white text-[var(--text)] hover:border-blue-200'}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setSelectedEquipmentIds((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])}
                    className="h-4 w-4 accent-[var(--primary)]"
                  />
                  {item.name}
                </label>
              )
            })}
          </div>
        )}
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
        <div className="admin-form-section-title">{copy.sections.steps}</div>
        <p className="mb-5 text-sm leading-6 text-[var(--muted)]">{copy.stepsHelp}</p>
        <StepBuilder steps={steps} onChange={setSteps} locale={locale} />
      </section>

      <section className="admin-form-card">
        <div className="admin-form-section-title">{copy.sections.photos}</div>

        <EquipmentPhotoBrowser 
          equipment={filteredEquipment}
          onPhotosSelect={setSelectedPhotos}
          locale={locale}
        />
      </section>


      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <section className="admin-form-card">
        <ResourcesManager
          labId="new-lab"
          resources={resources}
          onChange={setResources}
          locale={locale}
        />
      </section>

      <section className="admin-form-card">
        <div className="admin-form-section-title">{copy.sections.publish}</div>
        <p className="text-sm text-gray-600 mb-4">{copy.publishText}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            type="submit"
            data-publish="false"
            variant="outline"
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? copy.saving : copy.saveDraft}
          </Button>
          <Button
            type="submit"
            data-publish="true"
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? copy.saving : copy.publish}
          </Button>
        </div>
      </section>
    </form>
  )
}
