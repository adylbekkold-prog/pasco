/**
 * Script: seed-pasco-kits-postgres.js
 *
 * Загружает данные PASCO-комплектов из локальных JSON-файлов
 * (local-db.ru.json и local-db.ky.json) в PostgreSQL.
 *
 * Скрипт объединяет русские и кыргызские переводы в одну строку таблицы:
 *   - name / name_ru / name_ky
 *   - description / description_ru / description_ky
 *   - storage_location / storage_location_ru / storage_location_ky
 *   - notes / notes_ru / notes_ky
 *
 * Использование:
 *   node scripts/seed-pasco-kits-postgres.js
 *
 * Переменные окружения (или .env.postgres):
 *   DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
 */

const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

const DATA_DIR = path.join(__dirname, '..', 'data')
const RU_FILE = path.join(DATA_DIR, 'local-db.ru.json')
const KY_FILE = path.join(DATA_DIR, 'local-db.ky.json')

const DATABASE_URL = process.env.DATABASE_URL

// Имена баз данных для каждой локали (см. lib/database/postgres.ts)
const DB_NAMES = { ru: 'pasco_lab_ru', ky: 'pasco_lab_ky' }

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

// Строит connection string для указанной локали, заменяя имя базы данных.
function getConnectionString(locale) {
  const dbName = DB_NAMES[locale]
  return DATABASE_URL.replace(/\/[^/]*$/, `/${dbName}`)
}

async function seedDatabase(locale, ru, ky) {
  const connectionString = getConnectionString(locale)
  console.log(`\n🌐 База данных: ${DB_NAMES[locale]}`)

  const ruKits = ru.pasco_kits || []
  const kyKits = ky.pasco_kits || []
  const ruComponents = ru.pasco_kit_components || []
  const kyComponents = ky.pasco_kit_components || []

  const client = new Client({ connectionString })
  await client.connect()

  try {
    // 1. Проверяем, что таблицы существуют
    const tableCheck = await client.query(
      `SELECT to_regclass('public.pasco_kits') AS kits, to_regclass('public.pasco_kit_components') AS components`
    )
    if (!tableCheck.rows[0].kits || !tableCheck.rows[0].components) {
      console.error(
        `❌ Таблицы pasco_kits / pasco_kit_components не найдены в ${DB_NAMES[locale]}.\n` +
          '   Сначала примените миграцию: supabase/migrations/2026-08-11_add_pasco_kits.sql'
      )
      return
    }

    // 2. Очищаем существующие данные (для повторного запуска)
    console.log('   Очистка существующих данных...')
    await client.query('DELETE FROM pasco_kit_components')
    await client.query('DELETE FROM pasco_kits')

    // 3. Вставляем комплекты (объединяя RU и KY)
    console.log('   Вставка комплектов...')
    const kitIds = new Set()
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
    }

    // 4. Вставляем компоненты (объединяя RU и KY)
    console.log('   Вставка компонентов...')
    let componentCount = 0
    for (const ruComp of ruComponents) {
      const kyComp = kyComponents.find((c) => c.id === ruComp.id) || {}
      const id = ruComp.id
      const kitId = ruComp.kit_id

      // Пропускаем компоненты, чей комплект не был вставлен
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

    // 5. Итоговая статистика
    const kitResult = await client.query('SELECT COUNT(*) AS count FROM pasco_kits')
    const compResult = await client.query(
      'SELECT COUNT(*) AS count FROM pasco_kit_components'
    )

    console.log(`   Комплектов в БД: ${kitResult.rows[0].count}`)
    console.log(`   Компонентов в БД: ${compResult.rows[0].count}`)
    console.log(`   Вставлено компонентов: ${componentCount}`)
  } finally {
    await client.end()
  }
}

async function main() {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is required.')
  }

  console.log('📦 Загрузка PASCO-комплектов в PostgreSQL...')
  console.log(`   Подключение: ${DATABASE_URL.replace(/:[^:@]+@/, ':***@')}`)

  const ru = readJson(RU_FILE)
  const ky = readJson(KY_FILE)

  console.log(`   Русских комплектов: ${(ru.pasco_kits || []).length}`)
  console.log(`   Кыргызских комплектов: ${(ky.pasco_kits || []).length}`)
  console.log(`   Русских компонентов: ${(ru.pasco_kit_components || []).length}`)
  console.log(`   Кыргызских компонентов: ${(ky.pasco_kit_components || []).length}`)

  // Заполняем обе базы данных (pasco_lab_ru и pasco_lab_ky)
  await seedDatabase('ru', ru, ky)
  await seedDatabase('ky', ru, ky)

  console.log('\n✅ Готово! Обе базы данных (RU и KY) заполнены.')
}


main().catch((err) => {
  console.error('❌ Ошибка:', err.message)
  process.exit(1)
})
