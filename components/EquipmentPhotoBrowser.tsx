'use client'

import { useState, useEffect } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import type { Equipment, Locale } from '@/types'

interface EquipmentPhotoBrowserProps {
  equipment: Equipment[]
  onPhotosSelect?: (photos: string[]) => void
  locale?: Locale
}

interface Photo {
  name: string
  path: string // This will be the API endpoint path like /api/photos/image?path=...
  relativePath?: string // Store the relative path for form submission
}

const getCopy = (locale: Locale = 'ru') => {
  if (locale === 'ky') {
    return {
      selectEquipment: 'Жабдууну тандаңыз',
      noEquipment: 'Жабдууну таба алган жок',
      loading: 'Жүктөлүүдө...',
      noPhotos: 'Бул жабдуу үчүн фото жок',
      selectAll: 'Барлыгын тандаңыз',
      deselectAll: 'Барлыгын тастаңыз',
      selected: 'Тандалган',
    }
  }

  return {
    selectEquipment: 'Выберите оборудование',
    noEquipment: 'Оборудование не найдено',
    loading: 'Загружается...',
    noPhotos: 'Для этого оборудования нет фотографий',
    selectAll: 'Выбрать все',
    deselectAll: 'Отменить выбор',
    selected: 'Выбрано',
  }
}

export default function EquipmentPhotoBrowser({
  equipment,
  onPhotosSelect,
  locale = 'ru',
}: EquipmentPhotoBrowserProps) {
  const copy = getCopy(locale)
  const [selectedEquipment, setSelectedEquipment] = useState('')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedEquipment) {
      setPhotos([])
      setSelectedPhotos(new Set())
      onPhotosSelect?.([])
      return
    }

    const fetchPhotos = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/photos?equipment=${encodeURIComponent(selectedEquipment)}`)
        const data = await response.json()
        setPhotos(data.photos || [])
        setSelectedPhotos(new Set())
      } catch (error) {
        console.error('Failed to fetch photos:', error)
        setPhotos([])
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [selectedEquipment, onPhotosSelect])

  const handlePhotoSelect = (photo: Photo, isSelected: boolean) => {
    const newSelected = new Set(selectedPhotos)
    // Use relativePath for storage, not the API path
    const photoKey = photo.relativePath || photo.path
    
    if (isSelected) {
      newSelected.add(photoKey)
    } else {
      newSelected.delete(photoKey)
    }
    setSelectedPhotos(newSelected)
    onPhotosSelect?.(Array.from(newSelected))
  }

  const handleSelectAll = () => {
    const allPhotoPaths = new Set(photos.map((p) => p.relativePath || p.path))
    setSelectedPhotos(allPhotoPaths)
    onPhotosSelect?.(Array.from(allPhotoPaths))
  }

  const handleDeselectAll = () => {
    setSelectedPhotos(new Set())
    onPhotosSelect?.([])
  }

  const getEquipmentFolderName = (equipment: Equipment) => {
    // Convert slug to folder name format
    // For example: "komplekt-fizika-mehanika" -> "Комплект физика-механика"
    return equipment.name
  }

  return (
    <div className="space-y-4">
      <div className="form-field">
        <label htmlFor="equipment_photos" className="block text-sm font-medium mb-2">
          {copy.selectEquipment}
        </label>
        <select
          id="equipment_photos"
          value={selectedEquipment}
          onChange={(e) => setSelectedEquipment(e.target.value)}
          className="form-select w-full"
        >
          <option value="">{copy.selectEquipment}</option>
          {equipment.length > 0 ? (
            equipment.map((item) => (
              <option key={item.id} value={item.name || item.id}>
                {getEquipmentFolderName(item)}
              </option>
            ))
          ) : (
            <option disabled>{copy.noEquipment}</option>
          )}
        </select>
      </div>

      {selectedEquipment && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-gray-500 text-sm">{copy.loading}</div>
          ) : photos.length === 0 ? (
            <div className="text-gray-500 text-sm">{copy.noPhotos}</div>
          ) : (
            <>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {copy.selected}: {selectedPhotos.size} / {photos.length}
                </span>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    {copy.selectAll}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
                  >
                    {copy.deselectAll}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => {
                  const photoKey = photo.relativePath || photo.path
                  const isSelected = selectedPhotos.has(photoKey)
                  // Remove file extension from display name
                  const photoNameWithoutExt = photo.name.replace(/\.[^.]+$/, '')
                  
                  return (
                    <div
                      key={photo.path}
                      className="relative group cursor-pointer"
                      onClick={() => handlePhotoSelect(photo, !isSelected)}
                    >
                      <div
                        className="relative bg-gray-100 rounded-lg overflow-hidden border-2 transition-all flex items-center justify-center"
                        style={{
                          borderColor: isSelected ? '#3b82f6' : '#e5e7eb',
                          backgroundColor: isSelected ? '#eff6ff' : '#f3f4f6',
                          width: '100%',
                          aspectRatio: '1',
                        }}
                      >
                        <img
                          src={photo.path}
                          alt={photoNameWithoutExt}
                          className="w-full h-full object-contain p-1"
                        />
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="absolute top-2 left-2 w-4 h-4 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-2 truncate" title={photoNameWithoutExt}>
                        {photoNameWithoutExt}
                      </p>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
