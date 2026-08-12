'use client'

import { useState, type FormEvent } from 'react'
import { updateLabAction } from '@/app/actions/lab.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ResourcesManager from '@/components/ResourcesManager'
import StepBuilder from '@/components/StepBuilder'
import type { Equipment, Grade, Lab, LabStepDraft, Locale, Resource, Subject } from '@/types'

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
        steps: 'Иштин кадамдары',
        difficulty: 'Татаалдыгы',
        duration: 'Узактыгы (мүнөт)',
        title: 'Лабораториянын аталышы',
        subject: 'Предмет',
        grade: 'Класс',
        selectSubject: 'Предметти тандаңыз',
        selectGrade: 'Классты тандаңыз',
        selectEquipment: 'Жабдууларды тандаңыз',
        selectDifficulty: 'Татаалдыкты тандаңыз',
        contentPlaceholder: 'Лабораторианын ичиндегү маалыматты жазыңыз...',
        published: 'Жарыяланган',
        draft: 'Долбоор',
        saved: 'Өзгөртүүлөр сакталды.',
        saveHelp: 'Лабораторияны долбоор катары сактаңыз же жарыяланган версиясын дароо жаңыртыңыз.',
        saveDraft: 'Долбоор катары сактоо',
        saveAndPublish: 'Сактоо жана жарыялоо',
        saving: 'Сакталууда...',
        error: 'Өзгөртүүлөрдү сактоо мүмкүн болгон жок.',
        requiredField: 'Бул талаа сөзсүз токтолгу керек',
        difficultyOptions: ['Баштапкы', 'Орто', 'Тереңдетилген', 'Профи'],
        equipmentEmpty: 'Бул предмет үчүн жабдуу кошула элек.',
        stepsHelp: 'Текстти, сүрөттү, видеону же шилтемени керектүү тартипте кошуңуз.',
      }
    : {
        main: 'Основная информация',
        content: 'Содержание',
        equipment: 'Оборудование',
        steps: 'Пошаговая инструкция',
        difficulty: 'Сложность',
        duration: 'Длительность (минуты)',
        title: 'Название лаборатории',
        subject: 'Предмет',
        grade: 'Класс',
        selectSubject: 'Выберите предмет',
        selectGrade: 'Выберите класс',
        selectEquipment: 'Выберите оборудование',
        selectDifficulty: 'Выберите сложность',
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
        difficultyOptions: ['Базовый', 'Средний', 'Продвинутый', 'Профи'],
        equipmentEmpty: 'Для этого предмета оборудование пока не добавлено.',
        stepsHelp: 'Добавляйте текст, изображения, видео и ссылки в нужном порядке.',
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
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>(lab.equipment_ids ?? [])
  const [resources, setResources] = useState<Resource[]>(lab.resources ?? [])
  const [steps, setSteps] = useState<LabStepDraft[]>(
    (lab.lab_steps ?? []).map((step) => ({
      id: step.id,
      block_type: step.block_type,
      content: step.content ?? '',
      caption: step.caption ?? '',
    }))
  )
  const filteredEquipment = subjectId ? equipment.filter((item) => item.subject_id === subjectId) : equipment

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setSaved(false)
    setError('')

    const publish = getPublishValue(event)

    try {
      const formData = new FormData(event.currentTarget)
      formData.set('locale', locale)
      formData.set('equipment_ids', JSON.stringify(selectedEquipmentIds))
      formData.set('is_published', String(publish))
      formData.set('steps', JSON.stringify(steps))
      formData.set('resources', JSON.stringify(resources))

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

            <div className="form-field">
              <Label htmlFor="edit-difficulty">{copy.difficulty}</Label>
              <select id="edit-difficulty" name="difficulty" defaultValue={lab.difficulty ?? ''} className="form-select">
                <option value="">{copy.selectDifficulty}</option>
                {(['beginner', 'intermediate', 'advanced', 'professional'] as const).map((value, index) => (
                  <option key={value} value={value}>{copy.difficultyOptions[index]}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <Label htmlFor="edit-duration">{copy.duration}</Label>
              <Input id="edit-duration" name="duration_minutes" type="number" min={5} max={480} step={5} defaultValue={lab.duration_minutes ?? ''} placeholder="45" />
            </div>
          </div>
        </div>
      </section>

      <section className="admin-form-card">
        <div className="admin-form-section-title">{copy.equipment}</div>
        {filteredEquipment.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">{copy.equipmentEmpty}</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {filteredEquipment.map((item) => {
              const checked = selectedEquipmentIds.includes(item.id)
              return (
                <label key={item.id} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${checked ? 'border-blue-300 bg-blue-50 text-[var(--primary)]' : 'border-[var(--border)] bg-white text-[var(--text)] hover:border-blue-200'}`}>
                  <input type="checkbox" checked={checked} onChange={() => setSelectedEquipmentIds((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])} className="h-4 w-4 accent-[var(--primary)]" />
                  {item.name}
                </label>
              )
            })}
          </div>
        )}
      </section>

      {/* Content Section */}
      <section className="admin-form-card">
        <div className="admin-form-section-title">{copy.content}</div>

        <div className="space-y-5">
          <div className="form-field">
            <Label htmlFor="edit-content">{copy.content}</Label>
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

      <section className="admin-form-card">
        <div className="admin-form-section-title">{copy.steps}</div>
        <p className="mb-5 text-sm leading-6 text-[var(--muted)]">{copy.stepsHelp}</p>
        <StepBuilder steps={steps} onChange={setSteps} locale={locale} />
      </section>

      {/* Resources Section */}
      <section className="admin-form-card">
        <ResourcesManager
          labId={lab.id}
          resources={resources}
          onChange={setResources}
          locale={locale}
        />
      </section>

      {/* Save Section */}
      <section className="admin-form-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            {saved ? (
              <p role="status" className="text-sm font-semibold text-green-600">{copy.saved}</p>
            ) : (
              <p className="text-sm leading-6 text-slate-600">{copy.saveHelp}</p>
            )}
            {error && <p role="alert" className="mt-3 text-sm font-medium text-red-600">{error}</p>}
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
