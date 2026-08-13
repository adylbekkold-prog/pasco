import { createClient } from './supabase/server'
import { getDataProvider, shouldMirrorLocalData, shouldTrySupabaseData } from './data-provider'
import { hasPostgresEnv, queryPostgres } from './database/postgres'
import { getCurrentLocale } from './locale-server'
import {
  getLocalEquipment,
  getLocalGrades,
  getLocalLabById,
  getLocalLabBySlug,
  getLocalLabs,
  getLocalPascoKitById,
  getLocalPascoKitBySlug,
  getLocalPascoKits,
  getLocalSubjects,
  syncLocalCatalogs,
  syncLocalLabMirror,
  toStoredLab,
} from './local-db'
import { flushPendingLabSync } from './sync-queue'
import {
  hasLocalizedText,
  localizeEquipment,
  localizeEquipmentItem,
  localizeGrade,
  localizeLab,
  localizeLabStep,
  localizeResource,
  localizeSubject,
} from './supabase-localization'
import { getSupabasePublicEnvIssue, hasSupabasePublicEnv } from './supabase/env'
import type {
  Equipment,
  EquipmentItem,
  Grade,
  Lab,
  LabStep,
  Locale,
  PascoKit,
  PascoKitComponent,
  Resource,
  Subject,
} from '@/types'


type LabRow = Omit<
  Lab,
  'subjects' | 'grades' | 'equipment' | 'lab_steps' | 'resources' | 'equipment_items'
>

function asError(error: unknown, fallback: string) {
  if (error instanceof Error) return error

  if (error && typeof error === 'object' && 'message' in error) {
    const message = typeof error.message === 'string' ? error.message : fallback
    const nextError = new Error(message) as Error & { code?: string }

    if ('code' in error && typeof error.code === 'string') {
      nextError.code = error.code
    }

    return nextError
  }

  return new Error(fallback)
}

function createNotFoundError(message: string) {
  const error = new Error(message) as Error & { code?: string }
  error.code = 'PGRST116'
  return error
}

function getRemoteRequiredError(provider = getDataProvider()) {
  if (provider === 'postgresql') {
    return new Error('Не удалось подключиться к PostgreSQL. Проверьте DATABASE_URL в .env.local.')
  }

  return new Error(
    getSupabasePublicEnvIssue() ?? 'Не удалось подключиться к каталогу Supabase.'
  )
}

function canUseSupabase(provider = getDataProvider()) {
  return (provider === 'supabase' || provider === 'hybrid') && shouldTrySupabaseData(provider) && hasSupabasePublicEnv()
}

function canUseRemoteData(provider = getDataProvider()) {
  return canUseSupabase(provider) || (provider === 'postgresql' && hasPostgresEnv())
}

function normalizeNullableString(value: unknown) {
  return typeof value === 'string' ? value : null
}

function normalizeString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function normalizeNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim()) return Number(value)
  return fallback
}

function normalizeBoolean(value: unknown, fallback = false) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value.toLowerCase() === 'true'
  return fallback
}

function normalizeSubject(row: Record<string, unknown>): Subject {
  return {
    id: normalizeString(row.id),
    name: normalizeString(row.name),
    name_ru: normalizeNullableString(row.name_ru),
    name_ky: normalizeNullableString(row.name_ky),
    slug: normalizeString(row.slug),
    icon: normalizeNullableString(row.icon),
    color: normalizeNullableString(row.color),
    sort_order: normalizeNumber(row.sort_order, 0),
  }
}

function normalizeGrade(row: Record<string, unknown>): Grade {
  return {
    id: normalizeString(row.id),
    level: normalizeNumber(row.level, 0),
    label: normalizeString(row.label),
    label_ru: normalizeNullableString(row.label_ru),
    label_ky: normalizeNullableString(row.label_ky),
  }
}

function normalizeEquipment(row: Record<string, unknown>): Equipment {
  return {
    id: normalizeString(row.id),
    name: normalizeString(row.name),
    name_ru: normalizeNullableString(row.name_ru),
    name_ky: normalizeNullableString(row.name_ky),
    slug: normalizeString(row.slug),
    subject_id: normalizeNullableString(row.subject_id),
  }
}

function normalizeLabRow(row: Record<string, unknown>): LabRow {
  return {
    id: normalizeString(row.id),
    title: normalizeString(row.title),
    title_ru: normalizeNullableString(row.title_ru),
    title_ky: normalizeNullableString(row.title_ky),
    slug: normalizeString(row.slug),
    content: normalizeNullableString(row.content),
    content_ru: normalizeNullableString(row.content_ru),
    content_ky: normalizeNullableString(row.content_ky),
    thumbnail_url: normalizeNullableString(row.thumbnail_url),
    photo_urls: Array.isArray(row.photo_urls) ? (row.photo_urls as string[]) : [],
    is_published: normalizeBoolean(row.is_published, false),
    subject_id: normalizeNullableString(row.subject_id),
    grade_id: normalizeNullableString(row.grade_id),
    equipment_ids: Array.isArray(row.equipment_ids) ? (row.equipment_ids as string[]) : [],
    difficulty: normalizeNullableString(row.difficulty) as Lab['difficulty'],
    duration_minutes: normalizeNumber(row.duration_minutes, 0) || null,
    created_at: normalizeString(row.created_at, new Date(0).toISOString()),
    updated_at: normalizeString(row.updated_at, new Date(0).toISOString()),
  }
}

