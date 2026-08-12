'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import {
  Download,
  FileText,
  FolderOpen,
  ImageIcon,
  LoaderCircle,
  Plus,
  Trash2,
  Video,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClientId } from '@/lib/client-id'
import type { Locale, Resource, ResourceType } from '@/types'

function getCopy(locale: Locale) {
  if (locale === 'ky') {
    return {
      resourceTypes: {
        pdf: 'PDF',
        worksheet: 'Документ / SPARKlab',
        image: 'Сүрөт',
        video: 'Видео',
        link: 'Шилтеме',
      } as Record<ResourceType, string>,
      uploads: [
        {
          type: 'pdf' as const,
          label: 'PDF жүктөө',
          accept: 'application/pdf',
          icon: <FileText size={18} />,
          helper: 'Нускама, методикалык файл же жумуш барагы',
        },
        {
          type: 'image' as const,
          label: 'Сүрөт жүктөө',
          accept: 'image/*',
          icon: <ImageIcon size={18} />,
          helper: 'Түзүлүштүн сүрөтү, схема же иллюстрация',
        },
        {
          type: 'video' as const,
          label: 'Видео жүктөө',
          accept: 'video/*',
          icon: <Video size={18} />,
          helper: 'Лаборатория үчүн жергиликтүү MP4 же WebM',
        },
        {
          type: 'worksheet' as const,
          label: 'SPARKlab жүктөө',
          accept: '.spklab',
          icon: <FileText size={18} />,
          helper: 'PASCO SPARKvue үчүн .spklab лаборатория файлы',
        },
      ],
      addLink: 'Шилтеме кошуу',
      videoLink: 'Шилтеме менен видео',
      title: 'Материалдар жана видео',
      intro:
        'Бул жерге PDF, сүрөттөр, жергиликтүү видеолор, PASCO SPARKlab файлдары жана кадимки шилтемелер сакталат. Файлдардын өзү сервер компьютерде, ал эми жергиликтүү базада алардын жазуулары гана сакталат.',
      storageTitle: 'Видео жана документтер кайда сакталат',
      storageText:
        'Файл долбоордун папкасында жергиликтүү сакталат, ал эми ал жөнүндө жазуу `data/local-db` файлдарында болот.',
      chooseFile: 'Файл тандоо',
      uploading: 'Жүктөлүүдө...',
      empty:
        'Азырынча материалдар кошула элек. Видео, PDF, сүрөт же SPARKlab файлын жүктөңүз же шилтеме кошуңуз.',
      manualLink: 'Жаңы шилтеме',
      manualVideo: 'Шилтеме менен видео',
      manualDefault: 'Жаңы материал',
      uploadError: 'Файлды жүктөө мүмкүн болгон жок.',
      titleLabel: 'Аталышы',
      urlLabel: 'Шилтеме же файл жолу',
      typeLabel: 'Түрү',
      open: 'Ачуу',
      remove: 'Өчүрүү',
    }
  }

  return {
    resourceTypes: {
      pdf: 'PDF',
      worksheet: 'Документ / SPARKlab',
      image: 'Изображение',
      video: 'Видео',
      link: 'Ссылка',
    } as Record<ResourceType, string>,
    uploads: [
      {
        type: 'pdf' as const,
        label: 'Загрузить PDF',
        accept: 'application/pdf',
        icon: <FileText size={18} />,
        helper: 'Инструкция, методичка или рабочий лист',
      },
      {
        type: 'image' as const,
        label: 'Загрузить изображение',
        accept: 'image/*',
        icon: <ImageIcon size={18} />,
        helper: 'Фото установки, схема или иллюстрация',
      },
      {
        type: 'video' as const,
        label: 'Загрузить видео',
        accept: 'video/*',
        icon: <Video size={18} />,
        helper: 'Локальный MP4 или WebM для лабораторной',
      },
      {
        type: 'worksheet' as const,
        label: 'Загрузить SPARKlab',
        accept: '.spklab',
        icon: <FileText size={18} />,
        helper: 'Файл лаборатории .spklab для PASCO SPARKvue',
      },
    ],
    addLink: 'Добавить ссылку',
    videoLink: 'Видео по ссылке',
    title: 'Материалы и видео',
    intro:
      'Здесь можно хранить PDF, изображения, локальные видео, PASCO SPARKlab и обычные ссылки. Файлы сохраняются на компьютере сервера, а в локальной базе остаются только их записи.',
    storageTitle: 'Куда сохраняются видео и документы',
    storageText:
      'Сам файл лежит локально в папке проекта, а запись о нём сохраняется в `data/local-db`.',
    chooseFile: 'Нажмите, чтобы выбрать файл',
    uploading: 'Загрузка...',
    empty:
      'Пока материалы не добавлены. Загрузите видео, PDF, изображение, SPARKlab или добавьте ссылку.',
    manualLink: 'Новая ссылка',
    manualVideo: 'Видео по ссылке',
    manualDefault: 'Новый материал',
    uploadError: 'Не удалось загрузить файл.',
    titleLabel: 'Название',
    urlLabel: 'Ссылка или путь к файлу',
    typeLabel: 'Тип',
    open: 'Открыть',
    remove: 'Удалить',
  }
}

function makeResource(type: ResourceType, overrides: Partial<Resource> = {}): Resource {
  return {
    id: overrides.id ?? createClientId('resource'),
    lab_id: overrides.lab_id ?? '',
    resource_type: overrides.resource_type ?? type,
    title: overrides.title ?? '',
    url: overrides.url ?? '',
    file_size: overrides.file_size ?? null,
    sort_order: overrides.sort_order ?? 0,
  }
}

