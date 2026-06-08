'use client'

import { useState, type FormEvent } from 'react'
import { updateLabAction } from '@/app/actions/lab.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ResourcesManager from '@/components/ResourcesManager'
import type { Equipment, Grade, Lab, Locale, Subject } from '@/types'

interface LabEditFormProps {
  lab: Lab
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
  return locale === 'ky'
    ? {
        main: 'Негизги маалымат',
        content: 'Мазмуну',
        equipment: 'Жабдуулар',
        title: 'Лабораториянын аталышы',
        subject: 'Предмет',
        grade: 'Класс',
        selectSubject: 'Предметти тандаңыз',
        selectGrade: 'Классты тандаңыз',
        selectEquipment: 'Жабдууларды тандаңыз',
        contentPlaceholder: 'Лабораторианын ичиндегү маалыматты жазыңыз...',
        published: 'Жарыяланган',
        draft: 'Черновик',
        saved: 'Өзгөртүүлөр сакталды.',
        saveHelp: 'Лабораторияны черновик катары сактаңыз же жарыяланган версиясын дароо жаңыртыңыз.',
        saveDraft: 'Черновик кылып сактоо',
        saveAndPublish: 'Сактоо жана жарыялоо',
        saving: 'Сакталууда...',
        error: 'Өзгөртүүлөрдү сактоо мүмкүн болгон жок.',
        requiredField: 'Бул талаа сөзсүз токтолгу керек',
      }
    : {
        main: 'Основная информация',
        content: 'Содержание',
        equipment: 'Оборудование',
        title: 'Название лаборатории',
        subject: 'Предмет',
        grade: 'Класс',
        selectSubject: 'Выберите предмет',
        selectGrade: 'Выберите класс',
        selectEquipment: 'Выберите оборудование',
        contentPlaceholder: 'Введите содержание лабораторной работы...',
        published: 'Опубликовано',
        draft: 'Черновик',
        saved: 'Изменения сохранены.',
        saveHelp: 'Сохраните лабораторию как черновик или сразу обновите опубликованную версию.',
        saveDraft: 'Сохранить как черновик',
        saveAndPublish: 'Сохранить и опубликовать',
        saving: 'Сохраняем...',
        error: 'Не удалось сохранить изменения.',
        requiredField: 'Это поле обязательно',
      }
}

export default function LabEditForm({
  lab,
  subjects,
  grades,
  equipment,
  locale = 'ru',
}: LabEditFormProps) {
  const copy = getCopy(locale)
  const [subjectId, setSubjectId] = useState(lab.subject_id ?? '')
  const [publishedState, setPublishedState] = useState(lab.is_published)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setSaved(false)
    setError('')

    const publish = getPublishValue(event)

    try {
      const formData = new FormData(event.currentTarget)
      formData.set('locale', locale)
      formData.set('equipment_ids', JSON.stringify(lab.equipment_ids ?? []))
      formData.set('is_published', String(publish))

      await updateLabAction(lab.id, formData)
      setPublishedState(publish)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 3000)
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : copy.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />

      {/* Main Information Section */}
      <section className="admin-form-card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="admin-form-section-title mb-0 border-none pb-0">{copy.main}</div>
          <span className={`status-pill ${publishedState ? 'status-published' : 'status-draft'}`}>
            {publishedState ? copy.published : copy.draft}
          </span>
        </div>

        <div className="space-y-5">
          <div className="form-field">
            <Label htmlFor="edit-title">{copy.title}</Label>
            <Input id="edit-title" name="title" defaultValue={lab.title} required />
          </div>

          <div className="form-grid-3">
            <div className="form-field">
              <Label htmlFor="edit-subject">{copy.subject}</Label>
              <select
                id="edit-subject"
                name="subject_id"
                value={subjectId}
                onChange={(event) => setSubjectId(event.target.value)}
                className="form-select"
                required
              >
                <option value="">{copy.selectSubject}</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.icon} {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <Label htmlFor="edit-grade">{copy.grade}</Label>
              <select id="edit-grade" name="grade_id" defaultValue={lab.grade_id ?? ''} className="form-select" required>
                <option value="">{copy.selectGrade}</option>
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

      {/* Content Section */}
      <section className="admin-form-card">
        <div className="admin-form-section-title">{copy.content}</div>

        <div className="space-y-5">
          <div className="form-field">
            <Label htmlFor="edit-content">Содержание</Label>
            <Textarea
              id="edit-content"
              name="content"
              rows={6}
              defaultValue={lab.content ?? ''}
              placeholder={copy.contentPlaceholder}
              required
            />
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="admin-form-card">
        <ResourcesManager labId={lab.id} resources={lab.resources} locale={locale} />
      </section>

      {/* Save Section */}
      <section className="admin-form-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            {saved ? (
              <p className="text-sm font-semibold text-green-600">{copy.saved}</p>
            ) : (
              <p className="text-sm leading-6 text-slate-600">{copy.saveHelp}</p>
            )}
            {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" variant="outline" disabled={loading} data-publish="false">
              {copy.saveDraft}
            </Button>
            <Button type="submit" disabled={loading} data-publish="true">
              {loading ? copy.saving : copy.saveAndPublish}
            </Button>
          </div>
        </div>
      </section>
    </form>
  )
}
