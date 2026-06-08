import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getDataProvider } from '@/lib/data-provider'
import {
  getLocalEquipment,
  getLocalGrades,
  getLocalLabById,
  getLocalSubjects,
} from '@/lib/local-db'
import { resolveLocale } from '@/lib/locale'
import { buildLocalizedTextColumns, compactRow } from '@/lib/supabase-localization'
import { createAdminClient, hasSupabaseAdminEnv } from '@/lib/supabase/admin'
import type { Equipment, Grade, Locale, Subject } from '@/types'

type PendingLabSyncAction = 'upsert' | 'delete'

export interface PendingLabSyncItem {
  labId: string
  locale: Locale
  action: PendingLabSyncAction
  updatedAt: string
}

export interface PendingLabSyncSummary {
  total: number
  upserts: number
  deletes: number
}

export interface FlushPendingLabSyncResult {
  attempted: number
  synced: number
  skipped: boolean
  errors: string[]
}

const SYNC_QUEUE_FILE_PATH = path.join(/* turbopackIgnore: true */ process.cwd(), 'data', 'sync-queue.json')

let queueLock: Promise<void> = Promise.resolve()

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

async function ensureQueueFile() {
  await mkdir(path.dirname(SYNC_QUEUE_FILE_PATH), { recursive: true })

  try {
    await readFile(SYNC_QUEUE_FILE_PATH, 'utf8')
  } catch {
    await writeFile(SYNC_QUEUE_FILE_PATH, '[]\n', 'utf8')
  }
}

async function readQueue() {
  await ensureQueueFile()

  try {
    const raw = await readFile(SYNC_QUEUE_FILE_PATH, 'utf8')
    const parsed = JSON.parse(raw) as PendingLabSyncItem[]

    if (!Array.isArray(parsed)) {
      return [] as PendingLabSyncItem[]
    }

    return parsed
      .filter(
        (item): item is PendingLabSyncItem =>
          Boolean(
            item &&
              typeof item.labId === 'string' &&
              typeof item.updatedAt === 'string' &&
              (item.action === 'upsert' || item.action === 'delete') &&
              (item.locale === 'ru' || item.locale === 'ky')
          )
      )
      .sort((left, right) => left.updatedAt.localeCompare(right.updatedAt))
  } catch {
    await writeFile(SYNC_QUEUE_FILE_PATH, '[]\n', 'utf8')
    return []
  }
}

async function writeQueue(queue: PendingLabSyncItem[]) {
  await ensureQueueFile()
  const tempFilePath = `${SYNC_QUEUE_FILE_PATH}.${process.pid}.${Date.now()}.tmp`
  await writeFile(tempFilePath, `${JSON.stringify(queue, null, 2)}\n`, 'utf8')
  await rename(tempFilePath, SYNC_QUEUE_FILE_PATH)
}

async function withQueueLock<T>(mutate: (queue: PendingLabSyncItem[]) => Promise<T> | T) {
  let result!: T

  const task = queueLock.then(async () => {
    const queue = await readQueue()
    result = await mutate(queue)
    await writeQueue(queue)
  })

  queueLock = task.then(
    () => undefined,
    () => undefined
  )

  await task
  return result
}

function resolveRemoteSubjectId(
  subjectId: string | null | undefined,
  localSubjects: Subject[],
  remoteSubjects: Subject[]
) {
  if (!subjectId) return null
  if (remoteSubjects.some((subject) => subject.id === subjectId)) return subjectId

  const localSubject = localSubjects.find((subject) => subject.id === subjectId)
  if (!localSubject) return null

  return remoteSubjects.find((subject) => subject.slug === localSubject.slug)?.id ?? null
}

function resolveRemoteGradeId(
  gradeId: string | null | undefined,
  localGrades: Grade[],
  remoteGrades: Grade[]
) {
  if (!gradeId) return null
  if (remoteGrades.some((grade) => grade.id === gradeId)) return gradeId

  const localGrade = localGrades.find((grade) => grade.id === gradeId)
  if (!localGrade) return null

  return remoteGrades.find((grade) => grade.level === localGrade.level)?.id ?? null
}

function resolveRemoteEquipmentId(
  equipmentId: string | null | undefined,
  localEquipment: Equipment[],
  remoteEquipment: Equipment[]
) {
  if (!equipmentId) return null
  if (remoteEquipment.some((equipment) => equipment.id === equipmentId)) return equipmentId

  const localItem = localEquipment.find((equipment) => equipment.id === equipmentId)
  if (!localItem) return null

  return remoteEquipment.find((equipment) => equipment.slug === localItem.slug)?.id ?? null
}

