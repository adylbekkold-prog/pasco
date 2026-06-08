'use server'

import slugify from 'slugify'
import { revalidatePath } from 'next/cache'
import { assertServerLocalAdminAccess } from '@/lib/admin-access'
import { resolveLocale } from '@/lib/locale'
import { getCurrentLocale } from '@/lib/locale-server'
import {
  addLocalPascoKitComponent,
  createLocalPascoKit,
  deleteLocalPascoKit,
  deleteLocalPascoKitComponent,
  getLocalPascoKitById,
  updateLocalPascoKit,
  updateLocalPascoKitComponent,
} from '@/lib/local-db'
import type { Locale, PascoKit, PascoKitComponent } from '@/types'

type CreatePascoKitInput = {
  name: string
  description: string | null
  subject_id: string
  thumbnail_url?: string | null
}

type UpdatePascoKitInput = CreatePascoKitInput

type CreateComponentInput = {
  name: string
  quantity: number
  description: string | null
  storage_location: string | null
  notes: string | null
  photo_url?: string | null
}

type UpdateComponentInput = CreateComponentInput

function buildSlug(name: string) {
  return slugify(name, { lower: true, strict: true, locale: 'ru' }) || 'kit'
}

function validateComponentInput(input: any): input is CreateComponentInput {
  return (
    typeof input.name === 'string' &&
    input.name.trim().length > 0 &&
    typeof input.quantity === 'number' &&
    input.quantity > 0
  )
}

export async function createPascoKitAction(input: CreatePascoKitInput) {
  await assertServerLocalAdminAccess()
  const locale = await getCurrentLocale()

  if (!input.name?.trim()) {
    throw new Error('Название комплекта обязательно')
  }

  if (!input.subject_id) {
    throw new Error('Предмет обязателен')
  }

  const slug = buildSlug(input.name)

  const kit = await createLocalPascoKit(
    {
      name: input.name.trim(),
      slug,
      description: input.description,
      subject_id: input.subject_id,
      thumbnail_url: input.thumbnail_url,
    },
    locale
  )

  revalidatePath('/admin/pasco-kits')
  revalidatePath('/labs/pasco-kits')

  return kit
}

export async function updatePascoKitAction(kitId: string, input: UpdatePascoKitInput) {
  await assertServerLocalAdminAccess()
  const locale = await getCurrentLocale()

  if (!input.name?.trim()) {
    throw new Error('Название комплекта обязательно')
  }

  if (!input.subject_id) {
    throw new Error('Предмет обязателен')
  }

  const existing = await getLocalPascoKitById(kitId, locale)
  if (!existing) {
    throw new Error('Комплект не найден')
  }

  const slug = buildSlug(input.name)

  const kit = await updateLocalPascoKit(
    kitId,
    {
      name: input.name.trim(),
      slug,
      description: input.description,
      subject_id: input.subject_id,
      thumbnail_url: input.thumbnail_url,
    },
    locale
  )

  revalidatePath('/admin/pasco-kits')
  revalidatePath('/labs/pasco-kits')
  revalidatePath(`/labs/pasco-kits/${existing.slug}`)

  return kit
}

export async function deletePascoKitAction(kitId: string) {
  await assertServerLocalAdminAccess()
  const locale = await getCurrentLocale()

  const existing = await getLocalPascoKitById(kitId, locale)
  if (!existing) {
    throw new Error('Комплект не найден')
  }

  await deleteLocalPascoKit(kitId, locale)

  revalidatePath('/admin/pasco-kits')
  revalidatePath('/labs/pasco-kits')
  revalidatePath(`/labs/pasco-kits/${existing.slug}`)
}

export async function addPascoKitComponentAction(
  kitId: string,
  input: CreateComponentInput
) {
  await assertServerLocalAdminAccess()
  const locale = await getCurrentLocale()

  if (!input.name?.trim()) {
    throw new Error('Название компонента обязательно')
  }

  if (!validateComponentInput(input)) {
    throw new Error('Неверные данные компонента')
  }

  const kit = await getLocalPascoKitById(kitId, locale)
  if (!kit) {
    throw new Error('Комплект не найден')
  }

  const component = await addLocalPascoKitComponent(
    kitId,
    {
      name: input.name.trim(),
      quantity: input.quantity,
      description: input.description,
      storage_location: input.storage_location,
      notes: input.notes,
      photo_url: input.photo_url,
    },
    locale
  )

  revalidatePath('/admin/pasco-kits')
  revalidatePath('/admin/pasco-kits/[id]')
  revalidatePath('/labs/pasco-kits')
  revalidatePath(`/labs/pasco-kits/${kit.slug}`)

  return component
}

export async function updatePascoKitComponentAction(
  componentId: string,
  kitId: string,
  input: UpdateComponentInput
) {
  await assertServerLocalAdminAccess()
  const locale = await getCurrentLocale()

  if (!input.name?.trim()) {
    throw new Error('Название компонента обязательно')
  }

  if (!validateComponentInput(input)) {
    throw new Error('Неверные данные компонента')
  }

  const kit = await getLocalPascoKitById(kitId, locale)
  if (!kit) {
    throw new Error('Комплект не найден')
  }

  const component = await updateLocalPascoKitComponent(
    componentId,
    {
      name: input.name.trim(),
      quantity: input.quantity,
      description: input.description,
      storage_location: input.storage_location,
      notes: input.notes,
      photo_url: input.photo_url,
    },
    locale
  )

  revalidatePath('/admin/pasco-kits')
  revalidatePath('/admin/pasco-kits/[id]')
  revalidatePath('/labs/pasco-kits')
  revalidatePath(`/labs/pasco-kits/${kit.slug}`)

  return component
}

export async function deletePascoKitComponentAction(componentId: string, kitId: string) {
  await assertServerLocalAdminAccess()
  const locale = await getCurrentLocale()

  const kit = await getLocalPascoKitById(kitId, locale)
  if (!kit) {
    throw new Error('Комплект не найден')
  }

  await deleteLocalPascoKitComponent(componentId, locale)

  revalidatePath('/admin/pasco-kits')
  revalidatePath('/admin/pasco-kits/[id]')
  revalidatePath('/labs/pasco-kits')
  revalidatePath(`/labs/pasco-kits/${kit.slug}`)
}
