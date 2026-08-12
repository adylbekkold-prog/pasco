'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { AlertTriangle, Plus } from 'lucide-react'
import {
  addPascoKitComponentAction,
  deletePascoKitComponentAction,
  updatePascoKitComponentAction,
} from '@/app/actions/pasco-kit.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Locale, PascoKitComponent } from '@/types'

interface ComponentFormProps {
  kitId: string
  locale: Locale
  onComponentAdded?: (component: PascoKitComponent) => void
}

interface ComponentRowProps {
  component: PascoKitComponent
  kitId: string
  locale: Locale
  onUpdate?: (component: PascoKitComponent) => void
  onDelete?: () => void
}

function getCopy(locale: Locale) {
  if (locale === 'ky') {
    return {
      components: 'Компоненттер',
      addComponent: 'Компонент кошуу',
      name: 'Аталышы',
      quantity: 'Саны',
      description: 'Сүрөттөлүшү',
      storageLocation: 'Сактоо жери',
      notes: 'Эскертүүлөр',
      delete: 'Өчүрүү',
      edit: 'Түзөтүү',
      save: 'Сактоо',
      cancel: 'Жокко чыгаруу',
      saving: 'Сакталууда...',
      deletingMessage: 'Өчүрүлүүдө...',
      empty: 'Компоненттер азырынча кошула элек',
      deleteConfirm: 'Бул компонентти өчүрүүгө ынанасызбы?',
      error: 'Ката кетти',
    }
  }

  return {
    components: 'Компоненты',
    addComponent: 'Добавить компонент',
    name: 'Название',
    quantity: 'Количество',
    description: 'Описание',
    storageLocation: 'Место хранения',
    notes: 'Примечания',
    delete: 'Удалить',
    edit: 'Редактировать',
    save: 'Сохранить',
    cancel: 'Отмена',
    saving: 'Сохраняется...',
    deletingMessage: 'Удаляется...',
    empty: 'Компоненты пока не добавлены',
    deleteConfirm: 'Вы уверены, что хотите удалить этот компонент?',
    error: 'Произошла ошибка',
  }
}

function ComponentRow({ component, kitId, locale, onUpdate, onDelete }: ComponentRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const copy = getCopy(locale)

  const [data, setData] = useState({
    name: component.name,
    quantity: component.quantity,
    description: component.description ?? '',
    storageLocation: component.storage_location ?? '',
    notes: component.notes ?? '',
  })

  useEffect(() => {
    setData({
      name: component.name,
      quantity: component.quantity,
      description: component.description ?? '',
      storageLocation: component.storage_location ?? '',
      notes: component.notes ?? '',
    })
  }, [component])

  const handleSave = async () => {
    if (!data.name.trim()) {
      alert(copy.error)
      return
    }

    try {
      setIsSaving(true)
      const updated = await updatePascoKitComponentAction(component.id, kitId, {
        name: data.name.trim(),
        quantity: data.quantity,
        description: data.description.trim() || null,
        storage_location: data.storageLocation.trim() || null,
        notes: data.notes.trim() || null,
        locale,
      })
      setIsEditing(false)
      onUpdate?.(updated)
    } catch (error) {
      alert(error instanceof Error ? error.message : copy.error)
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(copy.deleteConfirm)) return

    try {
      setIsDeleting(true)
      await deletePascoKitComponentAction(component.id, kitId, locale)
      onDelete?.()
    } catch (error) {
      alert(error instanceof Error ? error.message : copy.error)
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-3 border-l-4 border-blue-500 bg-blue-50 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-sm">{copy.name}</Label>
            <Input
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              placeholder={copy.name}
              disabled={isSaving}
            />
          </div>
          <div>
            <Label className="text-sm">{copy.quantity}</Label>
            <Input
              type="number"
              min="1"
              value={data.quantity}
              onChange={(e) => setData({ ...data, quantity: parseInt(e.target.value, 10) || 1 })}
              disabled={isSaving}
            />
          </div>
        </div>
        <div>
          <Label className="text-sm">{copy.description}</Label>
          <Textarea
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            placeholder={copy.description}
            disabled={isSaving}
            rows={2}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-sm">{copy.storageLocation}</Label>
            <Input
              value={data.storageLocation}
              onChange={(e) => setData({ ...data, storageLocation: e.target.value })}
              placeholder="Box 1"
              disabled={isSaving}
            />
          </div>
          <div>
            <Label className="text-sm">{copy.notes}</Label>
            <Input
              value={data.notes}
              onChange={(e) => setData({ ...data, notes: e.target.value })}
              placeholder={copy.notes}
              disabled={isSaving}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? copy.saving : copy.save}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(false)}
            disabled={isSaving}
          >
            {copy.cancel}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{component.name}</h4>
          <span className="rounded bg-gray-100 px-2 py-1 text-xs">x{component.quantity}</span>
        </div>
        {component.description && <p className="mt-1 text-sm text-gray-600">{component.description}</p>}
        {component.storage_location && (
          <p className="mt-1 text-sm text-gray-500">{component.storage_location}</p>
        )}
        {component.notes && <p className="mt-1 text-xs text-gray-500">{component.notes}</p>}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setIsEditing(true)}
          disabled={isDeleting}
        >
          {copy.edit}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? copy.deletingMessage : copy.delete}
        </Button>
      </div>
    </div>
  )
}

