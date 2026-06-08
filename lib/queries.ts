import { createClient } from './supabase/server'
import { getDataProvider, shouldMirrorLocalData, shouldTrySupabaseData } from './data-provider'
import { getCurrentLocale } from './locale-server'
import {
  getLocalEquipment,
  getLocalGrades,
  getLocalLabById,
  getLocalLabBySlug,
  getLocalLabs,
  getLocalSubjects,
  syncLocalCatalogs,
  syncLocalLabMirror,
  toStoredLab,
} from './local-db'
import { flushPendingLabSync } from './sync-queue'
import {
  localizeEquipment,
  localizeEquipmentItem,
  localizeGrade,
  localizeLab,
  localizeLabStep,
  localizeResource,
  localizeSubject,
} from './supabase-localization'
import { getSupabasePublicEnvIssue, hasSupabasePublicEnv } from './supabase/env'
import type { Equipment, EquipmentItem, Grade, Lab, LabStep, Locale, Resource, Subject } from '@/types'

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

function getRemoteRequiredError() {
  return new Error(
    getSupabasePublicEnvIssue() ?? 'Не удалось подключиться к каталогу Supabase.'
  )
}

function canUseSupabase(provider = getDataProvider()) {
  return shouldTrySupabaseData(provider) && hasSupabasePublicEnv()
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

  return remoteSubjects.map((subject) =>
    localizeSubject(subject, locale, localizedBySlug.get(subject.slug))
  )
}

function localizeRemoteGrades(remoteGrades: Grade[], locale: Locale, fallbackGrades: Grade[]) {
  const localizedByLevel = new Map(fallbackGrades.map((grade) => [grade.level, grade]))

  return remoteGrades.map((grade) => localizeGrade(grade, locale, localizedByLevel.get(grade.level)))
}

function localizeRemoteEquipment(
  remoteEquipment: Equipment[],
  locale: Locale,
  fallbackEquipment: Equipment[]
) {
  const localizedBySlug = new Map(fallbackEquipment.map((equipment) => [equipment.slug, equipment]))

  return remoteEquipment.map((item) =>
    localizeEquipment(item, locale, localizedBySlug.get(item.slug))
  )
}

function localizeRemoteLabs(remoteLabs: LabRow[], locale: Locale, fallbackLabs: Lab[] = []) {
  const localizedById = new Map(fallbackLabs.map((lab) => [lab.id, lab]))

  return remoteLabs.map((lab) => localizeLab(lab as Lab, locale, localizedById.get(lab.id))) as LabRow[]
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

async function fetchRemoteSubjects() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('subjects').select('*').order('sort_order')

  if (error) {
    throw asError(error, 'Не удалось загрузить предметы.')
  }

  return (data ?? []) as Subject[]
}

async function fetchRemoteGrades() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('grades').select('*').order('level')

  if (error) {
    throw asError(error, 'Не удалось загрузить классы.')
  }

  return (data ?? []) as Grade[]
}

async function fetchRemoteEquipment() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('equipment').select('*').order('name')

  if (error) {
    throw asError(error, 'Не удалось загрузить оборудование.')
  }

  return (data ?? []) as Equipment[]
}

async function fetchRemoteLabs({
  subjectSlug,
  gradeLevel,
  search,
  adminMode = false,
}: {
  subjectSlug?: string
  gradeLevel?: number
  search?: string
  adminMode?: boolean
}) {
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
      `title.ilike.%${search}%,title_ru.ilike.%${search}%,title_ky.ilike.%${search}%,topic.ilike.%${search}%,topic_ru.ilike.%${search}%,topic_ky.ilike.%${search}%`
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
  const supabase = await createClient()
  const { data: lab, error } = await supabase.from('labs').select('*').eq(field, value).single()

  if (error) {
    throw asError(error, 'Не удалось загрузить лабораторию.')
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

  if (!canUseSupabase(provider)) {
    if (provider === 'supabase') {
      throw getRemoteRequiredError()
    }

    return localSubjects
  }

  try {
    const subjects = localizeRemoteSubjects(await fetchRemoteSubjects(), currentLocale, localSubjects)

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

  if (!canUseSupabase(provider)) {
    if (provider === 'supabase') {
      throw getRemoteRequiredError()
    }

    return localGrades
  }

  try {
    const grades = localizeRemoteGrades(await fetchRemoteGrades(), currentLocale, localGrades)

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

  if (!canUseSupabase(provider)) {
    if (provider === 'supabase') {
      throw getRemoteRequiredError()
    }

    return localEquipment
  }

  try {
    const equipment = localizeRemoteEquipment(
      await fetchRemoteEquipment(),
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

  if (!canUseSupabase(provider)) {
    if (provider === 'supabase') {
      throw getRemoteRequiredError()
    }

    return getLocalLabs(params, currentLocale)
  }

  try {
    await flushPendingLabSync(currentLocale)
    const remoteRows = localizeRemoteLabs(await fetchRemoteLabs(params), currentLocale, localLabs)
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
  const localLab = shouldMirrorLocalData(provider) ? await getLocalLabBySlug(slug, currentLocale) : null

  if (!canUseSupabase(provider)) {
    if (localLab) return localLab
    if (provider === 'supabase') throw getRemoteRequiredError()
    throw createNotFoundError('Лаборатория не найдена.')
  }

  try {
    await flushPendingLabSync(currentLocale)
    const remoteLab = await fetchRemoteLab('slug', slug, currentLocale, localLab)

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

  if (!canUseSupabase(provider)) {
    if (localLab) return localLab
    if (provider === 'supabase') throw getRemoteRequiredError()
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
