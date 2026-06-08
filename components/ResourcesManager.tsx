'use client'

import { useState, type FormEvent } from 'react'
import { Plus, Trash2, FileText, Music, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Resource, ResourceType } from '@/types'

interface ResourcesManagerProps {
  labId: string
  resources?: Resource[]
  onResourcesChange?: (resources: Resource[]) => void
  locale?: 'ru' | 'ky'
}

const RESOURCE_TYPES = [
  { value: 'pdf' as const, label: '📄 PDF', accept: '.pdf' },
  { value: 'image' as const, label: '🖼️ Изображение', accept: 'image/*' },
  { value: 'video' as const, label: '🎥 Видео', accept: 'video/*' },
  { value: 'worksheet' as const, label: '📋 Word/Документ', accept: '.doc,.docx,.xlsx,.xls,.pptx' },
  { value: 'link' as const, label: '🔗 Ссылка', accept: '' },
] as const

const RESOURCE_TYPES_KY = [
  { value: 'pdf' as const, label: '📄 PDF', accept: '.pdf' },
  { value: 'image' as const, label: '🖼️ Сүрөт', accept: 'image/*' },
  { value: 'video' as const, label: '🎥 Видео', accept: 'video/*' },
  { value: 'worksheet' as const, label: '📋 Word/Документ', accept: '.doc,.docx,.xlsx,.xls,.pptx' },
  { value: 'link' as const, label: '🔗 Шилтеме', accept: '' },
] as const

const labels = {
  ru: {
    title: 'Ресурсы лаборатории',
    add: '+ Добавить ресурс',
    type: 'Тип ресурса',
    resourceTitle: 'Название ресурса',
    url: 'URL или загрузить файл',
    upload: 'Загрузить',
    delete: 'Удалить',
    noResources: 'Ресурсы не добавлены',
    uploading: 'Загрузка...',
    uploaded: 'Загружено',
  },
  ky: {
    title: 'Лабораториянын ресурстары',
    add: '+ Ресурс кошуу',
    type: 'Ресурстун түрү',
    resourceTitle: 'Ресурстун аталышы',
    url: 'URL же файлды жүктөө',
    upload: 'Жүктөө',
    delete: 'Өчүрүү',
    noResources: 'Ресурстар кошулган жок',
    uploading: 'Жүктөлүүдө...',
    uploaded: 'Жүктөлүмдү',
  },
}

interface NewResource {
  id: string
  resource_type: ResourceType
  title: string
  url: string
  file_size: number | null
  isNew?: boolean
}

export default function ResourcesManager({
  labId,
  resources = [],
  onResourcesChange,
  locale = 'ru',
}: ResourcesManagerProps) {
  const copy = labels[locale]
  const resourceTypes = locale === 'ky' ? RESOURCE_TYPES_KY : RESOURCE_TYPES
  const [newResources, setNewResources] = useState<NewResource[]>([])
  const [uploading, setUploading] = useState<string | null>(null)

  const addResource = () => {
    const id = `new-${Date.now()}`
    const newResource: NewResource = {
      id,
      resource_type: 'pdf',
      title: '',
      url: '',
      file_size: null,
      isNew: true,
    }
    setNewResources([...newResources, newResource])
  }

  const removeResource = (id: string) => {
    setNewResources(newResources.filter((r) => r.id !== id))
  }

  const updateResource = (id: string, updates: Partial<NewResource>) => {
    setNewResources(
      newResources.map((r) => (r.id === id ? { ...r, ...updates } : r))
    )
  }

  const handleFileUpload = async (resourceId: string, event: React.ChangeEvent<HTMLInputElement>) => {
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
        throw new Error('error' in data ? data.error : 'Не удалось загрузить файл')
      }

      updateResource(resourceId, {
        url: data.url,
        title: data.fileName,
        file_size: data.size,
      })
    } catch (error) {
      console.error('Upload error:', error)
      alert('Не удалось загрузить файл')
    } finally {
      setUploading(null)
    }
  }

  const currentResources = [
    ...resources.map((r) => ({ ...r, id: r.id, isNew: false })),
    ...newResources,
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">{copy.title}</h3>

        <div className="space-y-4">
          {currentResources.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{copy.noResources}</p>
          ) : (
            currentResources.map((resource) => (
              <div
                key={resource.id}
                className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex gap-3">
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label className="text-sm font-medium">{copy.type}</Label>
                      <select
                        value={resource.resource_type}
                        onChange={(e) =>
                          updateResource(resource.id, {
                            resource_type: e.target.value as ResourceType,
                          })
                        }
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {resourceTypes.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">{copy.resourceTitle}</Label>
                      <Input
                        type="text"
                        value={resource.title}
                        onChange={(e) =>
                          updateResource(resource.id, { title: e.target.value })
                        }
                        placeholder="Название ресурса"
                        className="mt-1"
                      />
                    </div>

                    {resource.resource_type === 'link' ? (
                      <div>
                        <Label className="text-sm font-medium">URL</Label>
                        <Input
                          type="url"
                          value={resource.url}
                          onChange={(e) =>
                            updateResource(resource.id, { url: e.target.value })
                          }
                          placeholder="https://example.com"
                          className="mt-1"
                        />
                      </div>
                    ) : (
                      <div>
                        <Label className="text-sm font-medium">{copy.url}</Label>
                        <div className="flex gap-2 mt-1">
                          <input
                            type="file"
                            id={`file-${resource.id}`}
                            onChange={(e) => handleFileUpload(resource.id, e)}
                            accept={
                              resourceTypes.find((t) => t.value === resource.resource_type)?.accept
                            }
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById(`file-${resource.id}`)?.click()}
                            disabled={uploading === resource.id}
                            className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {uploading === resource.id ? copy.uploading : copy.upload}
                          </button>
                          {resource.url && (
                            <div className="flex-1 px-3 py-2 bg-green-50 border border-green-300 rounded-md text-green-700 text-sm flex items-center">
                              ✓ {copy.uploaded}
                            </div>
                          )}
                        </div>
                        {resource.url && (
                          <div className="mt-2 text-xs text-gray-600 truncate">
                            {resource.url}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeResource(resource.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                    title={copy.delete}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
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

      {/* Hidden input to store resources for form submission */}
      <input
        type="hidden"
        name="resources"
        value={JSON.stringify(
      currentResources.map((r) => ({
          id: r.id,
          resource_type: r.resource_type,
          title: r.title,
          url: r.url,
          file_size: r.file_size ?? null,
        }))
      )}
    />
  </div>
  )
}