function normalizeLabStep(row: Record<string, unknown>): LabStep {
  return {
    id: normalizeString(row.id),
    lab_id: normalizeString(row.lab_id),
    step_order: normalizeNumber(row.step_order, 0),
    block_type: normalizeString(row.block_type, 'text') as LabStep['block_type'],
    content: normalizeNullableString(row.content),
    content_ru: normalizeNullableString(row.content_ru),
    content_ky: normalizeNullableString(row.content_ky),
    caption: normalizeNullableString(row.caption),
    caption_ru: normalizeNullableString(row.caption_ru),
    caption_ky: normalizeNullableString(row.caption_ky),
  }
}

function normalizeResource(row: Record<string, unknown>): Resource {
  return {
    id: normalizeString(row.id),
    lab_id: normalizeString(row.lab_id),
    resource_type: normalizeString(row.resource_type, 'link') as Resource['resource_type'],
    title: normalizeString(row.title),
    title_ru: normalizeNullableString(row.title_ru),
    title_ky: normalizeNullableString(row.title_ky),
    description: normalizeNullableString(row.description),
    description_ru: normalizeNullableString(row.description_ru),
    description_ky: normalizeNullableString(row.description_ky),
    url: normalizeString(row.url),
    file_size: normalizeNumber(row.file_size, 0) || null,
    sort_order: normalizeNumber(row.sort_order, 0),
  }
}

function normalizeEquipmentItem(row: Record<string, unknown>): EquipmentItem {
  return {
    id: normalizeString(row.id),
    lab_id: normalizeString(row.lab_id),
    item_name: normalizeString(row.item_name),
    item_name_ru: normalizeNullableString(row.item_name_ru),
    item_name_ky: normalizeNullableString(row.item_name_ky),
    quantity: normalizeNumber(row.quantity, 1),
    notes: normalizeNullableString(row.notes),
    notes_ru: normalizeNullableString(row.notes_ru),
    notes_ky: normalizeNullableString(row.notes_ky),
    sort_order: normalizeNumber(row.sort_order, 0),
  }
}

function getLabTimestamp(lab: Pick<Lab, 'created_at' | 'updated_at'>) {
  return new Date(lab.updated_at || lab.created_at).getTime()
}

function mergeById<T extends { id: string }>(
  primary: T[],
  fallback: T[],
  sorter?: (left: T, right: T) => number
) {
  const merged = new Map<string, T>(fallback.map((item) => [item.id, item]))

  for (const item of primary) {
    merged.set(item.id, item)
  }

  const items = Array.from(merged.values())
  return sorter ? items.sort(sorter) : items
}

function mergeLabs(primary: Lab[], fallback: Lab[]) {
  const merged = new Map<string, Lab>()

  for (const lab of fallback) {
    merged.set(lab.id, lab)
  }

  for (const lab of primary) {
    const current = merged.get(lab.id)
    if (!current || getLabTimestamp(lab) >= getLabTimestamp(current)) {
      merged.set(lab.id, lab)
    }
  }

  return Array.from(merged.values()).sort(
    (left, right) => getLabTimestamp(right) - getLabTimestamp(left)
  )
}

function localizeRemoteSubjects(
  remoteSubjects: Subject[],
  locale: Locale,
  fallbackSubjects: Subject[]
) {
  const localizedBySlug = new Map(fallbackSubjects.map((subject) => [subject.slug, subject]))

  return remoteSubjects.flatMap((subject) => {
    const fallback = localizedBySlug.get(subject.slug)

    if (!hasLocalizedText(subject, 'name', locale) && !fallback) return []

    return [localizeSubject(subject, locale, fallback)]
  })
}

function localizeRemoteGrades(remoteGrades: Grade[], locale: Locale, fallbackGrades: Grade[]) {
  const localizedByLevel = new Map(fallbackGrades.map((grade) => [grade.level, grade]))

  return remoteGrades.flatMap((grade) => {
    const fallback = localizedByLevel.get(grade.level)

    if (!hasLocalizedText(grade, 'label', locale) && !fallback) return []

    return [localizeGrade(grade, locale, fallback)]
  })
}

function localizeRemoteEquipment(
  remoteEquipment: Equipment[],
  locale: Locale,
  fallbackEquipment: Equipment[]
) {
  const localizedBySlug = new Map(fallbackEquipment.map((equipment) => [equipment.slug, equipment]))

  return remoteEquipment.flatMap((item) => {
    const fallback = localizedBySlug.get(item.slug)

    if (!hasLocalizedText(item, 'name', locale) && !fallback) return []

    return [localizeEquipment(item, locale, fallback)]
  })
}

function localizeRemoteLabs(remoteLabs: LabRow[], locale: Locale, fallbackLabs: Lab[] = []) {
  const localizedById = new Map(fallbackLabs.map((lab) => [lab.id, lab]))

  return remoteLabs.flatMap((lab) => {
    const fallback = localizedById.get(lab.id)

    if (!hasLocalizedText(lab, 'title', locale) && !fallback) return []

    return [localizeLab(lab as Lab, locale, fallback) as LabRow]
  })
}

async function loadRelations(labs: LabRow[], locale?: Locale) {
  if (labs.length === 0) return [] as Lab[]

  const [subjects, grades, equipment] = await Promise.all([
    getSubjects(locale),
    getGrades(locale),
    getEquipment(locale),
  ])

  const subjectsMap = new Map(subjects.map((subject) => [subject.id, subject]))
  const gradesMap = new Map(grades.map((grade) => [grade.id, grade]))
  const equipmentMap = new Map(equipment.map((item) => [item.id, item]))

  return labs.map((lab) => ({
    ...lab,
    subjects: lab.subject_id ? subjectsMap.get(lab.subject_id) ?? null : null,
    grades: lab.grade_id ? gradesMap.get(lab.grade_id) ?? null : null,
    equipment: lab.equipment_ids && lab.equipment_ids.length > 0
      ? lab.equipment_ids
          .map((eqId) => equipmentMap.get(eqId))
          .filter((eq): eq is Equipment => eq !== undefined)
      : [],
  }))
}