function formatSize(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getStorageHint(scopeId: string) {
  return `/public/uploads/labs/${scopeId}/`
}

export default function ResourceManager({
  scopeId,
  resources,
  onChange,
  locale = 'ru',
}: {
  scopeId: string
  resources: Resource[]
  onChange: (resources: Resource[]) => void
  locale?: Locale
}) {
  const copy = getCopy(locale)
  const [uploadingType, setUploadingType] = useState<ResourceType | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const commit = (nextResources: Resource[]) => {
    onChange(
      nextResources.map((resource, index) => ({
        ...resource,
        sort_order: index,
      }))
    )
  }

  const addManualResource = (type: ResourceType) => {
    commit([
      ...resources,
      makeResource(type, {
        title:
          type === 'link'
            ? copy.manualLink
            : type === 'video'
              ? copy.manualVideo
              : copy.manualDefault,
      }),
    ])
  }

  const updateResource = (id: string, patch: Partial<Resource>) => {
    commit(resources.map((resource) => (resource.id === id ? { ...resource, ...patch } : resource)))
  }

  const removeResource = (id: string) => {
    commit(resources.filter((resource) => resource.id !== id))
  }

  const handleUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    type: Extract<ResourceType, 'pdf' | 'image' | 'video' | 'worksheet'>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingType(type)
    setErrorMessage('')

    try {
      const payload = new FormData()
      payload.set('file', file)
      payload.set('scope', scopeId)

      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: payload,
      })

      const data = (await response.json()) as
        | { url: string; fileName: string; size: number }
        | { error: string }

      if (!response.ok || !('url' in data)) {
        throw new Error('error' in data ? data.error : copy.uploadError)
      }

      commit([
        ...resources,
        makeResource(type, {
          resource_type: type,
          title: data.fileName,
          url: data.url,
          file_size: data.size,
        }),
      ])
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : copy.uploadError)
    } finally {
      setUploadingType(null)
      event.target.value = ''
    }
  }

  return (
    <section className="admin-form-card">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="admin-form-section-title mb-0 border-none pb-0">{copy.title}</div>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.intro}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => addManualResource('link')}>
            <Plus size={14} />
            {copy.addLink}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => addManualResource('video')}>
            <Video size={14} />
            {copy.videoLink}
          </Button>
        </div>
      </div>

      <div className="mb-6 rounded-[16px] border border-[var(--border)] bg-[rgba(255,255,255,.03)] px-4 py-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(30,86,245,.12)] text-[var(--secondary)]">
            <FolderOpen size={18} />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[var(--text)]">{copy.storageTitle}</div>
            <div className="mt-1 break-all font-mono text-xs text-[var(--muted)]">
              {getStorageHint(scopeId)}
            </div>
            <div className="mt-2 text-xs leading-6 text-[var(--muted-soft)]">{copy.storageText}</div>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {copy.uploads.map((target) => (
          <div
            key={target.type}
            className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]"
          >
            <input
              ref={(node) => {
                inputRefs.current[target.type] = node
              }}
              type="file"
              accept={target.accept}
              className="hidden"
              onChange={(event) => handleUpload(event, target.type)}
            />

            <button
              type="button"
              className="flex w-full flex-col items-center gap-3 rounded-[14px] border border-dashed border-[var(--border-strong)] bg-[rgba(255,255,255,.02)] px-4 py-6 text-center transition hover:border-[var(--secondary)] hover:bg-[rgba(0,212,255,.05)]"
              onClick={() => inputRefs.current[target.type]?.click()}
              disabled={uploadingType === target.type}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(30,86,245,.12)] text-[var(--secondary)]">
                {uploadingType === target.type ? (
                  <LoaderCircle size={20} className="animate-spin" />
                ) : (
                  target.icon
                )}
              </span>
              <span className="text-base font-semibold text-[var(--text)]">{target.label}</span>
              <span className="text-xs leading-5 text-[var(--muted)]">{target.helper}</span>
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[11px] font-semibold text-[var(--secondary)]">
                {uploadingType === target.type ? copy.uploading : copy.chooseFile}
              </span>
            </button>
          </div>
        ))}
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-[14px] border border-[rgba(255,77,106,.24)] bg-[rgba(255,77,106,.08)] px-4 py-3 text-sm text-[var(--danger)]">
          {errorMessage}
        </div>
      )}

      {resources.length === 0 ? (
        <div className="admin-empty-state">{copy.empty}</div>
      ) : (
        <div className="space-y-3">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <div className="grid gap-4 lg:grid-cols-[1.2fr_1.2fr_160px_auto] lg:items-end">
                <div className="form-field">
                  <Label>{copy.titleLabel}</Label>
                  <Input
                    value={resource.title}
                    onChange={(event) => updateResource(resource.id, { title: event.target.value })}
                  />
                </div>

                <div className="form-field">
                  <Label>{copy.urlLabel}</Label>
                  <Input
                    value={resource.url}
                    onChange={(event) => updateResource(resource.id, { url: event.target.value })}
                  />
                </div>

                <div className="form-field">
                  <Label>{copy.typeLabel}</Label>
                  <select
                    value={resource.resource_type}
                    onChange={(event) =>
                      updateResource(resource.id, {
                        resource_type: event.target.value as ResourceType,
                      })
                    }
                    className="form-select"
                  >
                    {(Object.entries(copy.resourceTypes) as [ResourceType, string][]).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-[12px] border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--text)]"
                  >
                    <Download size={14} />
                    {copy.open}
                  </a>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeResource(resource.id)}>
                    <Trash2 size={14} />
                    {copy.remove}
                  </Button>
                </div>
              </div>

              {resource.file_size ? (
                <div className="mt-3 text-xs text-[var(--muted-soft)]">{formatSize(resource.file_size)}</div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
