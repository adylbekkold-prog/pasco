'use server'

import slugify from 'slugify'
import { revalidatePath } from 'next/cache'
import { assertServerLocalAdminAccess } from '@/lib/admin-access'
import { adminPath } from '@/lib/admin-routes'
import { getDataProvider, shouldMirrorLocalData, shouldTrySupabaseData } from '@/lib/data-provider'
import { getPostgresPool } from '@/lib/database/postgres'
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
import type { Difficulty, Lab, LabStep, LabStepDraft, Locale, Resource, ResourceType, StepBlockType } from '@/types'

type LabMutationPayload = {
  title: string
  slug: string
  content: string | null
  subject_id: string | null
  grade_id: string | null
  equipment_ids: string[]
  photo_urls?: string[] | null
  difficulty: Difficulty | null
  duration_minutes: number | null
  steps: LabStepDraft[]
  resources: LabResourcePayload[]
  is_published: boolean
}

type LabResourcePayload = {
  id: string
  resource_type: ResourceType
  title: string
  description_ru: string
  description_ky: string
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

function canUsePostgresWrites(provider = getDataProvider()) {
  return provider === 'postgresql' && Boolean(process.env.DATABASE_URL)
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

function normalizeDuration(value: FormDataEntryValue | null) {
  const duration = Number.parseInt(String(value ?? ''), 10)
  return Number.isFinite(duration) && duration >= 5 && duration <= 480 ? duration : null
}

function normalizeDifficulty(value: FormDataEntryValue | null): Difficulty | null {
  const difficulty = String(value ?? '') as Difficulty
  return ['beginner', 'intermediate', 'advanced', 'professional'].includes(difficulty)
    ? difficulty
    : null
}

const VALID_RESOURCE_TYPES = new Set<ResourceType>([
  'pdf',
  'image',
  'video',
  'worksheet',
  'link',
])

const VALID_STEP_TYPES = new Set<StepBlockType>(['text', 'image', 'video', 'link', 'diagram'])

function normalizeResourceType(value: unknown): ResourceType {
  return typeof value === 'string' && VALID_RESOURCE_TYPES.has(value as ResourceType)
    ? (value as ResourceType)
    : 'pdf'
}

function parseResources(value: FormDataEntryValue | null): LabResourcePayload[] {
  const rawResources = parseJson<Array<Record<string, unknown>>>(value, [])
  const resourceIds = new Set<string>()
  const resourceUrls = new Set<string>()

  return rawResources
    .map((resource) => ({
      id: typeof resource.id === 'string' && (resource.id as string).trim() ? (resource.id as string).trim() : crypto.randomUUID(),
      resource_type: normalizeResourceType(resource.resource_type),
      title: String(resource.title ?? '').trim(),
      description_ru: typeof resource.description_ru === 'string' ? (resource.description_ru as string).trim() : '',
      description_ky: typeof resource.description_ky === 'string' ? (resource.description_ky as string).trim() : '',
      url: String(resource.url ?? '').trim(),
      file_size:
        typeof resource.file_size === 'number' && Number.isFinite(resource.file_size)
          ? resource.file_size
          : null,
    }))
    .filter((resource) => resource.title.length > 0 && resource.url.length > 0)
    .filter((resource) => {
      const normalizedUrl = resource.url.toLowerCase()

      if (resourceIds.has(resource.id) || resourceUrls.has(normalizedUrl)) return false

      resourceIds.add(resource.id)
      resourceUrls.add(normalizedUrl)
      return true
    })
}

function parseSteps(value: FormDataEntryValue | null): LabStepDraft[] {
  return parseJson<Array<Record<string, unknown>>>(value, [])
    .map((step) => ({
      id: typeof step.id === 'string' ? step.id : crypto.randomUUID(),
      block_type: VALID_STEP_TYPES.has(step.block_type as StepBlockType)
        ? (step.block_type as StepBlockType)
        : 'text',
      content: String(step.content ?? '').trim(),
      caption: String(step.caption ?? '').trim(),
    }))
    .filter((step) => step.content.length > 0)
}

function buildStepRows(steps: LabStepDraft[], labId: string, locale: Locale): LabStep[] {
  return steps.map((step, index) => {
    const id = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(step.id)
      ? step.id
      : crypto.randomUUID()
    const content = step.content || null
    const caption = step.caption || null

    return {
      id,
      lab_id: labId,
      step_order: index + 1,
      block_type: step.block_type,
      content,
      content_ru: locale === 'ru' ? content : null,
      content_ky: locale === 'ky' ? content : null,
      caption,
      caption_ru: locale === 'ru' ? caption : null,
      caption_ky: locale === 'ky' ? caption : null,
    }
  })
}

function buildResourceRows(resources: LabResourcePayload[], labId: string): Resource[] {
  return resources.map((resource, index) => ({
    id: resource.id,
    lab_id: labId,
    resource_type: resource.resource_type,
    title: resource.title,
    title_ru: resource.title,
    title_ky: resource.title,
    description: resource.description_ru || resource.description_ky || null,
    description_ru: resource.description_ru || null,
    description_ky: resource.description_ky || null,
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

async function replaceRemoteSteps(
  supabase: Awaited<ReturnType<typeof createClient>>,
  labId: string,
  steps: LabStep[]
) {
  const { error: deleteError } = await supabase.from('lab_steps').delete().eq('lab_id', labId)
  if (deleteError) throw new Error(`Не удалось обновить шаги ${labId}: ${deleteError.message}`)
  if (steps.length === 0) return

  const { error: insertError } = await supabase.from('lab_steps').insert(steps)
  if (insertError) throw new Error(`Не удалось сохранить шаги ${labId}: ${insertError.message}`)
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

function buildPostgresLabRow(
  payload: LabMutationPayload,
  locale: Locale,
  { slug, createdAt, updatedAt }: { slug?: string; createdAt?: string; updatedAt?: string } = {}
) {
  return compactRow({
    ...(slug ? { slug } : {}),
    ...buildLocalizedTextColumns('title', payload.title, locale),
    ...buildLocalizedTextColumns('content', payload.content, locale),
    subject_id: payload.subject_id,
    grade_id: payload.grade_id,
    equipment_ids: payload.equipment_ids,
    difficulty: payload.difficulty,
    duration_minutes: payload.duration_minutes,
    photo_urls: payload.photo_urls && payload.photo_urls.length > 0 ? payload.photo_urls : [],
    is_published: payload.is_published,
    ...(createdAt ? { created_at: createdAt } : {}),
    ...(updatedAt ? { updated_at: updatedAt } : {}),
  })
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
    equipment_ids: payload.equipment_ids,
    difficulty: payload.difficulty,
    duration_minutes: payload.duration_minutes,
    is_published: payload.is_published,
    updated_at: updatedAt,
  })
}

function parsePayload(formData: FormData, slug: string): LabMutationPayload {
  const title = String(formData.get('title') ?? '').trim()

  return {
    title,
    slug,
    content: normalizeText(formData.get('content')),
    subject_id: normalizeText(formData.get('subject_id')),
    grade_id: normalizeText(formData.get('grade_id')),
    equipment_ids: parseJson<string[]>(formData.get('equipment_ids'), []),
    photo_urls: parseJson<string[]>(formData.get('photos'), []),
    difficulty: normalizeDifficulty(formData.get('difficulty')),
    duration_minutes: normalizeDuration(formData.get('duration_minutes')),
    steps: parseSteps(formData.get('steps')),
    resources: parseResources(formData.get('resources')),
    is_published: formData.get('is_published') === 'true',
  }
}

function revalidateLabPages(labId?: string) {
  if (labId) {
    revalidatePath(`/admin/labs/${labId}/edit`)
    revalidatePath(adminPath(`/labs/${labId}/edit`))
  }

  revalidatePath('/admin/labs')
  revalidatePath(adminPath('/labs'))
  revalidatePath('/labs')
  revalidatePath('/')
}

async function createPostgresLab(payload: LabMutationPayload, locale: Locale, slug: string) {
  const now = new Date().toISOString()
  const row = buildPostgresLabRow(payload, locale, { slug, createdAt: now, updatedAt: now })
  const columns = Object.keys(row)
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ')
  const values = Object.values(row)

  const client = await getPostgresPool(locale).connect()

  try {
    const { rows } = await client.query<Record<string, unknown>>(
      `INSERT INTO labs (${columns.join(', ')}) VALUES (${placeholders}) RETURNING id, slug, title, title_ru, title_ky, content, content_ru, content_ky, thumbnail_url, photo_urls, is_published, subject_id, grade_id, equipment_ids, difficulty, duration_minutes, created_at, updated_at`,
      values
    )


    const createdRow = rows[0]

    if (!createdRow) {
      throw new Error('Не удалось создать лабораторию в PostgreSQL.')
    }

    return {
      id: String(createdRow.id),
      slug: String(createdRow.slug ?? slug),
      title: String(createdRow.title ?? payload.title),
      title_ru: createdRow.title_ru ?? null,
      title_ky: createdRow.title_ky ?? null,
      content: createdRow.content ?? null,
      content_ru: createdRow.content_ru ?? null,
      content_ky: createdRow.content_ky ?? null,
      thumbnail_url: createdRow.thumbnail_url ?? null,
      photo_urls: Array.isArray(createdRow.photo_urls) ? (createdRow.photo_urls as string[]) : [],
      is_published: Boolean(createdRow.is_published),
      subject_id: createdRow.subject_id ? String(createdRow.subject_id) : null,
      grade_id: createdRow.grade_id ? String(createdRow.grade_id) : null,
      equipment_ids: Array.isArray(createdRow.equipment_ids) ? (createdRow.equipment_ids as string[]) : [],
      difficulty: (createdRow.difficulty as Difficulty | null) ?? undefined,
      duration_minutes: typeof createdRow.duration_minutes === 'number' ? createdRow.duration_minutes : null,
      created_at: String(createdRow.created_at ?? now),
      updated_at: String(createdRow.updated_at ?? now),
    } as Lab
  } finally {
    client.release()
  }
}

async function replacePostgresResources(labId: string, resources: Resource[], locale: Locale) {
  if (resources.length === 0) {
    await getPostgresPool(locale).query('DELETE FROM resources WHERE lab_id = $1', [labId])
    return
  }


  const values: unknown[] = []
  const params: string[] = []

  for (const [index, resource] of resources.entries()) {
    const offset = index * 12
    params.push(
      `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}, now(), now())`
    )
    values.push(
      resource.id,
      labId,
      resource.resource_type,
      resource.title,
      resource.title_ru ?? resource.title,
      resource.title_ky ?? resource.title,
      resource.description ?? null,
      resource.description_ru ?? null,
      resource.description_ky ?? null,
      resource.url,
      resource.file_size ?? null,
      index,
    )
  }

  const client = await getPostgresPool(locale).connect()
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM resources WHERE lab_id = $1', [labId])

    await client.query(
      `INSERT INTO resources (id, lab_id, resource_type, title, title_ru, title_ky, description, description_ru, description_ky, url, file_size, sort_order, created_at, updated_at)
       VALUES ${params.join(', ')}`,
      values
    )
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    client.release()
  }
}

async function replacePostgresSteps(labId: string, steps: LabStep[], locale: Locale) {
  if (steps.length === 0) {
    await getPostgresPool(locale).query('DELETE FROM lab_steps WHERE lab_id = $1', [labId])
    return
  }


  const values: unknown[] = []
  const params: string[] = []

  for (const step of steps) {
    const offset = params.length * 10
    params.push(
      `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, now(), now())`
    )
    values.push(
      step.id,
      labId,
      step.step_order,
      step.block_type,
      step.content,
      step.content_ru ?? null,
      step.content_ky ?? null,
      step.caption,
      step.caption_ru ?? null,
      step.caption_ky ?? null,
    )
  }

  const client = await getPostgresPool(locale).connect()
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM lab_steps WHERE lab_id = $1', [labId])

    await client.query(
      `INSERT INTO lab_steps (id, lab_id, step_order, block_type, content, content_ru, content_ky, caption, caption_ru, caption_ky, created_at, updated_at)
       VALUES ${params.join(', ')}`,
      values
    )
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    client.release()
  }
}

async function updatePostgresLab(labId: string, payload: LabMutationPayload, locale: Locale) {
  const now = new Date().toISOString()
  const row = buildPostgresLabRow(payload, locale, { updatedAt: now })
  const columns = Object.entries(row)
  const assignments = columns.map(([column], index) => `${column} = $${index + 2}`).join(', ')
  const values = columns.map(([, value]) => value)

  const client = await getPostgresPool(locale).connect()

  try {
    const { rows } = await client.query<Record<string, unknown>>(
      `UPDATE labs SET ${assignments} WHERE id = $1 RETURNING id, slug, title, title_ru, title_ky, content, content_ru, content_ky, thumbnail_url, photo_urls, is_published, subject_id, grade_id, equipment_ids, difficulty, duration_minutes, created_at, updated_at`,
      [labId, ...values]
    )


    const updatedRow = rows[0]

    if (!updatedRow) {
      throw new Error('Не удалось обновить лабораторию в PostgreSQL.')
    }

    return {
      id: String(updatedRow.id),
      slug: String(updatedRow.slug ?? payload.slug),
      title: String(updatedRow.title ?? payload.title),
      title_ru: updatedRow.title_ru ?? null,
      title_ky: updatedRow.title_ky ?? null,
      content: updatedRow.content ?? null,
      content_ru: updatedRow.content_ru ?? null,
      content_ky: updatedRow.content_ky ?? null,
      thumbnail_url: updatedRow.thumbnail_url ?? null,
      photo_urls: Array.isArray(updatedRow.photo_urls) ? (updatedRow.photo_urls as string[]) : [],
      is_published: Boolean(updatedRow.is_published),
      subject_id: updatedRow.subject_id ? String(updatedRow.subject_id) : null,
      grade_id: updatedRow.grade_id ? String(updatedRow.grade_id) : null,
      equipment_ids: Array.isArray(updatedRow.equipment_ids) ? (updatedRow.equipment_ids as string[]) : [],
      difficulty: (updatedRow.difficulty as Difficulty | null) ?? undefined,
      duration_minutes: typeof updatedRow.duration_minutes === 'number' ? updatedRow.duration_minutes : null,
      created_at: String(updatedRow.created_at ?? now),
      updated_at: String(updatedRow.updated_at ?? now),
    } as Lab
  } finally {
    client.release()
  }
}

async function togglePostgresPublish(labId: string, published: boolean, locale: Locale) {
  const client = await getPostgresPool(locale).connect()


  try {
    const { rows } = await client.query<Record<string, unknown>>(
      `UPDATE labs SET is_published = $2, updated_at = now() WHERE id = $1 RETURNING id, slug, title, title_ru, title_ky, content, content_ru, content_ky, thumbnail_url, photo_urls, is_published, subject_id, grade_id, equipment_ids, created_at, updated_at`,
      [labId, published]
    )

    const updatedRow = rows[0]

    if (!updatedRow) {
      throw new Error('Не удалось обновить состояние публикации.')
    }

    return {
      id: String(updatedRow.id),
      slug: String(updatedRow.slug ?? ''),
      title: String(updatedRow.title ?? ''),
      title_ru: updatedRow.title_ru ?? null,
      title_ky: updatedRow.title_ky ?? null,
      content: updatedRow.content ?? null,
      content_ru: updatedRow.content_ru ?? null,
      content_ky: updatedRow.content_ky ?? null,
      thumbnail_url: updatedRow.thumbnail_url ?? null,
      photo_urls: Array.isArray(updatedRow.photo_urls) ? (updatedRow.photo_urls as string[]) : [],
      is_published: Boolean(updatedRow.is_published),
      subject_id: updatedRow.subject_id ? String(updatedRow.subject_id) : null,
      grade_id: updatedRow.grade_id ? String(updatedRow.grade_id) : null,
      equipment_ids: Array.isArray(updatedRow.equipment_ids) ? (updatedRow.equipment_ids as string[]) : [],
      created_at: String(updatedRow.created_at ?? new Date().toISOString()),
      updated_at: String(updatedRow.updated_at ?? new Date().toISOString()),
    } as Lab
  } finally {
    client.release()
  }
}

async function deletePostgresLab(labId: string, locale: Locale) {
  const client = await getPostgresPool(locale).connect()


  try {
    await client.query('DELETE FROM lab_equipment_items WHERE lab_id = $1', [labId])
    await client.query('DELETE FROM resources WHERE lab_id = $1', [labId])
    await client.query('DELETE FROM lab_steps WHERE lab_id = $1', [labId])
    await client.query('DELETE FROM labs WHERE id = $1', [labId])
  } finally {
    client.release()
  }
}

export async function createLabAction(formData: FormData) {
  await assertServerLocalAdminAccess()
  const locale = resolveLocale(String(formData.get('locale') ?? (await getCurrentLocale())))
  const provider = getDataProvider()
  const payload = parsePayload(
    formData,
    buildSlug(String(formData.get('title') ?? ''), locale)
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
      const stepRows = buildStepRows(payload.steps, lab.id, locale)
      await Promise.all([
        replaceRemoteResources(supabase, lab.id, resourceRows),
        replaceRemoteSteps(supabase, lab.id, stepRows),
      ])

      if (shouldMirrorLocalData(provider)) {
        await syncLocalLabMirror(
          {
            lab: toStoredLab(lab),
            resources: resourceRows,
            steps: stepRows,
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

  if (canUsePostgresWrites(provider)) {
    try {
      const remoteLab = await createPostgresLab(payload, locale, payload.slug)
      const resourceRows = buildResourceRows(payload.resources, remoteLab.id)
      const stepRows = buildStepRows(payload.steps, remoteLab.id, locale)
      await replacePostgresResources(remoteLab.id, resourceRows, locale)
      await replacePostgresSteps(remoteLab.id, stepRows, locale)
      await syncLocalLabMirror({ lab: toStoredLab(remoteLab as Lab), resources: resourceRows, steps: stepRows }, locale)
      revalidateLabPages()
      return

    } catch (error) {
      if (!shouldMirrorLocalData(provider)) {
        throw error
      }
    }
  }

  const localLab = await createLocalLab({
    ...payload,
    photo_urls: payload.photo_urls && payload.photo_urls.length > 0 ? payload.photo_urls : null,
  }, locale)
  await syncLocalLabMirror(
    {
      lab: toStoredLab(localLab),
      resources: buildResourceRows(payload.resources, localLab.id),
      steps: localLab.lab_steps,
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

  if (canUsePostgresWrites(provider)) {
    try {
      await deletePostgresLab(labId, currentLocale)
      await deleteLocalLab(labId, currentLocale)

      revalidateLabPages(labId)
      return
    } catch (error) {
      if (!shouldMirrorLocalData(provider)) {
        throw error
      }
    }
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

  if (canUsePostgresWrites(provider)) {
    try {
      await togglePostgresPublish(labId, published, currentLocale)
      await toggleLocalLab(labId, published, currentLocale)

      revalidateLabPages(labId)
      return
    } catch (error) {
      if (!shouldMirrorLocalData(provider)) {
        throw error
      }
    }
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
    localMirror?.slug ?? buildSlug(String(formData.get('title') ?? ''), locale)
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
      const stepRows = buildStepRows(payload.steps, lab.id, locale)
      await Promise.all([
        replaceRemoteResources(supabase, lab.id, resourceRows),
        replaceRemoteSteps(supabase, lab.id, stepRows),
      ])

      if (shouldMirrorLocalData(provider)) {
        await syncLocalLabMirror(
          {
            lab: toStoredLab(lab),
            resources: resourceRows,
            steps: stepRows,
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

  if (canUsePostgresWrites(provider)) {
    try {
      const remoteLab = await updatePostgresLab(labId, payload, locale)
      const resourceRows = buildResourceRows(payload.resources, remoteLab.id)
      const stepRows = buildStepRows(payload.steps, remoteLab.id, locale)
      await replacePostgresResources(remoteLab.id, resourceRows, locale)
      await replacePostgresSteps(remoteLab.id, stepRows, locale)
      await syncLocalLabMirror({ lab: toStoredLab(remoteLab as Lab), resources: resourceRows, steps: stepRows }, locale)
      revalidateLabPages(labId)
      return

    } catch (error) {
      if (!shouldMirrorLocalData(provider)) {
        throw error
      }
    }
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
      steps: localLab.lab_steps,
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

  // Local fallback: save to local DB
  const { getLocalLabById, syncLocalLabMirror, toStoredLab } = await import('@/lib/local-db')
  const existingLab = await getLocalLabById(labId, currentLocale)
  if (existingLab) {
    const newResource: Resource = {
      id: crypto.randomUUID(),
      lab_id: labId,
      resource_type: resourceType,
      title,
      title_ru: title,
      title_ky: title,
      url,
      file_size: null,
      sort_order: (existingLab.resources?.length ?? 0),
    }
    const updatedResources = [...(existingLab.resources ?? []), newResource]
    const updatedLab: Lab = { ...existingLab, resources: updatedResources }
    await syncLocalLabMirror({
      lab: toStoredLab(updatedLab),
      resources: updatedResources,
    }, currentLocale)
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

  // Local fallback: remove from local DB
  const { getLocalLabById, syncLocalLabMirror, toStoredLab } = await import('@/lib/local-db')
  const existingLab = await getLocalLabById(labId, currentLocale)
  if (existingLab) {
    const updatedResources = (existingLab.resources ?? []).filter((r) => r.id !== resourceId)
    const updatedLab: Lab = { ...existingLab, resources: updatedResources }
    await syncLocalLabMirror({
      lab: toStoredLab(updatedLab),
      resources: updatedResources,
    }, currentLocale)
  }

  revalidateLabPages(labId)
}