async function fetchRemoteSubjects(locale: Locale = 'ru') {
  if (getDataProvider() === 'postgresql') {
    return (await queryPostgres<Record<string, unknown>>(
      `SELECT id, slug, name, name_ru, name_ky, icon, color, sort_order
       FROM subjects
       ORDER BY sort_order`,
      [],
      locale
    )).map(normalizeSubject)
  }


  const supabase = await createClient()
  const { data, error } = await supabase.from('subjects').select('*').order('sort_order')

  if (error) {
    throw asError(error, 'Не удалось загрузить предметы.')
  }

  return (data ?? []) as Subject[]
}

async function fetchRemoteGrades(locale: Locale = 'ru') {
  if (getDataProvider() === 'postgresql') {
    return (await queryPostgres<Record<string, unknown>>(
      `SELECT id, level, label, label_ru, label_ky
       FROM grades
       ORDER BY level`,
      [],
      locale
    )).map(normalizeGrade)
  }


  const supabase = await createClient()
  const { data, error } = await supabase.from('grades').select('*').order('level')

  if (error) {
    throw asError(error, 'Не удалось загрузить классы.')
  }

  return (data ?? []) as Grade[]
}

async function fetchRemoteEquipment(locale: Locale = 'ru') {
  if (getDataProvider() === 'postgresql') {
    return (await queryPostgres<Record<string, unknown>>(
      `SELECT id, slug, name, name_ru, name_ky, subject_id
       FROM equipment
       ORDER BY name`,
      [],
      locale
    )).map(normalizeEquipment)
  }


  const supabase = await createClient()
  const { data, error } = await supabase.from('equipment').select('*').order('name')

  if (error) {
    throw asError(error, 'Не удалось загрузить оборудование.')
  }

  return (data ?? []) as Equipment[]
}

