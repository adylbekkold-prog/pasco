'use client'

import { useEffect, useState, type ChangeEvent } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Locale, Resource, ResourceType } from '@/types'

interface ResourcesManagerProps {
  labId: string
  resources?: Resource[]
  onChange?: (resources: Resource[]) => void
  locale?: Locale
}

interface DraftResource {
  id: string
  resource_type: ResourceType
  title: string
  description_ru: string
  description_ky: string
  url: string
  file_size: number | null
}

const RESOURCE_TYPES = [
  { value: 'pdf' as const, accept: '.pdf' },
  { value: 'image' as const, accept: 'image/*' },
  { value: 'video' as const, accept: 'video/*' },
  { value: 'worksheet' as const, accept: '.doc,.docx,.xlsx,.xls,.ppt,.pptx,.spklab' },
  { value: 'link' as const, accept: '' },
] as const

const EMPTY_RESOURCES: Resource[] = []

function getCopy(locale: Locale) {
  if (locale === 'ky') {
    return {
      title: 'Лабораториянын ресурстары',
      add: 'Ресурс кошуу',
      type: 'Ресурстун түрү',
      resourceTitle: 'Ресурстун аталышы',
      descriptionRu: 'Сүрөттөмө орусча',
      descriptionKy: 'Сүрөттөмө кыргызча',
      url: 'URL же файл жүктөө',
      upload: 'Жүктөө',
      delete: 'Өчүрүү',
      noResources: 'Ресурстар кошулган жок',
      uploading: 'Жүктөлүүдө...',
      uploaded: 'Жүктөлдү',
      uploadError: 'Файлды жүктөө мүмкүн болгон жок',
      placeholders: {
        title: 'Ресурстун аталышы',
        descriptionRu: 'Орусча сүрөттөмө',
        descriptionKy: 'Кыргызча сүрөттөмө',
      },
      resourceTypes: {
        pdf: 'PDF',
        image: 'Сүрөт',
        video: 'Видео',
        worksheet: 'Документ / PASCO SPARKlab',
        link: 'Шилтеме',
      } as Record<ResourceType, string>,
    }
  }

  return {
    title: 'Ресурсы лаборатории',
    add: 'Добавить ресурс',
    type: 'Тип ресурса',
    resourceTitle: 'Название ресурса',
    descriptionRu: 'Описание на русском',
    descriptionKy: 'Описание на кыргызском',
    url: 'URL или загрузить файл',
    upload: 'Загрузить',
    delete: 'Удалить',
    noResources: 'Ресурсы не добавлены',
    uploading: 'Загрузка...',
    uploaded: 'Загружено',
    uploadError: 'Не удалось загрузить файл',
    placeholders: {
      title: 'Название ресурса',
      descriptionRu: 'Описание на русском языке',
      descriptionKy: 'Описание на кыргызском языке',
    },
    resourceTypes: {
      pdf: 'PDF',
      image: 'Изображение',
      video: 'Видео',
      worksheet: 'Документ / PASCO SPARKlab',
      link: 'Ссылка',
    } as Record<ResourceType, string>,
  }
}

function createResourceId() {
  return globalThis.crypto?.randomUUID?.() ?? `resource-${Date.now()}`
}

function toDraftResource(resource: Resource): DraftResource {
  return {
    id: resource.id,
    resource_type: resource.resource_type,
    title: resource.title,
    description_ru: resource.description_ru ?? resource.description ?? '',
    description_ky: resource.description_ky ?? resource.description ?? '',
    url: resource.url,
    file_size: resource.file_size ?? null,
  }
}

function toResource(resource: DraftResource, labId: string, index: number): Resource {
  const description = resource.description_ru || resource.description_ky || null

  return {
    id: resource.id,
    lab_id: labId,
    resource_type: resource.resource_type,
    title: resource.title,
    title_ru: resource.title,
    title_ky: resource.title,
    description,
    description_ru: resource.description_ru || null,
    description_ky: resource.description_ky || null,
    url: resource.url,
    file_size: resource.file_size,
    sort_order: index,
  }
}

