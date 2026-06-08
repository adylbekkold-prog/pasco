'use server'

import slugify from 'slugify'
import { revalidatePath } from 'next/cache'
import { assertServerLocalAdminAccess } from '@/lib/admin-access'
import { getDataProvider, shouldMirrorLocalData, shouldTrySupabaseData } from '@/lib/data-provider'
import { resolveLocale } from '@/lib/locale'
import { getCurrentLocale } from '@/lib/locale-server'
import {
  createLocalLab,
  deleteLocalLab,
  getLocalLabById,
  updateLocalLab,
  syncLocalLabMirror,
  toggleLocalLab,
  toStoredLab,
} from '@/lib/local-db'
import { createClient } from '@/lib/supabase/server'
import { buildLocalizedTextColumns, compactRow } from '@/lib/supabase-localization'
import { clearQueuedLabSync, queueLabSync } from '@/lib/sync-queue'
import { getSupabasePublicEnvIssue, hasSupabasePublicEnv } from '@/lib/supabase/env'
import type { Locale, Resource, ResourceType } from '@/types'

type LabMutationPayload = {
  title: string
  slug: string
  content: string | null
  subject_id: string | null
  grade_id: string | null
  equipment_ids: string[]
  resources: LabResourcePayload[]
  is_published: boolean
}

type LabResourcePayload = {
  id: string
  resource_type: ResourceType
  title: string
  url: string
  file_size: number | null
}

function getWriteEnvError() {
  return new Error(
    getSupabasePublicEnvIssue() ?? 'Не удалось подключиться к Supabase для сохранения.'
  )
}

function canUseSupabaseWrites(provider = getDataProvider()) {
  return shouldTrySupabaseData(provider) && hasSupabasePublicEnv()
}

async function requireSupabaseUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Требуется авторизация')
  }

  return supabase
}