async function fetchRemoteLabs(
  {
    subjectSlug,
    gradeLevel,
    search,
    adminMode = false,
  }: {
    subjectSlug?: string
    gradeLevel?: number
    search?: string
    adminMode?: boolean
  },
  locale: Locale = 'ru'
) {
  if (getDataProvider() === 'postgresql') {
    const whereClauses: string[] = []
    const params: unknown[] = []

    if (!adminMode) {
      whereClauses.push(`is_published = $${params.length + 1}`)
      params.push(true)
    }

    if (subjectSlug) {
      const subject = await queryPostgres<{ id: string }>(
        `SELECT id FROM subjects WHERE slug = $1 LIMIT 1`,
        [subjectSlug],
        locale
      )

      if (subject.length === 0) return [] as LabRow[]

      whereClauses.push(`subject_id = $${params.length + 1}`)
      params.push(subject[0].id)
    }

    if (gradeLevel) {
      const grade = await queryPostgres<{ id: string }>(
        `SELECT id FROM grades WHERE level = $1 LIMIT 1`,
        [gradeLevel],
        locale
      )


      if (grade.length === 0) return [] as LabRow[]

      whereClauses.push(`grade_id = $${params.length + 1}`)
      params.push(grade[0].id)
    }

    if (search?.trim()) {
      const searchValue = `%${search.trim()}%`
      const searchParam = `$${params.length + 1}`
      whereClauses.push(
        `(
          labs.slug ILIKE ${searchParam}
          OR labs.title ILIKE ${searchParam}
          OR labs.title_ru ILIKE ${searchParam}
          OR labs.title_ky ILIKE ${searchParam}
          OR labs.topic ILIKE ${searchParam}
          OR labs.topic_ru ILIKE ${searchParam}
          OR labs.topic_ky ILIKE ${searchParam}
          OR labs.content ILIKE ${searchParam}
          OR labs.content_ru ILIKE ${searchParam}
          OR labs.content_ky ILIKE ${searchParam}
          OR labs.goal ILIKE ${searchParam}
          OR labs.goal_ru ILIKE ${searchParam}
          OR labs.goal_ky ILIKE ${searchParam}
          OR labs.expected_results ILIKE ${searchParam}
          OR labs.expected_results_ru ILIKE ${searchParam}
          OR labs.expected_results_ky ILIKE ${searchParam}
          OR labs.teacher_notes ILIKE ${searchParam}
          OR labs.teacher_notes_ru ILIKE ${searchParam}
          OR labs.teacher_notes_ky ILIKE ${searchParam}
          OR labs.difficulty ILIKE ${searchParam}
          OR EXISTS (
            SELECT 1 FROM subjects
            WHERE subjects.id = labs.subject_id
              AND (
                subjects.slug ILIKE ${searchParam}
                OR subjects.name ILIKE ${searchParam}
                OR subjects.name_ru ILIKE ${searchParam}
                OR subjects.name_ky ILIKE ${searchParam}
              )
          )
          OR EXISTS (
            SELECT 1 FROM grades
            WHERE grades.id = labs.grade_id
              AND (
                grades.label ILIKE ${searchParam}
                OR grades.label_ru ILIKE ${searchParam}
                OR grades.label_ky ILIKE ${searchParam}
                OR grades.level::text ILIKE ${searchParam}
              )
          )
          OR EXISTS (
            SELECT 1 FROM equipment
            WHERE equipment.id = ANY(COALESCE(labs.equipment_ids, ARRAY[]::uuid[]))
              AND (
                equipment.slug ILIKE ${searchParam}
                OR equipment.name ILIKE ${searchParam}
                OR equipment.name_ru ILIKE ${searchParam}
                OR equipment.name_ky ILIKE ${searchParam}
              )
          )
          OR EXISTS (
            SELECT 1 FROM resources
            WHERE resources.lab_id = labs.id
              AND (
                resources.title ILIKE ${searchParam}
                OR resources.title_ru ILIKE ${searchParam}
                OR resources.title_ky ILIKE ${searchParam}
                OR resources.description ILIKE ${searchParam}
                OR resources.description_ru ILIKE ${searchParam}
                OR resources.description_ky ILIKE ${searchParam}
                OR resources.resource_type ILIKE ${searchParam}
                OR resources.url ILIKE ${searchParam}
              )
          )
          OR EXISTS (
            SELECT 1 FROM lab_steps
            WHERE lab_steps.lab_id = labs.id
              AND (
                lab_steps.content ILIKE ${searchParam}
                OR lab_steps.content_ru ILIKE ${searchParam}
                OR lab_steps.content_ky ILIKE ${searchParam}
                OR lab_steps.caption ILIKE ${searchParam}
                OR lab_steps.caption_ru ILIKE ${searchParam}
                OR lab_steps.caption_ky ILIKE ${searchParam}
                OR lab_steps.block_type ILIKE ${searchParam}
              )
          )
          OR EXISTS (
            SELECT 1 FROM lab_equipment_items
            WHERE lab_equipment_items.lab_id = labs.id
              AND (
                lab_equipment_items.item_name ILIKE ${searchParam}
                OR lab_equipment_items.item_name_ru ILIKE ${searchParam}
                OR lab_equipment_items.item_name_ky ILIKE ${searchParam}
                OR lab_equipment_items.notes ILIKE ${searchParam}
                OR lab_equipment_items.notes_ru ILIKE ${searchParam}
                OR lab_equipment_items.notes_ky ILIKE ${searchParam}
              )
          )
        )`
      )
      params.push(searchValue)
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

    const rows = await queryPostgres<Record<string, unknown>>(
       `SELECT id, slug, title, title_ru, title_ky, topic, topic_ru, topic_ky, content, content_ru, content_ky, goal, goal_ru, goal_ky, expected_results, expected_results_ru, expected_results_ky, teacher_notes, teacher_notes_ru, teacher_notes_ky, thumbnail_url, photo_urls, is_published, subject_id, grade_id, equipment_ids, difficulty, duration_minutes, created_by, created_at, updated_at
       FROM labs
       ${whereSql}
       ORDER BY created_at DESC`,
      params,
      locale
    )

    return rows.map(normalizeLabRow)
  }


  const supabase = await createClient()

  let query = supabase
    .from('labs')
    .select('*')

  if (!adminMode) {
    query = query.eq('is_published', true)
  }

  if (subjectSlug) {
    const { data: subject, error } = await supabase
      .from('subjects')
      .select('id')
      .eq('slug', subjectSlug)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw asError(error, 'Не удалось применить фильтр по предмету.')
    }

    if (!subject) return [] as LabRow[]

    query = query.eq('subject_id', subject.id)
  }

  if (gradeLevel) {
    const { data: grade, error } = await supabase
      .from('grades')
      .select('id')
      .eq('level', gradeLevel)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw asError(error, 'Не удалось применить фильтр по классу.')
    }

    if (!grade) return [] as LabRow[]

    query = query.eq('grade_id', grade.id)
  }

  if (search?.trim()) {
    query = query.or(
      `slug.ilike.%${search}%,title.ilike.%${search}%,title_ru.ilike.%${search}%,title_ky.ilike.%${search}%,topic.ilike.%${search}%,topic_ru.ilike.%${search}%,topic_ky.ilike.%${search}%,content.ilike.%${search}%,content_ru.ilike.%${search}%,content_ky.ilike.%${search}%,goal.ilike.%${search}%,goal_ru.ilike.%${search}%,goal_ky.ilike.%${search}%,expected_results.ilike.%${search}%,expected_results_ru.ilike.%${search}%,expected_results_ky.ilike.%${search}%,teacher_notes.ilike.%${search}%,teacher_notes_ru.ilike.%${search}%,teacher_notes_ky.ilike.%${search}%,difficulty.ilike.%${search}%`
    )
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    throw asError(error, 'Не удалось загрузить лаборатории.')
  }

  return (data ?? []) as LabRow[]
}

