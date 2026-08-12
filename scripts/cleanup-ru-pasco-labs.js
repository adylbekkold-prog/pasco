/**
 * Скрипт: Удаляет из русской базы все лабораторные работы, кроме 5 PASCO
 * лабораторных работ (с PDF и .spklab файлами).
 *
 * Оставляет только PASCO лабораторные работы:
 * - Амплитуда и период колебаний
 * - Импульс тела и импульс силы
 * - Графический анализ движения
 * - Скорость движения. Графическое описание движения
 * - Работа и кинетическая энергия
 *
 * Удаляет остальные лабораторные работы и связанные с ними:
 * - lab_steps (шаги)
 * - lab_equipment_items (оборудование)
 * - resources (ресурсы)
 */

const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(process.cwd(), 'data')
const RU_DB_PATH = path.join(DATA_DIR, 'local-db.ru.json')

// ID 5 PASCO лабораторных работ, которые нужно ОСТАВИТЬ
const KEEP_LAB_IDS = [
  '8d81126a-26c8-4a62-881f-e58442a3a338', // Амплитуда и период колебаний
  '3f7c0f79-2062-4f6b-9764-e993d92864e3', // Импульс тела и импульс силы
  'a9742dac-3913-405c-9463-d400c945ab08', // Графический анализ движения
  '0666ef94-991b-4ce9-88ef-40d9da06772c', // Скорость движения. Графическое описание движения
  'f45b4e09-e2c7-4482-9950-e7a847593163', // Работа и кинетическая энергия
]

function main() {
  // Читаем русскую базу
  const ruDb = JSON.parse(fs.readFileSync(RU_DB_PATH, 'utf8'))

  // Создаём резервную копию
  const backupPath = RU_DB_PATH + '.bak'
  fs.copyFileSync(RU_DB_PATH, backupPath)
  console.log(`Резервная копия создана: ${backupPath}`)

  // Определяем ID лабораторных работ для удаления
  const allLabIds = ruDb.labs.map((l) => l.id)
  const deleteLabIds = allLabIds.filter((id) => !KEEP_LAB_IDS.includes(id))

  console.log(`Всего лабораторных работ: ${allLabIds.length}`)
  console.log(`Оставляем (PASCO): ${KEEP_LAB_IDS.length}`)
  console.log(`Удаляем: ${deleteLabIds.length}`)

  // Удаляем лабораторные работы
  const labsBefore = ruDb.labs.length
  ruDb.labs = ruDb.labs.filter((l) => KEEP_LAB_IDS.includes(l.id))

  // Удаляем связанные шаги
  const stepsBefore = ruDb.lab_steps.length
  ruDb.lab_steps = ruDb.lab_steps.filter((s) => !deleteLabIds.includes(s.lab_id))

  // Удаляем связанное оборудование
  const equipBefore = ruDb.lab_equipment_items.length
  ruDb.lab_equipment_items = ruDb.lab_equipment_items.filter(
    (e) => !deleteLabIds.includes(e.lab_id)
  )

  // Удаляем связанные ресурсы
  const resBefore = ruDb.resources.length
  ruDb.resources = ruDb.resources.filter((r) => !deleteLabIds.includes(r.lab_id))

  // Записываем обновлённую русскую базу
  fs.writeFileSync(RU_DB_PATH, JSON.stringify(ruDb, null, 2), 'utf8')

  console.log('\n✅ Готово!')
  console.log(`   Лабораторные работы: ${labsBefore} → ${ruDb.labs.length}`)
  console.log(`   Шаги: ${stepsBefore} → ${ruDb.lab_steps.length}`)
  console.log(`   Оборудование: ${equipBefore} → ${ruDb.lab_equipment_items.length}`)
  console.log(`   Ресурсы: ${resBefore} → ${ruDb.resources.length}`)
  console.log(`   Записано в: ${RU_DB_PATH}`)
}

main()
