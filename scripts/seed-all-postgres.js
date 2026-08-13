/**
 * Script: seed-all-postgres.js
 *
 * Полный сид данных в PostgreSQL:
 *  - Лабораторные работы (объединяя RU и KY переводы)
 *  - Ресурсы (PDF, .spklab, видео)
 *  - PASCO-комплекты и их компоненты
 *
 * Запуск (внутри контейнера):
 *   docker exec pasco_app node scripts/seed-all-postgres.js
 *
 * Переменные окружения:
 *   DATABASE_URL=postgresql://pasco_user:pasco_password@postgres:5432/pasco_lab_db
 */

const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

const DATA_DIR = path.join(__dirname, '..', 'data')
const RU_FILE = path.join(DATA_DIR, 'local-db.ru.json')
const KY_FILE = path.join(DATA_DIR, 'local-db.ky.json')

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://pasco_user:pasco_password@postgres:5432/pasco_lab_db'

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function pick(preferred, fallback) {
  return preferred ?? fallback ?? null
}

async function main() {
  console.log('📦 Полный сид данных в PostgreSQL...')
  console.log(`   Подключение: ${DATABASE_URL.replace(/:[^:@]+@/, ':***@')}`)

  const ru = readJson(RU_FILE)
  const ky = readJson(KY_FILE)

  const ruLabs = ru.labs || []
  const kyLabs = ky.labs || []
  const ruResources = ru.resources || []
  const kyResources = ky.resources || []
  const ruKits = ru.pasco_kits || []
  const kyKits = ky.pasco_kits || []
  const ruComponents = ru.pasco_kit_components || []
  const kyComponents = ky.pasco_kit_components || []

  console.log(`   RU лабораторных: ${ruLabs.length}`)
  console.log(`   KY лабораторных: ${kyLabs.length}`)
  console.log(`   RU ресурсов: ${ruResources.length}`)
  console.log(`   KY ресурсов: ${kyResources.length}`)
  console.log(`   RU комплектов: ${ruKits.length}`)
  console.log(`   KY комплектов: ${kyKits.length}`)

  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()

  try {
    // --- Проверяем таблицы ---
    const tableCheck = await client.query(
      `SELECT to_regclass('public.labs') AS labs,
              to_regclass('public.resources') AS resources,
              to_regclass('public.pasco_kits') AS kits,
              to_regclass('public.pasco_kit_components') AS components`
    )
    if (!tableCheck.rows[0].labs) {
      console.error('❌ Таблица labs не найдена. Сначала примените схему.')
      process.exit(1)
    }

    // --- Загружаем маппинги subject/grade/equipment ---
    const subjects = await client.query('SELECT id, slug FROM subjects')
    const subjectMap = {}
    for (const s of subjects.rows) subjectMap['subject-' + s.slug] = s.id

    const grades = await client.query('SELECT id, level FROM grades')
    const gradeMap = {}
    for (const g of grades.rows) gradeMap['grade-' + g.level] = g.id

    const equipment = await client.query('SELECT id, slug FROM equipment')
    const equipmentMap = {}
    for (const e of equipment.rows) equipmentMap['equipment-' + e.slug] = e.id

    // --- 1. Вставляем лабораторные работы ---
    console.log('\n📚 Вставка лабораторных работ...')
    const labIds = new Set()
    let labCount = 0
    for (const kyLab of kyLabs) {
      const ruLab = ruLabs.find((l) => l.id === kyLab.id) || {}
      const id = kyLab.id
      labIds.add(id)

      const subjectId = subjectMap[kyLab.subject_id] || null
      const gradeId = gradeMap[kyLab.grade_id] || null
      const equipmentIds = (kyLab.equipment_ids || [])
        .map((eid) => equipmentMap[eid])
        .filter(Boolean)

      await client.query(
        `INSERT INTO labs (
          id, slug, title, title_ru, title_ky,
          topic, topic_ru, topic_ky,
          content, content_ru, content_ky,
          goal, goal_ru, goal_ky,
          expected_results, expected_results_ru, expected_results_ky,
          teacher_notes, teacher_notes_ru, teacher_notes_ky,
          thumbnail_url, photo_urls, is_published,
          subject_id, grade_id, equipment_ids,
          duration_minutes, created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29)
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          title = EXCLUDED.title,
          title_ru = EXCLUDED.title_ru,
          title_ky = EXCLUDED.title_ky,
          content = EXCLUDED.content,
          content_ru = EXCLUDED.content_ru,
          content_ky = EXCLUDED.content_ky,
          thumbnail_url = EXCLUDED.thumbnail_url,
          photo_urls = EXCLUDED.photo_urls,
          is_published = EXCLUDED.is_published,
          subject_id = EXCLUDED.subject_id,
          grade_id = EXCLUDED.grade_id,
          equipment_ids = EXCLUDED.equipment_ids,
          duration_minutes = EXCLUDED.duration_minutes,
          updated_at = now()`,
        [
          id,
          ruLab.slug || kyLab.slug,
          ruLab.title || kyLab.title,
          ruLab.title || null,
          kyLab.title || null,
          ruLab.topic || kyLab.topic || null,
          ruLab.topic || null,
          kyLab.topic || null,
          ruLab.content || kyLab.content,
          ruLab.content || null,
          kyLab.content || null,
          ruLab.goal || kyLab.goal || null,
          ruLab.goal || null,
          kyLab.goal || null,
          ruLab.expected_results || kyLab.expected_results || null,
          ruLab.expected_results || null,
          kyLab.expected_results || null,
          ruLab.teacher_notes || kyLab.teacher_notes || null,
          ruLab.teacher_notes || null,
          kyLab.teacher_notes || null,
          kyLab.thumbnail_url || ruLab.thumbnail_url || null,
          kyLab.photo_urls || ruLab.photo_urls || [],
          kyLab.is_published ?? ruLab.is_published ?? true,
          subjectId,
          gradeId,
          equipmentIds,
          kyLab.duration_minutes ?? ruLab.duration_minutes ?? null,
          kyLab.created_at || new Date().toISOString(),
          kyLab.updated_at || new Date().toISOString(),
        ]
      )
      labCount++
    }
    console.log(`   Вставлено лабораторных: ${labCount}`)

    // --- 2. Вставляем ресурсы ---
    console.log('\n🔗 Вставка ресурсов...')
    let resourceCount = 0
    for (const kyRes of kyResources) {
      const ruRes = ruResources.find((r) => r.id === kyRes.id) || {}
      const id = kyRes.id
      const labId = kyRes.lab_id
      if (!labIds.has(labId)) continue

      await client.query(
        `INSERT INTO resources (
          id, lab_id, resource_type, title, title_ru, title_ky,
          description, description_ru, description_ky,
          url, file_size, sort_order, created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
        ON CONFLICT (id) DO UPDATE SET
          lab_id = EXCLUDED.lab_id,
          resource_type = EXCLUDED.resource_type,
          title = EXCLUDED.title,
          title_ru = EXCLUDED.title_ru,
          title_ky = EXCLUDED.title_ky,
          url = EXCLUDED.url,
          file_size = EXCLUDED.file_size,
          sort_order = EXCLUDED.sort_order,
          updated_at = now()`,
        [
          id,
          labId,
          kyRes.resource_type || 'link',
          ruRes.title || kyRes.title,
          ruRes.title || null,
          kyRes.title || null,
          ruRes.description || kyRes.description || null,
          ruRes.description || null,
          kyRes.description || null,
          kyRes.url,
          kyRes.file_size ?? null,
          kyRes.sort_order ?? 0,
          kyRes.created_at || new Date().toISOString(),
          kyRes.updated_at || new Date().toISOString(),
        ]
      )
      resourceCount++
    }
    console.log(`   Вставлено ресурсов: ${resourceCount}`)

    // --- 3. Вставляем PASCO-комплекты ---
    console.log('\n📦 Вставка PASCO-комплектов...')
    const kitIds = new Set()
    let kitCount = 0
    for (const ruKit of ruKits) {
      const kyKit = kyKits.find((k) => k.id === ruKit.id) || {}
      const id = ruKit.id
      kitIds.add(id)

      await client.query(
        `INSERT INTO pasco_kits (
          id, slug, name, name_ru, name_ky,
          description, description_ru, description_ky,
          thumbnail_url, subject_id, sort_order,
          created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          name = EXCLUDED.name,
          name_ru = EXCLUDED.name_ru,
          name_ky = EXCLUDED.name_ky,
          description = EXCLUDED.description,
          description_ru = EXCLUDED.description_ru,
          description_ky = EXCLUDED.description_ky,
          thumbnail_url = EXCLUDED.thumbnail_url,
          subject_id = EXCLUDED.subject_id,
          sort_order = EXCLUDED.sort_order,
          updated_at = now()`,
        [
          id,
          ruKit.slug,
          ruKit.name,
          ruKit.name_ru || ruKit.name,
          kyKit.name_ky || kyKit.name,
          ruKit.description,
          ruKit.description_ru || ruKit.description,
          kyKit.description_ky || kyKit.description,
          ruKit.thumbnail_url,
          ruKit.subject_id,
          ruKit.sort_order ?? 0,
          ruKit.created_at || new Date().toISOString(),
          ruKit.updated_at || new Date().toISOString(),
        ]
      )
      kitCount++
    }
    console.log(`   Вставлено комплектов: ${kitCount}`)

    // --- 4. Вставляем компоненты комплектов ---
    console.log('\n🧩 Вставка компонентов комплектов...')
    let componentCount = 0
    for (const ruComp of ruComponents) {
      const kyComp = kyComponents.find((c) => c.id === ruComp.id) || {}
      const id = ruComp.id
      const kitId = ruComp.kit_id
      if (!kitIds.has(kitId)) continue

      await client.query(
        `INSERT INTO pasco_kit_components (
          id, kit_id, name, name_ru, name_ky,
          quantity, photo_url,
          description, description_ru, description_ky,
          storage_location, storage_location_ru, storage_location_ky,
          notes, notes_ru, notes_ky,
          sort_order, created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
        ON CONFLICT (id) DO UPDATE SET
          kit_id = EXCLUDED.kit_id,
          name = EXCLUDED.name,
          name_ru = EXCLUDED.name_ru,
          name_ky = EXCLUDED.name_ky,
          quantity = EXCLUDED.quantity,
          photo_url = EXCLUDED.photo_url,
          description = EXCLUDED.description,
          description_ru = EXCLUDED.description_ru,
          description_ky = EXCLUDED.description_ky,
          storage_location = EXCLUDED.storage_location,
          storage_location_ru = EXCLUDED.storage_location_ru,
          storage_location_ky = EXCLUDED.storage_location_ky,
          notes = EXCLUDED.notes,
          notes_ru = EXCLUDED.notes_ru,
          notes_ky = EXCLUDED.notes_ky,
          sort_order = EXCLUDED.sort_order,
          updated_at = now()`,
        [
          id,
          kitId,
          ruComp.name,
          ruComp.name_ru || ruComp.name,
          kyComp.name_ky || kyComp.name,
          ruComp.quantity ?? 1,
          ruComp.photo_url,
          ruComp.description,
          ruComp.description_ru || ruComp.description,
          kyComp.description_ky || kyComp.description,
          ruComp.storage_location,
          ruComp.storage_location_ru || ruComp.storage_location,
          kyComp.storage_location_ky || kyComp.storage_location,
          ruComp.notes,
          ruComp.notes_ru || ruComp.notes,
          kyComp.notes_ky || kyComp.notes,
          ruComp.sort_order ?? 0,
          ruComp.created_at || new Date().toISOString(),
          ruComp.updated_at || new Date().toISOString(),
        ]
      )
      componentCount++
    }
    console.log(`   Вставлено компонентов: ${componentCount}`)

    // --- 5. Итоговая статистика ---
    const labResult = await client.query('SELECT COUNT(*) AS count FROM labs')
    const resResult = await client.query('SELECT COUNT(*) AS count FROM resources')
    const kitResult = await client.query('SELECT COUNT(*) AS count FROM pasco_kits')
    const compResult = await client.query(
      'SELECT COUNT(*) AS count FROM pasco_kit_components'
    )

    console.log('\n✅ Готово!')
    console.log(`   Лабораторных в БД: ${labResult.rows[0].count}`)
    console.log(`   Ресурсов в БД: ${resResult.rows[0].count}`)
    console.log(`   Комплектов в БД: ${kitResult.rows[0].count}`)
    console.log(`   Компонентов в БД: ${compResult.rows[0].count}`)
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error('❌ Ошибка:', err.message)
  process.exit(1)
})