async function fetchRemoteLab(
  field: 'slug' | 'id',
  value: string,
  locale: Locale,
  fallbackLab?: Lab | null
) {
  if (getDataProvider() === 'postgresql') {
    const labRows = await queryPostgres<Record<string, unknown>>(
      `SELECT id, slug, title, title_ru, title_ky, topic, topic_ru, topic_ky, content, content_ru, content_ky, goal, goal_ru, goal_ky, expected_results, expected_results_ru, expected_results_ky, teacher_notes, teacher_notes_ru, teacher_notes_ky, thumbnail_url, photo_urls, is_published, subject_id, grade_id, equipment_ids, difficulty, duration_minutes, created_by, created_at, updated_at
       FROM labs
       WHERE ${field} = $1
       LIMIT 1`,
      [value],
      locale
    )


    if (labRows.length === 0) {
      throw createNotFoundError('Лаборатория не найдена.')
    }

    const lab = labRows[0]

    if (!hasLocalizedText(lab, 'title', locale) && !fallbackLab) {
      throw createNotFoundError('Laboratory is not available for the selected locale.')
    }

    const localizedLabRow = localizeLab(normalizeLabRow(lab) as Lab, locale, fallbackLab) as LabRow

    const [labs, stepsRows, resourcesRows, equipmentItemsRows] = await Promise.all([
      loadRelations([localizedLabRow], locale),
      queryPostgres<Record<string, unknown>>(
        `SELECT id, lab_id, step_order, block_type, content, content_ru, content_ky, caption, caption_ru, caption_ky
         FROM lab_steps
         WHERE lab_id = $1
         ORDER BY step_order`,
        [lab.id],
        locale
      ),
      queryPostgres<Record<string, unknown>>(
        `SELECT id, lab_id, resource_type, title, title_ru, title_ky, description, description_ru, description_ky, url, file_size, sort_order
         FROM resources
         WHERE lab_id = $1
         ORDER BY sort_order`,
        [lab.id],
        locale
      ),
      queryPostgres<Record<string, unknown>>(
        `SELECT id, lab_id, item_name, item_name_ru, item_name_ky, quantity, notes, notes_ru, notes_ky, sort_order
         FROM lab_equipment_items
         WHERE lab_id = $1
         ORDER BY sort_order`,
        [lab.id],
        locale
      ),

    ])

    return {
      ...labs[0],
      lab_steps: stepsRows.map((step) =>
        localizeLabStep(
          normalizeLabStep(step),
          locale,
          fallbackLab?.lab_steps?.find((localStep) => localStep.id === step.id) ?? null
        )
      ),
      resources: resourcesRows.map((resource) =>
        localizeResource(
          normalizeResource(resource),
          locale,
          fallbackLab?.resources?.find((localResource) => localResource.id === resource.id) ?? null
        )
      ),
      equipment_items: equipmentItemsRows.map((item) =>
        localizeEquipmentItem(
          normalizeEquipmentItem(item),
          locale,
          fallbackLab?.equipment_items?.find((localItem) => localItem.id === item.id) ?? null
        )
      ),
    } as Lab
  }

  const supabase = await createClient()
  const { data: lab, error } = await supabase.from('labs').select('*').eq(field, value).single()

  if (error) {
    throw asError(error, 'Не удалось загрузить лабораторию.')
  }

  if (!hasLocalizedText(lab, 'title', locale) && !fallbackLab) {
    throw createNotFoundError('Laboratory is not available for the selected locale.')
  }

  const localizedLabRow = localizeLab(lab as Lab, locale, fallbackLab) as LabRow

  const [labs, stepsResult, resourcesResult, equipmentItemsResult] = await Promise.all([
    loadRelations([localizedLabRow], locale),
    supabase.from('lab_steps').select('*').eq('lab_id', lab.id).order('step_order'),
    supabase.from('resources').select('*').eq('lab_id', lab.id).order('sort_order'),
    supabase
      .from('lab_equipment_items')
      .select('*')
      .eq('lab_id', lab.id)
      .order('sort_order'),
  ])

  if (stepsResult.error) {
    throw asError(stepsResult.error, 'Не удалось загрузить шаги лаборатории.')
  }

  if (resourcesResult.error) {
    throw asError(resourcesResult.error, 'Не удалось загрузить ресурсы лаборатории.')
  }

  if (equipmentItemsResult.error) {
    throw asError(equipmentItemsResult.error, 'Не удалось загрузить список оборудования.')
  }

  return {
    ...labs[0],
    lab_steps: ((stepsResult.data ?? []) as LabStep[]).map((step) =>
      localizeLabStep(
        step,
        locale,
        fallbackLab?.lab_steps?.find((localStep) => localStep.id === step.id) ?? null
      )
    ),
    resources: ((resourcesResult.data ?? []) as Resource[]).map((resource) =>
      localizeResource(
        resource,
        locale,
        fallbackLab?.resources?.find((localResource) => localResource.id === resource.id) ?? null
      )
    ),
    equipment_items: ((equipmentItemsResult.data ?? []) as EquipmentItem[]).map((item) =>
      localizeEquipmentItem(
        item,
        locale,
        fallbackLab?.equipment_items?.find((localItem) => localItem.id === item.id) ?? null
      )
    ),
  } as Lab
}

export async function getSubjects(locale?: Locale): Promise<Subject[]> {
  const currentLocale = locale ?? (await getCurrentLocale())
  const provider = getDataProvider()
  const localSubjects = await getLocalSubjects(currentLocale)

  if (!canUseRemoteData(provider)) {
    if (provider === 'supabase') {
      throw getRemoteRequiredError(provider)
    }

    return localSubjects
  }

  try {
    const subjects = localizeRemoteSubjects(await fetchRemoteSubjects(currentLocale), currentLocale, localSubjects)


    if (shouldMirrorLocalData(provider)) {
      await syncLocalCatalogs({ subjects }, currentLocale)
      return mergeById(
        subjects,
        localSubjects,
        (left, right) => left.sort_order - right.sort_order
      )
    }

    return subjects
  } catch (error) {
    if (shouldMirrorLocalData(provider)) {
      return localSubjects
    }

    throw error
  }
}

export async function getGrades(locale?: Locale): Promise<Grade[]> {
  const currentLocale = locale ?? (await getCurrentLocale())
  const provider = getDataProvider()
  const localGrades = await getLocalGrades(currentLocale)

  if (!canUseRemoteData(provider)) {
    if (provider === 'supabase') {
      throw getRemoteRequiredError(provider)
    }

    return localGrades
  }

  try {
    const grades = localizeRemoteGrades(await fetchRemoteGrades(currentLocale), currentLocale, localGrades)


    if (shouldMirrorLocalData(provider)) {
      await syncLocalCatalogs({ grades }, currentLocale)
      return mergeById(
        grades,
        localGrades,
        (left, right) => left.level - right.level
      )
    }

    return grades
  } catch (error) {
    if (shouldMirrorLocalData(provider)) {
      return localGrades
    }

    throw error
  }
}

