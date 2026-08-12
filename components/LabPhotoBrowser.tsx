'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Image as ImageIcon } from 'lucide-react'
import './LabPhotoBrowser.css'

interface PhotoNode {
  name: string
  path: string
  isDirectory: boolean
  children?: PhotoNode[]
}

interface LabPhotoBrowserProps {
  onPhotosSelect?: (photos: string[]) => void
  locale?: 'ru' | 'ky'
}

const getCopy = (locale: 'ru' | 'ky' = 'ru') => {
  if (locale === 'ky') {
    return {
      title: 'Фото сайлаңыз',
      loading: 'Жүктөлүүдө...',
      error: 'Фотолорду жүктөө мүмкүн болгон жок',
      noPhotos: 'Бул папкада фотолор жок',
      selectAll: 'Барлыгын тандаңыз',
      deselectAll: 'Барлыгын тастаңыз',
      selected: 'Тандалган',
    }
  }

  return {
    title: 'Выберите фотографии',
    loading: 'Загружается...',
    error: 'Не удалось загрузить фотографии',
    noPhotos: 'В этой папке нет фотографий',
    selectAll: 'Выбрать все',
    deselectAll: 'Отменить выбор',
    selected: 'Выбрано',
  }
}

function FileTreeNode({
  node,
  onPhotoSelect,
  selectedPhotos,
}: {
  node: PhotoNode
  onPhotoSelect: (photoPath: string, isSelected: boolean) => void
  selectedPhotos: Set<string>
}) {
  const [isOpen, setIsOpen] = useState(false)
  const hasChildren = node.children && node.children.length > 0

  if (!node.isDirectory) {
    return (
      <div className="photo-item">
        <input
          type="checkbox"
          checked={selectedPhotos.has(node.path)}
          onChange={(e) => onPhotoSelect(node.path, e.target.checked)}
          className="photo-checkbox"
        />
        <ImageIcon size={16} className="photo-icon" />
        <span className="photo-name">{node.name}</span>
      </div>
    )
  }

  return (
    <div className="folder-node">
      <div
        className="folder-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <button className="expand-btn" type="button">
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <span className="folder-name">{node.name}</span>
        {hasChildren && (
          <span className="item-count">
            ({node.children?.length || 0})
          </span>
        )}
      </div>

      {isOpen && hasChildren && (
        <div className="folder-children">
          {node.children?.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              onPhotoSelect={onPhotoSelect}
              selectedPhotos={selectedPhotos}
            />
          ))}
        </div>
      )}

      {isOpen && !hasChildren && (
        <div className="no-items">No items</div>
      )}
    </div>
  )
}

export default function LabPhotoBrowser({
  onPhotosSelect,
  locale = 'ru',
}: LabPhotoBrowserProps) {
  const copy = getCopy(locale)
  const [photoTree, setPhotoTree] = useState<PhotoNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await fetch('/api/lab-photos')
        if (!response.ok) {
          throw new Error(copy.error)
        }
        const data = await response.json()
        if (data.success) {
          setPhotoTree(data.data)
        } else {
          setError(data.error || copy.error)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : copy.error)
      } finally {
        setLoading(false)
      }
    }

    loadPhotos()
  }, [copy.error])

  const handlePhotoSelect = (photoPath: string, isSelected: boolean) => {
    const newSelected = new Set(selectedPhotos)
    if (isSelected) {
      newSelected.add(photoPath)
    } else {
      newSelected.delete(photoPath)
    }
    setSelectedPhotos(newSelected)
    onPhotosSelect?.(Array.from(newSelected))
  }

  const handleSelectAll = () => {
    if (!photoTree) return

    const allPhotos = new Set<string>()

    function collectPhotos(node: PhotoNode) {
      if (!node.isDirectory && node.path) {
        allPhotos.add(node.path)
      }
      if (node.children) {
        node.children.forEach(collectPhotos)
      }
    }

    collectPhotos(photoTree)
    setSelectedPhotos(allPhotos)
    onPhotosSelect?.(Array.from(allPhotos))
  }

  const handleDeselectAll = () => {
    setSelectedPhotos(new Set())
    onPhotosSelect?.([])
  }

  if (loading) {
    return <div className="lab-photo-browser loading">{copy.loading}</div>
  }

  if (error) {
    return <div className="lab-photo-browser error">{error}</div>
  }

  const imageCount = photoTree?.children?.filter((c) => !c.isDirectory).length || 0

  return (
    <div className="lab-photo-browser">
      <div className="browser-header">
        <h3 className="browser-title">{copy.title}</h3>
        <div className="browser-stats">
          {imageCount > 0 && (
            <>
              <span className="stat">{imageCount} фотографий доступно</span>
              <span className="stat-selected">
                {copy.selected}: {selectedPhotos.size}
              </span>
            </>
          )}
        </div>
      </div>

      {imageCount === 0 ? (
        <div className="no-photos">{copy.noPhotos}</div>
      ) : (
        <>
          <div className="browser-controls">
            <button
              type="button"
              className="control-btn select-all"
              onClick={handleSelectAll}
            >
              {copy.selectAll}
            </button>
            <button
              type="button"
              className="control-btn deselect-all"
              onClick={handleDeselectAll}
            >
              {copy.deselectAll}
            </button>
          </div>

          <div className="photo-tree">
            {photoTree?.children?.map((node) => (
              <FileTreeNode
                key={node.path}
                node={node}
                onPhotoSelect={handlePhotoSelect}
                selectedPhotos={selectedPhotos}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
