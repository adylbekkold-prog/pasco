'use server'

import slugify from 'slugify'
import { revalidatePath } from 'next/cache'
import { assertServerLocalAdminAccess } from '@/lib/admin-access'
import { adminPath } from '@/lib/admin-routes'
import { resolveLocale } from '@/lib/locale'
import { getCurrentLocale } from '@/lib/locale-server'
import {
  addLocalPascoKitComponent,
  createLocalPascoKit,
  deleteLocalPascoKit,
  deleteLocalPascoKitComponent,
  updateLocalPascoKit,
  updateLocalPascoKitComponent,
} from '@/lib/local-db'
import { getPascoKitById } from '@/lib/queries'
import type { Locale } from '@/types'


type CreatePascoKitInput = {
  name: string
  description: string | null
  subject_id: string
  thumbnail_url?: string | null
  locale?: Locale | null
}

type UpdatePascoKitInput = CreatePascoKitInput

type CreateComponentInput = {
  name: string
  quantity: number
  description: string | null
  storage_location: string | null
  notes: string | null
  photo_url?: string | null
  locale?: Locale | null
}

type UpdateComponentInput = CreateComponentInput

function buildSlug(name: string) {
  return slugify(name, { lower: true, strict: true, locale: 'ru' }) || 'kit'
}

async function getActionLocale(locale?: Locale | null) {
  return locale ? resolveLocale(locale) : getCurrentLocale()
}

function revalidatePascoKitPages(kitId?: string, slug?: string) {
  revalidatePath('/admin/pasco-kits')
  revalidatePath(adminPath('/pasco-kits'))
  revalidatePath('/pasco-kits')

  if (kitId) {
    revalidatePath(`/admin/pasco-kits/${kitId}`)
    revalidatePath(adminPath(`/pasco-kits/${kitId}`))
  }

  if (slug) {
    revalidatePath(`/pasco-kits/${slug}`)
  }
}

function validateComponentInput(input: unknown): input is CreateComponentInput {
  if (!input || typeof input !== 'object') return false
  const candidate = input as Partial<CreateComponentInput>

  return (
    typeof candidate.name === 'string' &&
    candidate.name.trim().length > 0 &&
    typeof candidate.quantity === 'number' &&
    candidate.quantity > 0
  )
}

export async function createPascoKitAction(input: CreatePascoKitInput) {
  await assertServerLocalAdminAccess()
  const locale = await getActionLocale(input.locale)

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

  revalidatePascoKitPages(kit.id, kit.slug)

  return kit
}

export async function updatePascoKitAction(kitId: string, input: UpdatePascoKitInput) {
  await assertServerLocalAdminAccess()
  const locale = await getActionLocale(input.locale)

  if (!input.name?.trim()) {
    throw new Error('Название комплекта обязательно')
  }

  if (!input.subject_id) {
    throw new Error('Предмет обязателен')
  }

  const existing = await getPascoKitById(kitId, locale)
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

  revalidatePascoKitPages(kit.id, existing.slug)
  revalidatePascoKitPages(kit.id, kit.slug)

  return kit
}

export async function deletePascoKitAction(kitId: string, explicitLocale?: Locale) {
  await assertServerLocalAdminAccess()
  const locale = await getActionLocale(explicitLocale)

  const existing = await getPascoKitById(kitId, locale)
  if (!existing) {
    throw new Error('Комплект не найден')
  }

  await deleteLocalPascoKit(kitId, locale)


  revalidatePascoKitPages(kitId, existing.slug)
}

export async function addPascoKitComponentAction(
  kitId: string,
  input: CreateComponentInput
) {
  await assertServerLocalAdminAccess()
  const locale = await getActionLocale(input.locale)

  if (!input.name?.trim()) {
    throw new Error('Название компонента обязательно')
  }

  if (!validateComponentInput(input)) {
    throw new Error('Неверные данные компонента')
  }

  const kit = await getPascoKitById(kitId, locale)
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

  revalidatePascoKitPages(kitId, kit.slug)

  return component
}

export async function updatePascoKitComponentAction(
  componentId: string,
  kitId: string,
  input: UpdateComponentInput
) {
  await assertServerLocalAdminAccess()
  const locale = await getActionLocale(input.locale)

  if (!input.name?.trim()) {
    throw new Error('Название компонента обязательно')
  }

  if (!validateComponentInput(input)) {
    throw new Error('Неверные данные компонента')
  }

  const kit = await getPascoKitById(kitId, locale)
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

  revalidatePascoKitPages(kitId, kit.slug)

  return component
}

export async function deletePascoKitComponentAction(componentId: string, kitId: string, explicitLocale?: Locale) {
  await assertServerLocalAdminAccess()
  const locale = await getActionLocale(explicitLocale)

  const kit = await getPascoKitById(kitId, locale)
  if (!kit) {
    throw new Error('Комплект не найден')
  }

  await deleteLocalPascoKitComponent(componentId, locale)


  revalidatePascoKitPages(kitId, kit.slug)
}