export async function getEquipment(locale?: Locale): Promise<Equipment[]> {
  const currentLocale = locale ?? (await getCurrentLocale())
  const provider = getDataProvider()
  const localEquipment = await getLocalEquipment(currentLocale)

  if (!canUseRemoteData(provider)) {
    if (provider === 'supabase') {
      throw getRemoteRequiredError(provider)
    }

    return localEquipment
  }

  try {
    const equipment = localizeRemoteEquipment(
      await fetchRemoteEquipment(currentLocale),
      currentLocale,
      localEquipment
    )


    if (shouldMirrorLocalData(provider)) {
      await syncLocalCatalogs({ equipment }, currentLocale)
      return mergeById(
        equipment,
        localEquipment,
        (left, right) => left.name.localeCompare(right.name, currentLocale === 'ky' ? 'ky' : 'ru')
      )
    }

    return equipment
  } catch (error) {
    if (shouldMirrorLocalData(provider)) {
      return localEquipment
    }

    throw error
  }
}

export async function getLabs({
  subjectSlug,
  gradeLevel,
  search,
  adminMode = false,
  locale,
}: {
  subjectSlug?: string
  gradeLevel?: number
  search?: string
  adminMode?: boolean
  locale?: Locale
} = {}): Promise<Lab[]> {
  const currentLocale = locale ?? (await getCurrentLocale())
  const provider = getDataProvider()
  const params = { subjectSlug, gradeLevel, search, adminMode }
  const localLabs = shouldMirrorLocalData(provider) ? await getLocalLabs(params, currentLocale) : []

  if (!canUseRemoteData(provider)) {
    if (provider === 'supabase') {
      throw getRemoteRequiredError(provider)
    }

    return localLabs
  }

  try {
    await flushPendingLabSync(currentLocale)
    const remoteRows = localizeRemoteLabs(await fetchRemoteLabs(params, currentLocale), currentLocale, localLabs)

    const remoteLabs = await loadRelations(remoteRows, currentLocale)

    if (shouldMirrorLocalData(provider)) {
      await Promise.all(remoteRows.map((lab) => syncLocalLabMirror({ lab }, currentLocale)))
      return mergeLabs(remoteLabs, localLabs)
    }

    return remoteLabs
  } catch (error) {
    if (shouldMirrorLocalData(provider)) {
      return localLabs
    }

    throw error
  }
}

export async function getLabBySlug(slug: string, locale?: Locale): Promise<Lab> {
  const currentLocale = locale ?? (await getCurrentLocale())
  const provider = getDataProvider()
  const localCandidate = shouldMirrorLocalData(provider) ? await getLocalLabBySlug(slug, currentLocale) : null
  const localLab = localCandidate?.is_published ? localCandidate : null

  if (!canUseRemoteData(provider)) {
    if (localLab) return localLab
    if (provider === 'supabase') throw getRemoteRequiredError(provider)
    throw createNotFoundError('Лаборатория не найдена.')
  }

  try {
    await flushPendingLabSync(currentLocale)
    const remoteLab = await fetchRemoteLab('slug', slug, currentLocale, localLab)
    if (!remoteLab.is_published) throw createNotFoundError('Лаборатория не опубликована.')

    if (shouldMirrorLocalData(provider)) {
      await syncLocalLabMirror({
        lab: toStoredLab(remoteLab),
        steps: remoteLab.lab_steps,
        resources: remoteLab.resources,
        equipmentItems: remoteLab.equipment_items,
      }, currentLocale)

      if (localLab && getLabTimestamp(localLab) > getLabTimestamp(remoteLab)) {
        return localLab
      }
    }

    return remoteLab
  } catch (error) {
    if (localLab) {
      return localLab
    }

    throw error
  }
}

export async function getLabById(id: string, locale?: Locale): Promise<Lab> {
  const currentLocale = locale ?? (await getCurrentLocale())
  const provider = getDataProvider()
  const localLab = shouldMirrorLocalData(provider) ? await getLocalLabById(id, currentLocale) : null

  if (!canUseRemoteData(provider)) {
    if (localLab) return localLab
    if (provider === 'supabase') throw getRemoteRequiredError(provider)
    throw createNotFoundError('Лаборатория не найдена.')
  }

  try {
    await flushPendingLabSync(currentLocale)
    const remoteLab = await fetchRemoteLab('id', id, currentLocale, localLab)

    if (shouldMirrorLocalData(provider)) {
      await syncLocalLabMirror({
        lab: toStoredLab(remoteLab),
        steps: remoteLab.lab_steps,
        resources: remoteLab.resources,
        equipmentItems: remoteLab.equipment_items,
      }, currentLocale)

      if (localLab && getLabTimestamp(localLab) > getLabTimestamp(remoteLab)) {
        return localLab
      }
    }

    return remoteLab
  } catch (error) {
    if (localLab) {
      return localLab
    }

    throw error
  }
}

// ============================================================
// PASCO KITS (PostgreSQL)
// ============================================================

function normalizePascoKit(row: Record<string, unknown>): PascoKit {
  return {
    id: normalizeString(row.id),
    name: normalizeString(row.name),
    name_ru: normalizeNullableString(row.name_ru),
    name_ky: normalizeNullableString(row.name_ky),
    slug: normalizeString(row.slug),
    description: normalizeNullableString(row.description),
    description_ru: normalizeNullableString(row.description_ru),
    description_ky: normalizeNullableString(row.description_ky),
    thumbnail_url: normalizeNullableString(row.thumbnail_url),
    subject_id: normalizeString(row.subject_id),
    sort_order: normalizeNumber(row.sort_order, 0),
    created_at: normalizeString(row.created_at, new Date(0).toISOString()),
    updated_at: normalizeString(row.updated_at, new Date(0).toISOString()),
  }
}