export default function ResourcesManager({
  labId,
  resources,
  onChange,
  locale = 'ru',
}: ResourcesManagerProps) {
  const copy = getCopy(locale)
  const sourceResources = resources ?? EMPTY_RESOURCES
  const [draftResources, setDraftResources] = useState<DraftResource[]>(() =>
    sourceResources.map(toDraftResource)
  )
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => {
    setDraftResources(sourceResources.map(toDraftResource))
  }, [sourceResources])

  const commitResources = (nextResources: DraftResource[]) => {
    setDraftResources(nextResources)
    onChange?.(nextResources.map((resource, index) => toResource(resource, labId, index)))
  }

  const addResource = () => {
    commitResources([
      ...draftResources,
      {
        id: createResourceId(),
        resource_type: 'pdf',
        title: '',
        description_ru: '',
        description_ky: '',
        url: '',
        file_size: null,
      },
    ])
  }

  const removeResource = (id: string) => {
    commitResources(draftResources.filter((resource) => resource.id !== id))
  }

  const updateResource = (id: string, updates: Partial<DraftResource>) => {
    commitResources(
      draftResources.map((resource) => (resource.id === id ? { ...resource, ...updates } : resource))
    )
  }

  const handleFileUpload = async (resourceId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(resourceId)

    try {
      const formData = new FormData()
      formData.set('file', file)
      formData.set('scope', labId || 'public')

      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      })

      const data = (await response.json()) as
        | { url: string; fileName: string; size: number }
        | { error: string }

      if (!response.ok || !('url' in data)) {
        throw new Error('error' in data ? data.error : copy.uploadError)
      }

      updateResource(resourceId, {
        url: data.url,
        title: data.fileName,
        file_size: data.size,
      })
    } catch (error) {
      console.error('Upload error:', error)
      alert(error instanceof Error ? error.message : copy.uploadError)
    } finally {
      setUploading(null)
      event.target.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">{copy.title}</h3>

        <div className="space-y-4">
          {draftResources.length === 0 ? (
            <p className="py-8 text-center text-gray-500">{copy.noResources}</p>
          ) : (
            draftResources.map((resource) => (
              <div
                key={resource.id}
                className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100"
              >
                <div className="grid gap-3 lg:grid-cols-[180px_1fr_auto]">
                  <div>
                    <Label className="text-sm font-medium">{copy.type}</Label>
                    <select
                      value={resource.resource_type}
                      onChange={(e) =>
                        updateResource(resource.id, {
                          resource_type: e.target.value as ResourceType,
                        })
                      }
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {RESOURCE_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {copy.resourceTypes[type.value]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">{copy.resourceTitle}</Label>
                    <Input
                      type="text"
                      value={resource.title}
                      onChange={(e) => updateResource(resource.id, { title: e.target.value })}
                      placeholder={copy.placeholders.title}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-end justify-end">
                    <button
                      type="button"
                      onClick={() => removeResource(resource.id)}
                      className="rounded p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                      title={copy.delete}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium">{copy.descriptionRu}</Label>
                    <textarea
                      value={resource.description_ru}
                      onChange={(e) => updateResource(resource.id, { description_ru: e.target.value })}
                      placeholder={copy.placeholders.descriptionRu}
                      rows={2}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{copy.descriptionKy}</Label>
                    <textarea
                      value={resource.description_ky}
                      onChange={(e) => updateResource(resource.id, { description_ky: e.target.value })}
                      placeholder={copy.placeholders.descriptionKy}
                      rows={2}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {resource.resource_type === 'link' ? (
                  <div>
                    <Label className="text-sm font-medium">URL</Label>
                    <Input
                      type="url"
                      value={resource.url}
                      onChange={(e) => updateResource(resource.id, { url: e.target.value })}
                      placeholder="https://example.com"
                      className="mt-1"
                    />
                  </div>
                ) : (
                  <div>
                    <Label className="text-sm font-medium">{copy.url}</Label>
                    <div className="mt-1 flex gap-2">
                      <input
                        type="file"
                        id={`file-${resource.id}`}
                        onChange={(e) => handleFileUpload(resource.id, e)}
                        accept={RESOURCE_TYPES.find((type) => type.value === resource.resource_type)?.accept}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById(`file-${resource.id}`)?.click()}
                        disabled={uploading === resource.id}
                        className="flex-1 rounded-md bg-blue-100 px-3 py-2 font-medium text-blue-700 transition-colors hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {uploading === resource.id ? copy.uploading : copy.upload}
                      </button>
                      {resource.url && (
                        <div className="flex flex-1 items-center rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
                          {copy.uploaded}
                        </div>
                      )}
                    </div>
                    {resource.url && (
                      <div className="mt-2 truncate text-xs text-gray-600">
                        {resource.url}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <Button
          type="button"
          onClick={addResource}
          variant="outline"
          className="mt-4 w-full"
        >
          {copy.add}
        </Button>
      </div>

      <input
        type="hidden"
        name="resources"
        value={JSON.stringify(
          draftResources.map((resource) => ({
            id: resource.id,
            resource_type: resource.resource_type,
            title: resource.title,
            description_ru: resource.description_ru,
            description_ky: resource.description_ky,
            url: resource.url,
            file_size: resource.file_size,
          }))
        )}
      />
    </div>
  )
}
