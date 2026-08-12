/**
 * Скрипт: Добавляет PASCO лабораторные работы (с PDF и .spklab файлами)
 * из кыргызской базы в русскую базу, с переводом на русский язык.
 *
 * Кыргызская база содержит 5 PASCO лабораторных работ с ресурсами:
 * - PDF (методичка для учителя + рабочий лист ученика)
 * - .spklab (файлы SparkVue)
 * - video (видео)
 *
 * Русская база не содержала этих лабораторных работ и их ресурсов.
 * Этот скрипт добавляет их в русскую базу с русскими названиями.
 */

const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(process.cwd(), 'data')
const RU_DB_PATH = path.join(DATA_DIR, 'local-db.ru.json')
const KY_DB_PATH = path.join(DATA_DIR, 'local-db.ky.json')

// --- Переводы кыргызских лабораторных работ на русский ---
// Ключ: id кыргызской лабораторной работы
const LAB_TRANSLATIONS = {
  '8d81126a-26c8-4a62-881f-e58442a3a338': {
    title: 'Амплитуда и период колебаний',
    slug: 'amplituda-i-period-kolebaniy-1785146641984',
    content:
      'Исследование колебаний математического (или пружинного) маятника, экспериментальное определение зависимости амплитуды и периода от различных факторов (длина нити, масса груза, начальный угол) и анализ основных закономерностей колебаний с помощью графиков.',
  },
  '3f7c0f79-2062-4f6b-9764-e993d92864e3': {
    title: 'Импульс тела и импульс силы',
    slug: 'impuls-tela-i-impuls-sily-1785146312778',
    content:
      'Экспериментальная проверка связи между импульсом силы и изменением импульса тела (теорема об импульсе) и изучение закона сохранения импульса при различных столкновениях (упругих и неупругих).',
  },
  'a9742dac-3913-405c-9463-d400c945ab08': {
    title: 'Графический анализ движения',
    slug: 'graficheskiy-analiz-dvizheniya-1785145966479',
    content:
      'Определение характера движения тела с помощью графиков движения (S(t), v(t), a(t)), анализ изменения скорости, расстояния и ускорения, а также понимание связи между графиками.',
  },
  '0666ef94-991b-4ce9-88ef-40d9da06772c': {
    title: 'Скорость движения. Графическое описание движения',
    slug: 'skorost-dvizheniya-graficheskoe-opisanie-1785145529275',
    content:
      'Понимание физического смысла скорости как основной характеристики движения, различение равномерного и неравномерного движения, а также обучение описанию и анализу движения с помощью графиков (S(t), v(t), x(t)).',
  },
  'f45b4e09-e2c7-4482-9950-e7a847593163': {
    title: 'Работа и кинетическая энергия',
    slug: 'rabota-i-kineticheskaya-energiya-1785144056946',
    content:
      'Точное измерение и проверка связи между работой силы и изменением кинетической энергии тела с использованием динамической системы PASCO (трек, Smart Cart, датчики силы и движения).',
  },
}

// --- Переводы ресурсов (PDF, .spklab) на русский ---
// Ключ: url ресурса
const RESOURCE_TRANSLATIONS = {
  '/uploads/labs/new-lab/f-10-kyrg-zhumush-zhana-kinetikalyk-energiyanyn-oezgoerueshue-1785144000322.pdf':
    'МЕТОДИЧЕСКОЕ ПОСОБИЕ ДЛЯ УЧИТЕЛЯ',
  '/uploads/labs/new-lab/mugalim-uechuen-usulduk-koldoo-1785145420839.pdf':
    'МЕТОДИЧЕСКОЕ ПОСОБИЕ ДЛЯ УЧИТЕЛЯ',
  '/uploads/labs/new-lab/kyjmyldy-grafiktin-zhardamynda-taldoo-1785145909156.pdf':
    'Анализ движения с помощью графика.pdf',
  '/uploads/labs/8d81126a-26c8-4a62-881f-e58442a3a338/mugalim-uechuen-usulduk-koldoo-1785219193990.pdf':
    'МЕТОДИЧЕСКОЕ ПОСОБИЕ ДЛЯ УЧИТЕЛЯ.pdf',
  '/uploads/labs/new-lab/mugalim-uechuen-usulduk-koldoo-1785146225351.pdf':
    'МЕТОДИЧЕСКОЕ ПОСОБИЕ ДЛЯ УЧИТЕЛЯ.pdf',
  '/uploads/labs/new-lab/okuuchunun-ish-baragy-1785144040131.pdf':
    'Рабочий лист ученика',
  '/uploads/labs/new-lab/okuuchunun-ish-baragy-1785145427758.pdf':
    'Рабочий лист ученика',
  '/uploads/labs/new-lab/okuuchunun-ish-baragy-1785145917054.pdf':
    'РАБОЧИЙ ЛИСТ УЧЕНИКА.pdf',
  '/uploads/labs/8d81126a-26c8-4a62-881f-e58442a3a338/okuuchunun-ish-baragy-1785219200183.pdf':
    'РАБОЧИЙ ЛИСТ УЧЕНИКА.pdf',
  '/uploads/labs/new-lab/okuuchunun-ish-baragy-1785146231412.pdf':
    'РАБОЧИЙ ЛИСТ УЧЕНИКА.pdf',
  '/uploads/labs/new-lab/zhumush-zhana-kinetikalyk-energiya-1785144054869.spklab':
    'Работа и кинетическая энергия.spklab',
  '/uploads/labs/new-lab/kyjmyldyn-yldamdygy-1785145526819.spklab':
    'Скорость движения.spklab',
  '/uploads/labs/new-lab/kyjmyldyn-yldamdygy-1785145964827.spklab':
    'Скорость движения.spklab',
  '/uploads/labs/new-lab/09momentumandimpulse-1785146292169.spklab':
    '09_Momentum_and_Impulse.spklab',
  '/uploads/labs/3f7c0f79-2062-4f6b-9764-e993d92864e3/work-and-kinetic-energy-lab-1785816853718.mp4':
    'Лабораторная работа: Работа и кинетическая энергия.mp4',
}