function normalizePascoKitComponent(row: Record<string, unknown>): PascoKitComponent {
  return {
    id: normalizeString(row.id),
    kit_id: normalizeString(row.kit_id),
    name: normalizeString(row.name),
    name_ru: normalizeNullableString(row.name_ru),
    name_ky: normalizeNullableString(row.name_ky),
    quantity: normalizeNumber(row.quantity, 1),
    photo_url: normalizeNullableString(row.photo_url),
    description: normalizeNullableString(row.description),
    description_ru: normalizeNullableString(row.description_ru),
    description_ky: normalizeNullableString(row.description_ky),
    storage_location: normalizeNullableString(row.storage_location),
    storage_location_ru: normalizeNullableString(row.storage_location_ru),
    storage_location_ky: normalizeNullableString(row.storage_location_ky),
    notes: normalizeNullableString(row.notes),
    notes_ru: normalizeNullableString(row.notes_ru),
    notes_ky: normalizeNullableString(row.notes_ky),
    sort_order: normalizeNumber(row.sort_order, 0),
    created_at: normalizeNullableString(row.created_at) ?? undefined,
    updated_at: normalizeNullableString(row.updated_at) ?? undefined,
  }
}

function localizePascoKit(kit: PascoKit, locale: Locale, fallback?: PascoKit | null): PascoKit {
  const localizedName =
    locale === 'ky'
      ? normalizeNullableString(kit.name_ky) ?? normalizeNullableString(fallback?.name_ky) ?? kit.name
      : normalizeNullableString(kit.name_ru) ?? normalizeNullableString(fallback?.name_ru) ?? kit.name

  const localizedDescription =
    locale === 'ky'
      ? normalizeNullableString(kit.description_ky) ??
        normalizeNullableString(fallback?.description_ky) ??
        kit.description
      : normalizeNullableString(kit.description_ru) ??
        normalizeNullableString(fallback?.description_ru) ??
        kit.description

  return {
    ...kit,
    name: localizedName,
    description: localizedDescription,
  }
}

function localizePascoKitComponent(
  component: PascoKitComponent,
  locale: Locale,
  fallback?: PascoKitComponent | null
): PascoKitComponent {
  const localizedName =
    locale === 'ky'
      ? normalizeNullableString(component.name_ky) ??
        normalizeNullableString(fallback?.name_ky) ??
        component.name
      : normalizeNullableString(component.name_ru) ??
        normalizeNullableString(fallback?.name_ru) ??
        component.name

  const localizedDescription =
    locale === 'ky'
      ? normalizeNullableString(component.description_ky) ??
        normalizeNullableString(fallback?.description_ky) ??
        component.description
      : normalizeNullableString(component.description_ru) ??
        normalizeNullableString(fallback?.description_ru) ??
        component.description

  const localizedStorage =
    locale === 'ky'
      ? normalizeNullableString(component.storage_location_ky) ??
        normalizeNullableString(fallback?.storage_location_ky) ??
        component.storage_location
      : normalizeNullableString(component.storage_location_ru) ??
        normalizeNullableString(fallback?.storage_location_ru) ??
        component.storage_location

  const localizedNotes =
    locale === 'ky'
      ? normalizeNullableString(component.notes_ky) ??
        normalizeNullableString(fallback?.notes_ky) ??
        component.notes
      : normalizeNullableString(component.notes_ru) ??
        normalizeNullableString(fallback?.notes_ru) ??
        component.notes

  return {
    ...component,
    name: localizedName,
    description: localizedDescription,
    storage_location: localizedStorage,
    notes: localizedNotes,
  }
}

async function fetchRemotePascoKits(subjectSlug?: string, locale: Locale = 'ru') {
  if (getDataProvider() === 'postgresql') {
    const params: unknown[] = []
    let whereSql = ''

    if (subjectSlug) {
      whereSql = `WHERE pk.subject_id = (
        SELECT id FROM subjects WHERE slug = $1 LIMIT 1
      )`
      params.push(subjectSlug)
    }

    const rows = await queryPostgres<Record<string, unknown>>(
      `SELECT pk.id, pk.slug, pk.name, pk.name_ru, pk.name_ky,
              pk.description, pk.description_ru, pk.description_ky,
              pk.thumbnail_url, pk.subject_id, pk.sort_order,
              pk.created_at, pk.updated_at
       FROM pasco_kits pk
       ${whereSql}
       ORDER BY pk.sort_order`,
      params,
      locale
    )

    return rows.map(normalizePascoKit)
  }


  const supabase = await createClient()
  let query = supabase.from('pasco_kits').select('*')

  if (subjectSlug) {
    const { data: subject } = await supabase
      .from('subjects')
      .select('id')
      .eq('slug', subjectSlug)
      .single()

    if (subject) {
      query = query.eq('subject_id', subject.id)
    }
  }

  const { data, error } = await query.order('sort_order')

  if (error) {
    throw asError(error, 'Не удалось загрузить PASCO-комплекты.')
  }

  return (data ?? []) as PascoKit[]
}