export function PascoKitComponentForm({ kitId, locale, onComponentAdded }: ComponentFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const copy = getCopy(locale)

  const [data, setData] = useState({
    name: '',
    quantity: 1,
    description: '',
    storageLocation: '',
    notes: '',
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!data.name.trim()) {
      alert(copy.error)
      return
    }

    try {
      setIsSaving(true)
      const component = await addPascoKitComponentAction(kitId, {
        name: data.name.trim(),
        quantity: data.quantity,
        description: data.description.trim() || null,
        storage_location: data.storageLocation.trim() || null,
        notes: data.notes.trim() || null,
        locale,
      })
      setData({ name: '', quantity: 1, description: '', storageLocation: '', notes: '' })
      setIsOpen(false)
      onComponentAdded?.(component)
    } catch (error) {
      alert(error instanceof Error ? error.message : copy.error)
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) {
    return (
      <Button type="button" onClick={() => setIsOpen(true)} size="sm" className="gap-2">
        <Plus size={16} />
        {copy.addComponent}
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border-l-4 border-blue-500 bg-blue-50 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label className="text-sm">{copy.name}</Label>
          <Input
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            placeholder={copy.name}
            disabled={isSaving}
            autoFocus
          />
        </div>
        <div>
          <Label className="text-sm">{copy.quantity}</Label>
          <Input
            type="number"
            min="1"
            value={data.quantity}
            onChange={(e) => setData({ ...data, quantity: parseInt(e.target.value, 10) || 1 })}
            disabled={isSaving}
          />
        </div>
      </div>
      <div>
        <Label className="text-sm">{copy.description}</Label>
        <Textarea
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          placeholder={copy.description}
          disabled={isSaving}
          rows={2}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label className="text-sm">{copy.storageLocation}</Label>
          <Input
            value={data.storageLocation}
            onChange={(e) => setData({ ...data, storageLocation: e.target.value })}
            placeholder="Box 1"
            disabled={isSaving}
          />
        </div>
        <div>
          <Label className="text-sm">{copy.notes}</Label>
          <Input
            value={data.notes}
            onChange={(e) => setData({ ...data, notes: e.target.value })}
            placeholder={copy.notes}
            disabled={isSaving}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSaving}>
          {isSaving ? copy.saving : copy.save}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setIsOpen(false)}
          disabled={isSaving}
        >
          {copy.cancel}
        </Button>
      </div>
    </form>
  )
}

interface PascoKitComponentsListProps {
  kitId: string
  components: PascoKitComponent[]
  locale: Locale
}

export function PascoKitComponentsList({ kitId, components, locale }: PascoKitComponentsListProps) {
  const copy = getCopy(locale)
  const [items, setItems] = useState(components)

  useEffect(() => {
    setItems(components)
  }, [components])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{copy.components}</h3>
        <span className="text-sm text-gray-500">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
          <AlertTriangle size={24} className="mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600">{copy.empty}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((component) => (
            <ComponentRow
              key={component.id}
              component={component}
              kitId={kitId}
              locale={locale}
              onUpdate={(updated) => {
                setItems((prev) =>
                  prev.map((current) => (current.id === updated.id ? updated : current))
                )
              }}
              onDelete={() => {
                setItems((prev) => prev.filter((current) => current.id !== component.id))
              }}
            />
          ))}
        </div>
      )}

      <PascoKitComponentForm
        kitId={kitId}
        locale={locale}
        onComponentAdded={(component) => {
          setItems((prev) => [...prev, component])
        }}
      />
    </div>
  )
}