function main() {
  // Читаем обе базы
  const ruDb = JSON.parse(fs.readFileSync(RU_DB_PATH, 'utf8'))
  const kyDb = JSON.parse(fs.readFileSync(KY_DB_PATH, 'utf8'))

  // Создаём резервную копию русской базы
  const backupPath = RU_DB_PATH + '.bak'
  fs.copyFileSync(RU_DB_PATH, backupPath)
  console.log(`Резервная копия создана: ${backupPath}`)

  // Получаем 5 PASCO лабораторных работ из кыргызской базы
  const pascoLabIds = Object.keys(LAB_TRANSLATIONS)
  const kyLabs = kyDb.labs.filter((l) => pascoLabIds.includes(l.id))
  const kyResources = kyDb.resources.filter((r) => pascoLabIds.includes(r.lab_id))

  console.log(`Найдено PASCO лабораторных работ в кыргызской базе: ${kyLabs.length}`)
  console.log(`Найдено ресурсов: ${kyResources.length}`)

  // Проверяем, какие лабораторные работы уже есть в русской базе
  const existingLabIds = new Set(ruDb.labs.map((l) => l.id))
  const existingResourceIds = new Set(ruDb.resources.map((r) => r.id))

  let addedLabs = 0
  let addedResources = 0

  // Добавляем лабораторные работы
  for (const lab of kyLabs) {
    if (existingLabIds.has(lab.id)) {
      console.log(`Лабораторная работа уже существует, пропускаем: ${lab.id}`)
      continue
    }

    const translation = LAB_TRANSLATIONS[lab.id]
    if (!translation) {
      console.log(`Нет перевода для лабораторной работы: ${lab.id}`)
      continue
    }

    const newLab = {
      ...lab,
      title: translation.title,
      slug: translation.slug,
      content: translation.content,
    }

    ruDb.labs.push(newLab)
    existingLabIds.add(lab.id)
    addedLabs++
    console.log(`Добавлена лабораторная работа: ${translation.title}`)
  }

  // Добавляем ресурсы
  for (const resource of kyResources) {
    if (existingResourceIds.has(resource.id)) {
      console.log(`Ресурс уже существует, пропускаем: ${resource.id}`)
      continue
    }

    const translation = RESOURCE_TRANSLATIONS[resource.url]
    const newResource = {
      ...resource,
      title: translation || resource.title,
      title_ru: translation || resource.title,
      title_ky: resource.title,
      description_ru: resource.description,
      description_ky: resource.description,
    }

    ruDb.resources.push(newResource)
    existingResourceIds.add(resource.id)
    addedResources++
    console.log(`Добавлен ресурс: ${newResource.title} (${newResource.resource_type})`)
  }

  // Записываем обновлённую русскую базу
  fs.writeFileSync(RU_DB_PATH, JSON.stringify(ruDb, null, 2), 'utf8')

  console.log('\n✅ Готово!')
  console.log(`   Добавлено лабораторных работ: ${addedLabs}`)
  console.log(`   Добавлено ресурсов: ${addedResources}`)
  console.log(`   Всего лабораторных работ в русской базе: ${ruDb.labs.length}`)
  console.log(`   Всего ресурсов в русской базе: ${ruDb.resources.length}`)
  console.log(`   Записано в: ${RU_DB_PATH}`)
}

main()