function parseJson<T>(value: FormDataEntryValue | null, fallback: T): T {
  if (typeof value !== 'string' || !value.trim()) return fallback

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function normalizeText(value: FormDataEntryValue | null) {
  const normalized = String(value ?? '').trim()
  return normalized || null
}

const VALID_RESOURCE_TYPES = new Set<ResourceType>([
  'pdf',
  'image',
  'video',
  'worksheet',
  'link',
])

function normalizeResourceType(value: unknown): ResourceType {
  return typeof value === 'string' && VALID_RESOURCE_TYPES.has(value as ResourceType)
    ? (value as ResourceType)
    : 'pdf'
}

function parseResources(value: FormDataEntryValue | null): LabResourcePayload[] {
  const rawResources = parseJson<Array<Partial<LabResourcePayload> & { file_size?: number | null }>>(
    value,
    []
  )

  return rawResources
    .map((resource) => ({
      id: typeof resource.id === 'string' && resource.id.trim() ? resource.id.trim() : crypto.randomUUID(),
      resource_type: normalizeResourceType(resource.resource_type),
      title: String(resource.title ?? '').trim(),
      url: String(resource.url ?? '').trim(),
      file_size:
        typeof resource.file_size === 'number' && Number.isFinite(resource.file_size)
          ? resource.file_size
          : null,
    }))
    .filter((resource) => resource.title.length > 0 && resource.url.length > 0)
}

function buildResourceRows(resources: LabResourcePayload[], labId: string): Resource[] {
  return resources.map((resource, index) => ({
    id: resource.id,
    lab_id: labId,
    resource_type: resource.resource_type,
    title: resource.title,
    title_ru: resource.title,
    title_ky: resource.title,
    url: resource.url,
    file_size: resource.file_size,
    sort_order: index,
  }))
}

async function replaceRemoteResources(
  supabase: Awaited<ReturnType<typeof createClient>>,
  labId: string,
  resources: Resource[]
) {
  const { error: deleteError } = await supabase.from('resources').delete().eq('lab_id', labId)

  if (deleteError) {
    throw new Error(`Не удалось обновить ресурсы ${labId}: ${deleteError.message}`)
  }

  if (resources.length === 0) {
    return
  }

  const { error: insertError } = await supabase.from('resources').insert(resources)

  if (insertError) {
    throw new Error(`Не удалось сохранить ресурсы ${labId}: ${insertError.message}`)
  }
}

function buildSlug(title: string, locale: Locale) {
  const base =
    slugify(title, {
      lower: true,
      strict: true,
      locale: locale === 'ky' ? 'ru' : locale,
    }) || 'lab'
  return `${base}-${Date.now()}`
}

function buildLabRow(
  payload: LabMutationPayload,
  locale: Locale,
  { slug, updatedAt }: { slug?: string; updatedAt?: string } = {}
) {
  return compactRow({
    ...(slug ? { slug } : {}),
    ...buildLocalizedTextColumns('title', payload.title, locale),
    ...buildLocalizedTextColumns('content', payload.content, locale),
    subject_id: payload.subject_id,
    grade_id: payload.grade_id,
    is_published: payload.is_published,
    updated_at: updatedAt,
  })
}

function parsePayload(formData: FormData, slug: string, locale: Locale): LabMutationPayload {
  const title = String(formData.get('title') ?? '').trim()

  return {
    title,
    slug,
    content: normalizeText(formData.get('content')),
    subject_id: normalizeText(formData.get('subject_id')),
    grade_id: normalizeText(formData.get('grade_id')),
    equipment_ids: parseJson<string[]>(formData.get('equipment_ids'), []),
    resources: parseResources(formData.get('resources')),
    is_published: formData.get('is_published') === 'true',
  }
}

function revalidateLabPages(labId?: string) {
  if (labId) {
    revalidatePath(`/admin/labs/${labId}/edit`)
  }

  revalidatePath('/admin/labs')
  revalidatePath('/labs')
  revalidatePath('/')
}

export async function createLabAction(formData: FormData) {
  await assertServerLocalAdminAccess()
  const locale = resolveLocale(String(formData.get('locale') ?? (await getCurrentLocale())))
  const provider = getDataProvider()
  const payload = parsePayload(
    formData,
    buildSlug(String(formData.get('title') ?? ''), locale),
    locale
  )

  if (!payload.title) {
    throw new Error('Название лаборатории обязательно.')
  }

  if (!payload.content) {
    throw new Error('Содержание лаборатории обязательно.')
  }

  if (!payload.subject_id) {
    throw new Error('Предмет обязателен.')
  }

  if (!payload.grade_id) {
    throw new Error('Класс обязателен.')
  }

  if (canUseSupabaseWrites(provider)) {
    try {
      const supabase = await requireSupabaseUser()
      const { data: lab, error } = await supabase
        .from('labs')
        .insert(buildLabRow(payload, locale, { slug: payload.slug }))
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      const resourceRows = buildResourceRows(payload.resources, lab.id)
      await replaceRemoteResources(supabase, lab.id, resourceRows)

      if (shouldMirrorLocalData(provider)) {
        await syncLocalLabMirror(
          {
            lab: toStoredLab(lab),
            resources: resourceRows,
          },
          locale
        )
      }

      await clearQueuedLabSync(lab.id, locale)

      revalidateLabPages()
      return
    } catch (error) {
      if (!shouldMirrorLocalData(provider)) {
        throw error
      }
    }
  } else if (provider === 'supabase') {
    throw getWriteEnvError()
  }

  const localLab = await createLocalLab(payload, locale)
  await syncLocalLabMirror(
    {
      lab: toStoredLab(localLab),
      resources: buildResourceRows(payload.resources, localLab.id),
    },
    locale
  )

  if (shouldTrySupabaseData(provider)) {
    await queueLabSync(localLab.id, 'upsert', locale)
  }

  revalidateLabPages()
}

export async function deleteLabAction(labId: string, locale?: Locale) {
  await assertServerLocalAdminAccess()
  const currentLocale = locale ?? (await getCurrentLocale())
  const provider = getDataProvider()

  if (canUseSupabaseWrites(provider)) {
    try {
      const supabase = await requireSupabaseUser()
      const { error } = await supabase.from('labs').delete().eq('id', labId)

      if (error) {
        throw new Error(error.message)
      }

      if (shouldMirrorLocalData(provider)) {
        await deleteLocalLab(labId, currentLocale)
      }

      await clearQueuedLabSync(labId, currentLocale)

      revalidateLabPages(labId)
      return
    } catch (error) {
      if (!shouldMirrorLocalData(provider)) {
        throw error
      }
    }
  } else if (provider === 'supabase') {
    throw getWriteEnvError()
  }

  await deleteLocalLab(labId, currentLocale)

  if (shouldTrySupabaseData(provider)) {
    await queueLabSync(labId, 'delete', currentLocale)
  }

  revalidateLabPages(labId)
}

export async function togglePublishAction(labId: string, published: boolean, locale?: Locale) {
  await assertServerLocalAdminAccess()
  const currentLocale = locale ?? (await getCurrentLocale())
  const provider = getDataProvider()

  if (canUseSupabaseWrites(provider)) {
    try {
      const supabase = await requireSupabaseUser()
      const { error } = await supabase
        .from('labs')
        .update({ is_published: published, updated_at: new Date().toISOString() })
        .eq('id', labId)

      if (error) {
        throw new Error(error.message)
      }

      if (shouldMirrorLocalData(provider)) {
        await toggleLocalLab(labId, published, currentLocale)
      }

      await clearQueuedLabSync(labId, currentLocale)

      revalidateLabPages(labId)
      return
    } catch (error) {
      if (!shouldMirrorLocalData(provider)) {
        throw error
      }
    }
  } else if (provider === 'supabase') {
    throw getWriteEnvError()
  }

  await toggleLocalLab(labId, published, currentLocale)

  if (shouldTrySupabaseData(provider)) {
    await queueLabSync(labId, 'upsert', currentLocale)
  }

  revalidateLabPages(labId)
}

export async function updateLabAction(labId: string, formData: FormData) {
  await assertServerLocalAdminAccess()
  const locale = resolveLocale(String(formData.get('locale') ?? (await getCurrentLocale())))
  const provider = getDataProvider()
  const localMirror = await getLocalLabById(labId, locale)
  const payload = parsePayload(
    formData,
    localMirror?.slug ?? buildSlug(String(formData.get('title') ?? ''), locale),
    locale
  )

  if (!payload.title) {
    throw new Error('Название лаборатории обязательно.')
  }

  if (!payload.content) {
    throw new Error('Содержание лаборатории обязательно.')
  }

  if (canUseSupabaseWrites(provider)) {
    try {
      const supabase = await requireSupabaseUser()
      const { data: lab, error } = await supabase
        .from('labs')
        .update(buildLabRow(payload, locale, { updatedAt: new Date().toISOString() }))
        .eq('id', labId)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      const resourceRows = buildResourceRows(payload.resources, lab.id)
      await replaceRemoteResources(supabase, lab.id, resourceRows)

      if (shouldMirrorLocalData(provider)) {
        await syncLocalLabMirror(
          {
            lab: toStoredLab(lab),
            resources: resourceRows,
          },
          locale
        )
      }

      await clearQueuedLabSync(labId, locale)

      revalidateLabPages(labId)
      return
    } catch (error) {
      if (!shouldMirrorLocalData(provider)) {
        throw error
      }
    }
  } else if (provider === 'supabase') {
    throw getWriteEnvError()
  }

  // Local-only update
  const existingLab = await getLocalLabById(labId, locale)
  if (!existingLab) {
    throw new Error('Лаборатория не найдена')
  }

  const localLab = await updateLocalLab(labId, { ...payload, slug: existingLab.slug }, locale)
  await syncLocalLabMirror(
    {
      lab: toStoredLab(localLab),
      resources: buildResourceRows(payload.resources, localLab.id),
    },
    locale
  )

  if (shouldTrySupabaseData(provider)) {
    await queueLabSync(labId, 'upsert', locale)
  }

  revalidateLabPages(labId)
}

export async function createResourceAction(
  labId: string,
  resourceType: 'pdf' | 'image' | 'video' | 'worksheet' | 'link',
  title: string,
  url: string,
  locale?: Locale
) {
  await assertServerLocalAdminAccess()
  const currentLocale = locale ?? (await getCurrentLocale())
  const provider = getDataProvider()

  if (!title || !url) {
    throw new Error('Название и URL ресурса обязательны')
  }

  if (canUseSupabaseWrites(provider)) {
    try {
      const supabase = await requireSupabaseUser()
      const { data: resources } = await supabase
        .from('resources')
        .select('sort_order')
        .eq('lab_id', labId)
        .order('sort_order', { ascending: false })
        .limit(1)

      const maxSort = (resources?.[0]?.sort_order ?? -1) as number

      const { error } = await supabase.from('resources').insert({
        lab_id: labId,
        resource_type: resourceType,
        title,
        url,
        sort_order: maxSort + 1,
      })

      if (error) {
        throw new Error(error.message)
      }

      revalidateLabPages(labId)
      return
    } catch (error) {
      if (!shouldMirrorLocalData(provider)) {
        throw error
      }
    }
  } else if (provider === 'supabase') {
    throw getWriteEnvError()
  }

  revalidateLabPages(labId)
}

export async function deleteResourceAction(resourceId: string, labId: string, locale?: Locale) {
  await assertServerLocalAdminAccess()
  const currentLocale = locale ?? (await getCurrentLocale())
  const provider = getDataProvider()

  if (canUseSupabaseWrites(provider)) {
    try {
      const supabase = await requireSupabaseUser()
      const { error } = await supabase.from('resources').delete().eq('id', resourceId)

      if (error) {
        throw new Error(error.message)
      }

      revalidateLabPages(labId)
      return
    } catch (error) {
      if (!shouldMirrorLocalData(provider)) {
        throw error
      }
    }
  } else if (provider === 'supabase') {
    throw getWriteEnvError()
  }

  revalidateLabPages(labId)
}