function removeQueuedItem(queue: PendingLabSyncItem[], labId: string, locale: Locale) {
  const index = queue.findIndex((item) => item.labId === labId && item.locale === locale)
  if (index >= 0) {
    queue.splice(index, 1)
  }
}

async function fetchRemoteCatalogs() {
  const supabase = createAdminClient()
  const [subjectsResult, gradesResult, equipmentResult] = await Promise.all([
    supabase.from('subjects').select('id, slug, name, name_ru, name_ky, icon, color, sort_order'),
    supabase.from('grades').select('id, level, label, label_ru, label_ky'),
    supabase.from('equipment').select('id, name, name_ru, name_ky, slug, subject_id'),
  ])

  if (subjectsResult.error) {
    throw new Error(`Не удалось загрузить предметы из Supabase: ${subjectsResult.error.message}`)
  }

  if (gradesResult.error) {
    throw new Error(`Не удалось загрузить классы из Supabase: ${gradesResult.error.message}`)
  }

  if (equipmentResult.error) {
    throw new Error(`Не удалось загрузить оборудование из Supabase: ${equipmentResult.error.message}`)
  }

  return {
    subjects: (subjectsResult.data ?? []) as Subject[],
    grades: (gradesResult.data ?? []) as Grade[],
    equipment: (equipmentResult.data ?? []) as Equipment[],
  }
}

async function syncLabToRemote(
  labId: string,
  locale: Locale,
  remoteCatalogs: Awaited<ReturnType<typeof fetchRemoteCatalogs>>
) {
  const localLab = await getLocalLabById(labId, locale)
  const supabase = createAdminClient()

  if (!localLab) {
    const { error } = await supabase.from('labs').delete().eq('id', labId)

    if (error) {
      throw new Error(`Не удалось удалить лабораторию ${labId}: ${error.message}`)
    }

    return
  }

  const [localSubjects, localGrades, localEquipment] = await Promise.all([
    getLocalSubjects(locale),
    getLocalGrades(locale),
    getLocalEquipment(locale),
  ])

  const labRow = compactRow({
    id: localLab.id,
    slug: localLab.slug,
    ...buildLocalizedTextColumns('title', localLab.title, locale),
    ...buildLocalizedTextColumns('topic', localLab.topic, locale),
    ...buildLocalizedTextColumns('goal', localLab.goal, locale),
    ...buildLocalizedTextColumns('expected_results', localLab.expected_results, locale),
    ...buildLocalizedTextColumns('teacher_notes', localLab.teacher_notes, locale),
    thumbnail_url: localLab.thumbnail_url,
    duration_minutes: localLab.duration_minutes,
    difficulty: localLab.difficulty,
    is_published: localLab.is_published,
    subject_id: resolveRemoteSubjectId(
      localLab.subject_id,
      localSubjects,
      remoteCatalogs.subjects
    ),
    grade_id: resolveRemoteGradeId(localLab.grade_id, localGrades, remoteCatalogs.grades),
    equipment_id: resolveRemoteEquipmentId(
      localLab.equipment_ids?.[0] ?? null,
      localEquipment,
      remoteCatalogs.equipment
    ),
    created_at: localLab.created_at,
    updated_at: localLab.updated_at,
  })

  const { error: labError } = await supabase.from('labs').upsert(labRow, {
    onConflict: 'id',
  })

  if (labError) {
    throw new Error(`Не удалось синхронизировать лабораторию ${labId}: ${labError.message}`)
  }

  const { error: deleteStepsError } = await supabase.from('lab_steps').delete().eq('lab_id', labId)
  if (deleteStepsError) {
    throw new Error(`Не удалось очистить шаги ${labId}: ${deleteStepsError.message}`)
  }

  const { error: deleteResourcesError } = await supabase
    .from('resources')
    .delete()
    .eq('lab_id', labId)
  if (deleteResourcesError) {
    throw new Error(`Не удалось очистить ресурсы ${labId}: ${deleteResourcesError.message}`)
  }

  const { error: deleteEquipmentError } = await supabase
    .from('lab_equipment_items')
    .delete()
    .eq('lab_id', labId)
  if (deleteEquipmentError) {
    throw new Error(
      `Не удалось очистить оборудование лаборатории ${labId}: ${deleteEquipmentError.message}`
    )
  }

  if (localLab.lab_steps?.length) {
    const { error } = await supabase.from('lab_steps').insert(
      localLab.lab_steps.map((step) => ({
        id: step.id,
        lab_id: labId,
        step_order: step.step_order,
        block_type: step.block_type,
        ...buildLocalizedTextColumns('content', step.content, locale),
        ...buildLocalizedTextColumns('caption', step.caption, locale),
      }))
    )

    if (error) {
      throw new Error(`Не удалось синхронизировать шаги ${labId}: ${error.message}`)
    }
  }

  if (localLab.resources?.length) {
    const { error } = await supabase.from('resources').insert(
      localLab.resources.map((resource) => ({
        id: resource.id,
        lab_id: labId,
        resource_type: resource.resource_type,
        ...buildLocalizedTextColumns('title', resource.title, locale),
        url: resource.url,
        file_size: resource.file_size,
        sort_order: resource.sort_order,
      }))
    )

    if (error) {
      throw new Error(`Не удалось синхронизировать ресурсы ${labId}: ${error.message}`)
    }
  }

  if (localLab.equipment_items?.length) {
    const { error } = await supabase.from('lab_equipment_items').insert(
      localLab.equipment_items.map((item) => ({
        id: item.id,
        lab_id: labId,
        ...buildLocalizedTextColumns('item_name', item.item_name, locale),
        quantity: item.quantity,
        ...buildLocalizedTextColumns('notes', item.notes, locale),
        sort_order: item.sort_order,
      }))
    )

    if (error) {
      throw new Error(`Не удалось синхронизировать оборудование ${labId}: ${error.message}`)
    }
  }
}