async function fetchRemotePascoKitComponents(kitId: string, locale: Locale = 'ru') {
  if (getDataProvider() === 'postgresql') {
    const rows = await queryPostgres<Record<string, unknown>>(
      `SELECT id, kit_id, name, name_ru, name_ky, quantity, photo_url,
              description, description_ru, description_ky,
              storage_location, storage_location_ru, storage_location_ky,
              notes, notes_ru, notes_ky, sort_order, created_at, updated_at
       FROM pasco_kit_components
       WHERE kit_id = $1
       ORDER BY sort_order`,
      [kitId],
      locale
    )

    return rows.map(normalizePascoKitComponent)
  }


  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pasco_kit_components')
    .select('*')
    .eq('kit_id', kitId)
    .order('sort_order')

  if (error) {
    throw asError(error, 'Не удалось загрузить компоненты PASCO-комплекта.')
  }

  return (data ?? []) as PascoKitComponent[]
}

async function fetchRemotePascoKitBySlug(slug: string, locale: Locale = 'ru') {
  if (getDataProvider() === 'postgresql') {
    const rows = await queryPostgres<Record<string, unknown>>(
      `SELECT id, slug, name, name_ru, name_ky,
              description, description_ru, description_ky,
              thumbnail_url, subject_id, sort_order,
              created_at, updated_at
       FROM pasco_kits
       WHERE slug = $1
       LIMIT 1`,
      [slug],
      locale
    )

    return rows.length > 0 ? normalizePascoKit(rows[0]) : null
  }


  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pasco_kits')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw asError(error, 'Не удалось загрузить PASCO-комплект.')
  }

  return (data ?? null) as PascoKit | null
}

async function fetchRemotePascoKitById(id: string, locale: Locale = 'ru') {
  if (getDataProvider() === 'postgresql') {
    const rows = await queryPostgres<Record<string, unknown>>(
      `SELECT id, slug, name, name_ru, name_ky,
              description, description_ru, description_ky,
              thumbnail_url, subject_id, sort_order,
              created_at, updated_at
       FROM pasco_kits
       WHERE id = $1
       LIMIT 1`,
      [id],
      locale
    )

    return rows.length > 0 ? normalizePascoKit(rows[0]) : null
  }


  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pasco_kits')
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw asError(error, 'Не удалось загрузить PASCO-комплект.')
  }

  return (data ?? null) as PascoKit | null
}

async function loadPascoKitRelations(
  kit: PascoKit,
  locale: Locale,
  fallbackKit?: PascoKit | null
): Promise<PascoKit> {
  const [subject, components] = await Promise.all([
    kit.subject_id
      ? getSubjects(locale).then((subjects) => subjects.find((s) => s.id === kit.subject_id) ?? null)
      : Promise.resolve(null),
    fetchRemotePascoKitComponents(kit.id, locale),

  ])

  const fallbackComponents = fallbackKit?.components ?? []

  return {
    ...localizePascoKit(kit, locale, fallbackKit),
    subject,
    components: components.map((component) =>
      localizePascoKitComponent(
        component,
        locale,
        fallbackComponents.find((localComponent) => localComponent.id === component.id) ?? null
      )
    ),
  }
}

export async function getPascoKits(
  subjectSlug?: string,
  locale?: Locale
): Promise<PascoKit[]> {
  const currentLocale = locale ?? (await getCurrentLocale())
  const provider = getDataProvider()
  const localKits = shouldMirrorLocalData(provider)
    ? await getLocalPascoKits(subjectSlug, currentLocale)
    : []

  if (!canUseRemoteData(provider)) {
    if (provider === 'supabase') {
      throw getRemoteRequiredError(provider)
    }

    return localKits
  }

  try {
    const remoteKits = await fetchRemotePascoKits(subjectSlug, currentLocale)

    const kits = await Promise.all(
      remoteKits.map((kit) =>
        loadPascoKitRelations(
          kit,
          currentLocale,
          localKits.find((localKit) => localKit.id === kit.id) ?? null
        )
      )
    )

    if (shouldMirrorLocalData(provider)) {
      return mergeById(
        kits,
        localKits,
        (left, right) => left.sort_order - right.sort_order
      )
    }

    return kits
  } catch (error) {
    if (shouldMirrorLocalData(provider)) {
      return localKits
    }

    throw error
  }
}

export async function getPascoKitBySlug(
  slug: string,
  locale?: Locale
): Promise<PascoKit | null> {
  const currentLocale = locale ?? (await getCurrentLocale())
  const provider = getDataProvider()
  const localKit = shouldMirrorLocalData(provider)
    ? await getLocalPascoKitBySlug(slug, currentLocale)
    : null

  if (!canUseRemoteData(provider)) {
    if (localKit) return localKit
    if (provider === 'supabase') throw getRemoteRequiredError(provider)
    return null
  }

  try {
    const remoteKit = await fetchRemotePascoKitBySlug(slug, currentLocale)

    if (!remoteKit) return localKit

    return await loadPascoKitRelations(remoteKit, currentLocale, localKit)
  } catch (error) {
    if (localKit) return localKit
    throw error
  }
}

export async function getPascoKitById(
  id: string,
  locale?: Locale
): Promise<PascoKit | null> {
  const currentLocale = locale ?? (await getCurrentLocale())
  const provider = getDataProvider()
  const localKit = shouldMirrorLocalData(provider)
    ? await getLocalPascoKitById(id, currentLocale)
    : null

  if (!canUseRemoteData(provider)) {
    if (localKit) return localKit
    if (provider === 'supabase') throw getRemoteRequiredError(provider)
    return null
  }

  try {
    const remoteKit = await fetchRemotePascoKitById(id, currentLocale)
    if (!remoteKit) return localKit


    return await loadPascoKitRelations(remoteKit, currentLocale, localKit)
  } catch (error) {
    if (localKit) return localKit
    throw error
  }
}

