/**
 * Скрипт: Восстанавливает оригинальные русские лабораторные работы
 * (отдельные от кыргызских), сохраняя исправленные PASCO комплекты.
 *
 * Русская и кыргызская базы лабораторных работ загружаются ОТДЕЛЬНО.
 * Русская база должна содержать свои собственные лабораторные работы,
 * а не переводы кыргызских.
 *
 * Этот скрипт:
 * 1. Берёт оригинальные русские лабораторные работы из git (HEAD)
 * 2. Сохраняет исправленные PASCO комплекты (7 комплектов с фото + 65 компонентов)
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const DATA_DIR = path.join(process.cwd(), 'data')
const RU_DB_PATH = path.join(DATA_DIR, 'local-db.ru.json')
const ORIGINAL_PATH = path.join(DATA_DIR, 'local-db.ru.original.json')

function main() {
  // Получаем оригинальную русскую базу из git
  console.log('Получаем оригинальную русскую базу из git...')
  const originalRaw = execSync('git show HEAD:data/local-db.ru.json', {
    cwd: process.cwd(),
    encoding: 'utf8',
  })
  const originalDb = JSON.parse(originalRaw)

  // Читаем текущую русскую базу (с исправленными PASCO комплектами)
  const currentDb = JSON.parse(fs.readFileSync(RU_DB_PATH, 'utf8'))

  // Создаём резервную копию текущей базы
  const backupPath = RU_DB_PATH + '.bak'
  fs.copyFileSync(RU_DB_PATH, backupPath)
  console.log(`Резервная копия создана: ${backupPath}`)

  // Восстанавливаем оригинальные русские лабораторные работы
  // (labs, lab_steps, resources, lab_equipment_items)
  const restoredDb = {
    ...originalDb,
    // Сохраняем исправленные PASCO комплекты из текущей базы
    pasco_kits: currentDb.pasco_kits,
    pasco_kit_components: currentDb.pasco_kit_components,
  }

  // Записываем восстановленную русскую базу
  fs.writeFileSync(RU_DB_PATH, JSON.stringify(restoredDb, null, 2), 'utf8')

  console.log('\n✅ Готово!')
  console.log(`   Лабораторные работы: ${restoredDb.labs.length} (оригинальные русские)`)
  console.log(`   Шаги: ${restoredDb.lab_steps.length}`)
  console.log(`   Ресурсы: ${restoredDb.resources.length}`)
  console.log(`   Оборудование: ${restoredDb.lab_equipment_items.length}`)
  console.log(`   PASCO комплекты: ${restoredDb.pasco_kits.length} (с фото)`)
  console.log(`   PASCO компоненты: ${restoredDb.pasco_kit_components.length} (с фото)`)
  console.log(`   Записано в: ${RU_DB_PATH}`)
}

main()