async function deleteLabFromRemote(labId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('labs').delete().eq('id', labId)

  if (error) {
    throw new Error(`Не удалось удалить лабораторию ${labId}: ${error.message}`)
  }
}

export async function queueLabSync(
  labId: string,
  action: PendingLabSyncAction,
  locale?: Locale
) {
  const currentLocale = resolveLocale(locale)

  return withQueueLock((queue) => {
    removeQueuedItem(queue, labId, currentLocale)
    queue.push({
      labId,
      locale: currentLocale,
      action,
      updatedAt: new Date().toISOString(),
    })
  })
}

export async function clearQueuedLabSync(labId: string, locale?: Locale) {
  const currentLocale = locale ? resolveLocale(locale) : null

  return withQueueLock((queue) => {
    for (let index = queue.length - 1; index >= 0; index -= 1) {
      const matchesLab = queue[index].labId === labId
      const matchesLocale = currentLocale ? queue[index].locale === currentLocale : true

      if (matchesLab && matchesLocale) {
        queue.splice(index, 1)
      }
    }
  })
}

export async function getPendingLabSyncSummary(locale?: Locale): Promise<PendingLabSyncSummary> {
  const currentLocale = locale ? resolveLocale(locale) : null
  const queue = await readQueue()
  const filteredQueue = currentLocale ? queue.filter((item) => item.locale === currentLocale) : queue

  return {
    total: filteredQueue.length,
    upserts: filteredQueue.filter((item) => item.action === 'upsert').length,
    deletes: filteredQueue.filter((item) => item.action === 'delete').length,
  }
}

export async function flushPendingLabSync(locale?: Locale): Promise<FlushPendingLabSyncResult> {
  const provider = getDataProvider()
  const currentLocale = locale ? resolveLocale(locale) : null

  if (provider === 'local' || !hasSupabaseAdminEnv()) {
    const summary = await getPendingLabSyncSummary(currentLocale ?? undefined)

    return {
      attempted: summary.total,
      synced: 0,
      skipped: true,
      errors: [],
    }
  }

  return withQueueLock(async (queue) => {
    const errors: string[] = []
    const targetItems = currentLocale
      ? queue.filter((item) => item.locale === currentLocale)
      : clone(queue)

    if (targetItems.length === 0) {
      return {
        attempted: 0,
        synced: 0,
        skipped: false,
        errors,
      }
    }

    let remoteCatalogs: Awaited<ReturnType<typeof fetchRemoteCatalogs>> | null = null
    let synced = 0

    for (const item of targetItems) {
      try {
        remoteCatalogs ??= await fetchRemoteCatalogs()

        if (item.action === 'delete') {
          await deleteLabFromRemote(item.labId)
        } else {
          await syncLabToRemote(item.labId, item.locale, remoteCatalogs)
        }

        removeQueuedItem(queue, item.labId, item.locale)
        synced += 1
      } catch (error) {
        errors.push(error instanceof Error ? error.message : 'Неизвестная ошибка синхронизации.')
      }
    }

    return {
      attempted: targetItems.length,
      synced,
      skipped: false,
      errors,
    }
  })
}
