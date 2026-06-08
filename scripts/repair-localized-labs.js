import fs from 'fs'
import path from 'path'

function readDb(locale) {
  const filePath = path.join(__dirname, 'data', `local-db.${locale}.json`)
  return {
    filePath,
    db: JSON.parse(fs.readFileSync(filePath, 'utf8')),
  }
}

function saveDb(filePath, db) {
  fs.writeFileSync(filePath, `${JSON.stringify(db, null, 2)}\n`, 'utf8')
}

function upsertById(list, entry) {
  const index = list.findIndex((item) => item.id === entry.id)

  if (index === -1) {
    list.push(entry)
    return
  }

  list[index] = entry
}

function replaceRelated(list, labId, rows) {
  return [...list.filter((item) => item.lab_id !== labId), ...rows]
}

function applyLab(target, payload) {
  upsertById(target.db.labs, {
    ...payload.shared,
    title: payload.localized.title,
    topic: payload.localized.topic,
    goal: payload.localized.goal,
    expected_results: payload.localized.expected_results,
    teacher_notes: payload.localized.teacher_notes,
  })

  target.db.lab_steps = replaceRelated(
    target.db.lab_steps,
    payload.shared.id,
    payload.localized.steps.map((step) => ({
      id: step.id,
      lab_id: payload.shared.id,
      step_order: step.step_order,
      block_type: step.block_type,
      content: step.content,
      caption: step.caption ?? null,
    }))
  )

  target.db.resources = replaceRelated(
    target.db.resources,
    payload.shared.id,
    payload.localized.resources.map((resource) => ({
      id: resource.id,
      lab_id: payload.shared.id,
      resource_type: resource.resource_type,
      title: resource.title,
      url: resource.url,
      file_size: resource.file_size ?? null,
      sort_order: resource.sort_order,
    }))
  )

  target.db.lab_equipment_items = replaceRelated(
    target.db.lab_equipment_items,
    payload.shared.id,
    payload.localized.items.map((item) => ({
      id: item.id,
      lab_id: payload.shared.id,
      item_name: item.item_name,
      quantity: item.quantity,
      notes: item.notes,
      sort_order: item.sort_order,
    }))
  )
}

const LABS = [
  {
    shared: {
      id: 'b3247bb0-1c66-4263-ae54-d63a2f45a23b',
      slug: 'izuchenie-zakona-oma-1774843125649',
      subject_id: 'subject-physics',
      grade_id: 'grade-8',
      equipment_id: 'equipment-em-kit',
      duration_minutes: 45,
      difficulty: 'beginner',
      is_published: true,
      created_at: '2026-03-30T03:58:46.915826+00:00',
      updated_at: '2026-04-03T08:10:00.000Z',
      thumbnail_url: null,
    },
    ru: {
      title: 'Изучение закона Ома',
      topic: 'Измерение силы тока и напряжения в простой электрической цепи',
      goal: 'Экспериментально подтвердить закон Ома и научиться рассчитывать сопротивление участка цепи.',
      expected_results:
        'Учащиеся соберут электрическую цепь, выполнят серию измерений и сделают вывод о зависимости силы тока от напряжения.',
      teacher_notes:
        'Перед началом работы напомните правила безопасной сборки цепи и проверьте правильность подключения датчиков.',
      steps: [
        {
          id: 'step-oma-1',
          step_order: 1,
          block_type: 'text',
          content:
            'Соберите простую электрическую цепь из источника питания, резистора, датчика тока PASCO и датчика напряжения.',
        },
        {
          id: 'step-oma-2',
          step_order: 2,
          block_type: 'text',
          content:
            'Изменяйте напряжение источника по шагам и для каждого значения записывайте силу тока в таблицу наблюдений.',
        },
        {
          id: 'step-oma-3',
          step_order: 3,
          block_type: 'text',
          content:
            'Постройте график зависимости силы тока от напряжения и вычислите сопротивление исследуемого участка цепи.',
        },
      ],
      resources: [
        {
          id: 'resource-oma-link',
          resource_type: 'link',
          title: 'Интерактивная модель электрической цепи',
          url: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html',
          sort_order: 0,
        },
      ],
      items: [
        {
          id: '840b574c-28dd-460d-9e98-c1bc613aea14',
          item_name: 'Источник питания',
          quantity: 1,
          notes: 'Регулируемый, до 12 В',
          sort_order: 0,
        },
        {
          id: 'item-oma-2',
          item_name: 'Резистор 10 Ом',
          quantity: 1,
          notes: 'Исправный, без перегрева',
          sort_order: 1,
        },
        {
          id: 'item-oma-3',
          item_name: 'Датчик тока PASCO',
          quantity: 1,
          notes: 'Для измерения силы тока',
          sort_order: 2,
        },
        {
          id: 'item-oma-4',
          item_name: 'Датчик напряжения PASCO',
          quantity: 1,
          notes: 'Для измерения напряжения на резисторе',
          sort_order: 3,
        },
      ],
    },
    ky: {
      title: 'Ом мыйзамын изилдөө',
      topic: 'Жөнөкөй электр чынжырындагы ток күчүн жана чыңалууну өлчөө',
      goal: 'Ом мыйзамын тажрыйба аркылуу ырастоо жана чынжыр бөлүгүнүн каршылыгын эсептөөнү үйрөнүү.',
      expected_results:
        'Окуучулар электр чынжырын чогултуп, бир нече өлчөө жүргүзүп, ток күчү менен чыңалуунун байланышы тууралуу жыйынтык чыгарышат.',
      teacher_notes:
        'Ишти баштаар алдында электр коопсуздугунун эрежелерин эскертип, датчиктер туура туташканын текшериңиз.',
      steps: [
        {
          id: 'step-oma-1',
          step_order: 1,
          block_type: 'text',
          content:
            'Булактан, резистордон, PASCO ток датчигинен жана чыңалуу датчигинен жөнөкөй электр чынжырын чогулткула.',
        },
        {
          id: 'step-oma-2',
          step_order: 2,
          block_type: 'text',
          content:
            'Булактын чыңалуусун этап-этабы менен өзгөртүп, ар бир мааниге ылайык ток күчүн байкоо таблицасына жазгыла.',
        },
        {
          id: 'step-oma-3',
          step_order: 3,
          block_type: 'text',
          content:
            'Ток күчүнүн чыңалууга көз карандылык графигин түзүп, изилденген чынжыр бөлүгүнүн каршылыгын эсептегиле.',
        },
      ],
      resources: [
        {
          id: 'resource-oma-link',
          resource_type: 'link',
          title: 'Электр чынжырынын интерактивдүү модели',
          url: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html',
          sort_order: 0,
        },
      ],
      items: [
        {
          id: '840b574c-28dd-460d-9e98-c1bc613aea14',
          item_name: 'Электр булагы',
          quantity: 1,
          notes: 'Жөнгө салынуучу, 12 В чейин',
          sort_order: 0,
        },
        {
          id: 'item-oma-2',
          item_name: '10 Ом резистор',
          quantity: 1,
          notes: 'Ысып кетпеген, жарактуу',
          sort_order: 1,
        },
        {
          id: 'item-oma-3',
          item_name: 'PASCO ток датчиги',
          quantity: 1,
          notes: 'Ток күчүн өлчөө үчүн',
          sort_order: 2,
        },
        {
          id: 'item-oma-4',
          item_name: 'PASCO чыңалуу датчиги',
          quantity: 1,
          notes: 'Резистордогу чыңалууну өлчөө үчүн',
          sort_order: 3,
        },
      ],
    },
  },
  {
    shared: {
      id: '1f473456-6b00-4aea-9734-9c000883d817',
      slug: 'issledovanie-zavisimosti-sily-toka-ot-napryazheniya-1774863786299',
      subject_id: 'subject-physics',
      grade_id: 'grade-9',
      equipment_id: 'equipment-em-kit',
      duration_minutes: 45,
      difficulty: 'intermediate',
      is_published: true,
      created_at: '2026-03-30T09:43:07.351Z',
      updated_at: '2026-04-03T08:00:00.000Z',
      thumbnail_url: null,
    },
    ru: {
      title: 'Исследование зависимости силы тока от напряжения',
      topic: 'Практическая работа по закону Ома с использованием датчиков PASCO',
      goal:
        'Установить зависимость силы тока от напряжения и подтвердить закон Ома на экспериментальных данных.',
      expected_results:
        'Учащиеся соберут цепь, снимут показания датчиков, оформят таблицу измерений и сделают вывод по графику.',
      teacher_notes:
        'Проверьте полярность датчиков и предложите группам сравнить полученные графики после завершения работы.',
      steps: [
        {
          id: 'step-7c8d0991-88a5-49ec-bc5b-ad464b4f4b60',
          step_order: 1,
          block_type: 'text',
          content:
            'Соберите электрическую цепь из источника питания, резистора, датчика тока и датчика напряжения. Установите минимальное значение напряжения и зафиксируйте первые показания.',
        },
        {
          id: 'step-fe973288-fe10-4b3e-9ee8-886143a4f237',
          step_order: 2,
          block_type: 'image',
          content:
            '/uploads/labs/draft-4413fb57-512d-4201-be7b-cb98a47b136c/shema-dejstvuyushayapage-0001-1774863766737.jpg',
          caption: 'Схема электрической цепи',
        },
        {
          id: 'step-c86c9f92-f2b4-4da7-8987-e4ee67d111f1',
          step_order: 3,
          block_type: 'video',
          content: 'https://www.youtube.com/watch?v=Q20TbdD02kY',
          caption: 'Видео о типах электрических цепей',
        },
      ],
      resources: [
        {
          id: 'resource-d9df5582-cac4-4fa1-9d0b-dce1eeba71fd',
          resource_type: 'pdf',
          title: 'Инструкция к лабораторной работе',
          url: '/uploads/labs/draft-4413fb57-512d-4201-be7b-cb98a47b136c/img0001-1774863748025.pdf',
          file_size: 2435694,
          sort_order: 0,
        },
        {
          id: 'resource-d6ec233d-2c7a-47c7-9cb8-09bc7231de3e',
          resource_type: 'image',
          title: 'Схема электрической цепи',
          url: '/uploads/labs/draft-4413fb57-512d-4201-be7b-cb98a47b136c/shema-dejstvuyushayapage-0001-1774863766737.jpg',
          file_size: 779831,
          sort_order: 1,
        },
        {
          id: 'resource-b0384141-13a0-4bff-84df-9b8b88511f10',
          resource_type: 'video',
          title: 'Видео: постоянный и переменный ток',
          url: '/uploads/labs/draft-4413fb57-512d-4201-be7b-cb98a47b136c/3-direct-currentdc-vs-alternating-currentac-1774863778488.mp4',
          file_size: 82181040,
          sort_order: 2,
        },
        {
          id: 'resource-6db7b12b-fd3a-47d3-a33f-d7dc4f983652',
          resource_type: 'worksheet',
          title: 'Рабочий лист',
          url: '/uploads/labs/draft-4413fb57-512d-4201-be7b-cb98a47b136c/kp-54-shkoly-1774863743407.pdf',
          file_size: 206948,
          sort_order: 3,
        },
      ],
      items: [
        {
          id: 'item-current-1',
          item_name: 'Источник питания',
          quantity: 1,
          notes: 'Регулируемый, до 12 В',
          sort_order: 0,
        },
        {
          id: 'item-current-2',
          item_name: 'Резистор 10 Ом',
          quantity: 1,
          notes: 'Нагрузка цепи для измерений',
          sort_order: 1,
        },
        {
          id: 'item-current-3',
          item_name: 'Датчик тока PASCO',
          quantity: 1,
          notes: 'Подключается последовательно',
          sort_order: 2,
        },
        {
          id: 'item-current-4',
          item_name: 'Датчик напряжения PASCO',
          quantity: 1,
          notes: 'Подключается параллельно резистору',
          sort_order: 3,
        },
        {
          id: 'item-current-5',
          item_name: 'Компьютер или планшет',
          quantity: 1,
          notes: 'Для работы с PASCO Capstone или SPARKvue',
          sort_order: 4,
        },
      ],
    },
    ky: {
      title: 'Ток күчүнүн чыңалууга көз карандылыгын изилдөө',
      topic: 'PASCO датчиктерин колдонуу менен Ом мыйзамы боюнча практикалык иш',
      goal:
        'Ток күчүнүн чыңалууга көз карандылыгын аныктап, эксперименттик маалыматтар аркылуу Ом мыйзамын ырастоо.',
      expected_results:
        'Окуучулар чынжырды чогултуп, датчиктердин көрсөткүчтөрүн жазып, өлчөөлөрдүн таблицасын түзүшөт жана график боюнча жыйынтык чыгарышат.',
      teacher_notes:
        'Датчиктердин уюлдуулугун текшерип, иш бүткөн соң топторго алынган графиктерди салыштырууну сунуштаңыз.',
      steps: [
        {
          id: 'step-7c8d0991-88a5-49ec-bc5b-ad464b4f4b60',
          step_order: 1,
          block_type: 'text',
          content:
            'Булактан, резистордон, ток датчигинен жана чыңалуу датчигинен электр чынжырын чогулткула. Чыңалуунун эң төмөн маанисин коюп, алгачкы көрсөткүчтөрдү жазгыла.',
        },
        {
          id: 'step-fe973288-fe10-4b3e-9ee8-886143a4f237',
          step_order: 2,
          block_type: 'image',
          content:
            '/uploads/labs/draft-4413fb57-512d-4201-be7b-cb98a47b136c/shema-dejstvuyushayapage-0001-1774863766737.jpg',
          caption: 'Электр чынжырынын схемасы',
        },
        {
          id: 'step-c86c9f92-f2b4-4da7-8987-e4ee67d111f1',
          step_order: 3,
          block_type: 'video',
          content: 'https://www.youtube.com/watch?v=Q20TbdD02kY',
          caption: 'Электр чынжырлары тууралуу видео',
        },
      ],
      resources: [
        {
          id: 'resource-d9df5582-cac4-4fa1-9d0b-dce1eeba71fd',
          resource_type: 'pdf',
          title: 'Лабораториялык иштин нускамасы',
          url: '/uploads/labs/draft-4413fb57-512d-4201-be7b-cb98a47b136c/img0001-1774863748025.pdf',
          file_size: 2435694,
          sort_order: 0,
        },
        {
          id: 'resource-d6ec233d-2c7a-47c7-9cb8-09bc7231de3e',
          resource_type: 'image',
          title: 'Электр чынжырынын схемасы',
          url: '/uploads/labs/draft-4413fb57-512d-4201-be7b-cb98a47b136c/shema-dejstvuyushayapage-0001-1774863766737.jpg',
          file_size: 779831,
          sort_order: 1,
        },
        {
          id: 'resource-b0384141-13a0-4bff-84df-9b8b88511f10',
          resource_type: 'video',
          title: 'Видео: туруктуу жана өзгөрмө ток',
          url: '/uploads/labs/draft-4413fb57-512d-4201-be7b-cb98a47b136c/3-direct-currentdc-vs-alternating-currentac-1774863778488.mp4',
          file_size: 82181040,
          sort_order: 2,
        },
        {
          id: 'resource-6db7b12b-fd3a-47d3-a33f-d7dc4f983652',
          resource_type: 'worksheet',
          title: 'Жумуш барагы',
          url: '/uploads/labs/draft-4413fb57-512d-4201-be7b-cb98a47b136c/kp-54-shkoly-1774863743407.pdf',
          file_size: 206948,
          sort_order: 3,
        },
      ],
      items: [
        {
          id: 'item-current-1',
          item_name: 'Электр булагы',
          quantity: 1,
          notes: 'Жөнгө салынуучу, 12 В чейин',
          sort_order: 0,
        },
        {
          id: 'item-current-2',
          item_name: '10 Ом резистор',
          quantity: 1,
          notes: 'Өлчөө үчүн чынжыр жүгү',
          sort_order: 1,
        },
        {
          id: 'item-current-3',
          item_name: 'PASCO ток датчиги',
          quantity: 1,
          notes: 'Тизмектей туташтырылат',
          sort_order: 2,
        },
        {
          id: 'item-current-4',
          item_name: 'PASCO чыңалуу датчиги',
          quantity: 1,
          notes: 'Резисторго параллель туташтырылат',
          sort_order: 3,
        },
        {
          id: 'item-current-5',
          item_name: 'Компьютер же планшет',
          quantity: 1,
          notes: 'PASCO Capstone же SPARKvue үчүн',
          sort_order: 4,
        },
      ],
    },
  },
  {
    shared: {
      id: '5d6d8d20-1c7e-4d18-8ef6-4f78d0267c01',
      slug: 'issledovanie-perioda-mayatnika-1775200000001',
      subject_id: 'subject-physics',
      grade_id: 'grade-9',
      equipment_id: 'equipment-mechanics-kit',
      duration_minutes: 40,
      difficulty: 'intermediate',
      is_published: true,
      created_at: '2026-04-03T08:20:00.000Z',
      updated_at: '2026-04-03T08:20:00.000Z',
      thumbnail_url: null,
    },
    ru: {
      title: 'Исследование периода математического маятника',
      topic: 'Определение зависимости периода колебаний от длины нити',
      goal:
        'Выяснить, как изменяется период маятника при изменении длины нити, и научиться проводить серию точных измерений.',
      expected_results:
        'Учащиеся измерят время нескольких колебаний, вычислят период и сделают вывод о влиянии длины нити на движение маятника.',
      teacher_notes:
        'Следите, чтобы угол отклонения был небольшим, а измерения проводились несколько раз для сравнения результатов.',
      steps: [
        {
          id: 'step-pendulum-1',
          step_order: 1,
          block_type: 'text',
          content:
            'Соберите маятник на штативе и измерьте длину нити от точки подвеса до центра груза.',
        },
        {
          id: 'step-pendulum-2',
          step_order: 2,
          block_type: 'text',
          content:
            'Отклоните груз на небольшой угол, измерьте время десяти колебаний и повторите опыт для нескольких длин нити.',
        },
        {
          id: 'step-pendulum-3',
          step_order: 3,
          block_type: 'text',
          content:
            'Рассчитайте период одного колебания, оформите таблицу и объясните, как длина нити влияет на период маятника.',
        },
      ],
      resources: [
        {
          id: 'resource-pendulum-link',
          resource_type: 'link',
          title: 'Виртуальная лаборатория маятника',
          url: 'https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab_all.html',
          sort_order: 0,
        },
      ],
      items: [
        {
          id: 'item-pendulum-1',
          item_name: 'Штатив',
          quantity: 1,
          notes: 'Для крепления нити',
          sort_order: 0,
        },
        {
          id: 'item-pendulum-2',
          item_name: 'Нить с грузом',
          quantity: 1,
          notes: 'Маятник для исследования',
          sort_order: 1,
        },
        {
          id: 'item-pendulum-3',
          item_name: 'Секундомер',
          quantity: 1,
          notes: 'Для измерения времени колебаний',
          sort_order: 2,
        },
        {
          id: 'item-pendulum-4',
          item_name: 'Линейка',
          quantity: 1,
          notes: 'Для измерения длины нити',
          sort_order: 3,
        },
      ],
    },
    ky: {
      title: 'Математикалык маятниктин мезгилин изилдөө',
      topic: 'Термелүү мезгилинин жип узундугуна көз карандылыгын аныктоо',
      goal:
        'Жиптин узундугу өзгөргөндө маятниктин мезгили кандай өзгөрөрүн аныктоо жана так өлчөө жүргүзүүнү үйрөнүү.',
      expected_results:
        'Окуучулар бир нече термелүүнүн убактысын өлчөп, мезгилди эсептеп, жиптин узундугу маятниктин кыймылына кандай таасир этерин түшүндүрүшөт.',
      teacher_notes:
        'Оодарылуу бурчу чоң болбошун көзөмөлдөп, жыйынтыктарды салыштыруу үчүн өлчөөнү бир нече жолу кайталатыңыз.',
      steps: [
        {
          id: 'step-pendulum-1',
          step_order: 1,
          block_type: 'text',
          content:
            'Штативге маятник орнотуп, жиптин узундугун асылуу чекитинен жүктүн борборуна чейин өлчөгүлө.',
        },
        {
          id: 'step-pendulum-2',
          step_order: 2,
          block_type: 'text',
          content:
            'Жүктү кичине бурчка четтетип, он термелүүнүн убактысын өлчөгүлө жана тажрыйбаны жиптин бир нече узундугу үчүн кайталагыла.',
        },
        {
          id: 'step-pendulum-3',
          step_order: 3,
          block_type: 'text',
          content:
            'Бир термелүүнүн мезгилин эсептеп, таблица түзгүлө жана жиптин узундугу мезгилге кандай таасир берерин түшүндүргүлө.',
        },
      ],
      resources: [
        {
          id: 'resource-pendulum-link',
          resource_type: 'link',
          title: 'Маятниктин виртуалдык лабораториясы',
          url: 'https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab_all.html',
          sort_order: 0,
        },
      ],
      items: [
        {
          id: 'item-pendulum-1',
          item_name: 'Штатив',
          quantity: 1,
          notes: 'Жипти бекитүү үчүн',
          sort_order: 0,
        },
        {
          id: 'item-pendulum-2',
          item_name: 'Жүк тагылган жип',
          quantity: 1,
          notes: 'Изилденүүчү маятник',
          sort_order: 1,
        },
        {
          id: 'item-pendulum-3',
          item_name: 'Секундомер',
          quantity: 1,
          notes: 'Термелүү убактысын өлчөө үчүн',
          sort_order: 2,
        },
        {
          id: 'item-pendulum-4',
          item_name: 'Сызгыч',
          quantity: 1,
          notes: 'Жиптин узундугун өлчөө үчүн',
          sort_order: 3,
        },
      ],
    },
  },
  {
    shared: {
      id: '7c8420f1-5a4b-4d7e-93f0-0d438a85d201',
      slug: 'issledovanie-kislotnosti-rastvorov-1775200000002',
      subject_id: 'subject-chemistry',
      grade_id: 'grade-7',
      equipment_id: 'equipment-chem-starter',
      duration_minutes: 40,
      difficulty: 'beginner',
      is_published: true,
      created_at: '2026-04-03T08:30:00.000Z',
      updated_at: '2026-04-03T08:30:00.000Z',
      thumbnail_url: null,
    },
    ru: {
      title: 'Исследование кислотности растворов',
      topic: 'Определение pH бытовых растворов с помощью индикатора',
      goal:
        'Научиться различать кислую, нейтральную и щелочную среду по результатам наблюдений.',
      expected_results:
        'Учащиеся сравнят несколько растворов, определят их примерный pH и распределят образцы по группам.',
      teacher_notes:
        'Напомните правила работы с реактивами и попросите учеников объяснить, почему цвет индикатора меняется.',
      steps: [
        {
          id: 'step-ph-1',
          step_order: 1,
          block_type: 'text',
          content:
            'Подготовьте несколько растворов в пробирках и подпишите их перед началом наблюдений.',
        },
        {
          id: 'step-ph-2',
          step_order: 2,
          block_type: 'text',
          content:
            'Добавьте индикатор в каждый образец и сравните полученный цвет со шкалой pH.',
        },
        {
          id: 'step-ph-3',
          step_order: 3,
          block_type: 'text',
          content:
            'Запишите результаты в таблицу и сделайте вывод о кислотности каждого раствора.',
        },
      ],
      resources: [
        {
          id: 'resource-ph-link',
          resource_type: 'link',
          title: 'Интерактивная шкала pH',
          url: 'https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_all.html',
          sort_order: 0,
        },
      ],
      items: [
        {
          id: 'item-ph-1',
          item_name: 'Пробирки',
          quantity: 3,
          notes: 'Для разных растворов',
          sort_order: 0,
        },
        {
          id: 'item-ph-2',
          item_name: 'Универсальный индикатор',
          quantity: 1,
          notes: 'Для определения pH',
          sort_order: 1,
        },
        {
          id: 'item-ph-3',
          item_name: 'Лист бумаги',
          quantity: 1,
          notes: 'Запись данных',
          sort_order: 2,
        },
        {
          id: 'item-ph-4',
          item_name: 'Набор бытовых растворов',
          quantity: 1,
          notes: 'Образцы для анализа',
          sort_order: 3,
        },
      ],
    },
    ky: {
      title: 'Эритмелердин кычкылдуулугун изилдөө',
      topic: 'Турмуштук эритмелердин pH маанисин индикатор аркылуу аныктоо',
      goal:
        'Байкоо жыйынтыгы боюнча кычкыл, нейтралдуу жана щелочтуу чөйрөнү айырмалоону үйрөнүү.',
      expected_results:
        'Окуучулар бир нече эритмени салыштырып, алардын болжолдуу pH маанисин аныктап, топторго бөлүшөт.',
      teacher_notes:
        'Реактивдер менен иштөө эрежелерин эскертип, индикатордун түсү эмне үчүн өзгөрөрүн түшүндүртүп көрүңүз.',
      steps: [
        {
          id: 'step-ph-1',
          step_order: 1,
          block_type: 'text',
          content:
            'Бир нече эритмени пробиркага куюп, байкоону баштар алдында ар бирин белгилегиле.',
        },
        {
          id: 'step-ph-2',
          step_order: 2,
          block_type: 'text',
          content:
            'Ар бир үлгүгө индикатор кошуп, алынган түстү pH шкаласы менен салыштыргыла.',
        },
        {
          id: 'step-ph-3',
          step_order: 3,
          block_type: 'text',
          content:
            'Жыйынтыктарды таблицага жазып, ар бир эритменин кычкылдуулугу боюнча корутунду чыгаргыла.',
        },
      ],
      resources: [
        {
          id: 'resource-ph-link',
          resource_type: 'link',
          title: 'pH шкаласынын интерактивдүү модели',
          url: 'https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_all.html',
          sort_order: 0,
        },
      ],
      items: [
        {
          id: 'item-ph-1',
          item_name: 'Пробиркалар',
          quantity: 3,
          notes: 'Ар түрдүү эритмелер үчүн',
          sort_order: 0,
        },
        {
          id: 'item-ph-2',
          item_name: 'Универсалдуу индикатор',
          quantity: 1,
          notes: 'pH аныктоо үчүн',
          sort_order: 1,
        },
        {
          id: 'item-ph-3',
          item_name: 'Кагаз барагы',
          quantity: 1,
          notes: 'Маалыматты жазуу үчүн',
          sort_order: 2,
        },
        {
          id: 'item-ph-4',
          item_name: 'Турмуштук эритмелер топтому',
          quantity: 1,
          notes: 'Талдоо үчүн үлгүлөр',
          sort_order: 3,
        },
      ],
    },
  },
  {
    shared: {
      id: '7c8420f1-5a4b-4d7e-93f0-0d438a85d202',
      slug: 'nablyudenie-priznakov-khimicheskoy-reaktsii-1775200000003',
      subject_id: 'subject-chemistry',
      grade_id: 'grade-8',
      equipment_id: 'equipment-chem-starter',
      duration_minutes: 45,
      difficulty: 'beginner',
      is_published: true,
      created_at: '2026-04-03T08:40:00.000Z',
      updated_at: '2026-04-03T08:40:00.000Z',
      thumbnail_url: null,
    },
    ru: {
      title: 'Наблюдение признаков химической реакции',
      topic: 'Определение выделения газа, изменения цвета и образования осадка',
      goal:
        'Научиться распознавать основные признаки химической реакции на основе простых опытов.',
      expected_results:
        'Учащиеся назовут признаки реакции и объяснят, по каким наблюдениям можно сделать вывод о превращении веществ.',
      teacher_notes:
        'Используйте небольшие количества реактивов и отдельно обсудите отличие химических и физических изменений.',
      steps: [
        {
          id: 'step-reaction-1',
          step_order: 1,
          block_type: 'text',
          content:
            'Подготовьте два простых опыта: смешивание уксуса с содой и взаимодействие двух безопасных солевых растворов.',
        },
        {
          id: 'step-reaction-2',
          step_order: 2,
          block_type: 'text',
          content:
            'Наблюдайте за изменениями цвета, появлением пузырьков и образованием осадка, фиксируя все признаки.',
        },
        {
          id: 'step-reaction-3',
          step_order: 3,
          block_type: 'text',
          content:
            'Сравните результаты опытов и объясните, какие наблюдения подтверждают протекание химической реакции.',
        },
      ],
      resources: [
        {
          id: 'resource-reaction-link',
          resource_type: 'link',
          title: 'Модель реагентов и продуктов реакции',
          url: 'https://phet.colorado.edu/sims/html/reactants-products-and-leftovers/latest/reactants-products-and-leftovers_all.html',
          sort_order: 0,
        },
      ],
      items: [
        {
          id: 'item-reaction-1',
          item_name: 'Пробирки',
          quantity: 4,
          notes: 'Для проведения опытов',
          sort_order: 0,
        },
        {
          id: 'item-reaction-2',
          item_name: 'Уксус',
          quantity: 1,
          notes: 'Для реакции с содой',
          sort_order: 1,
        },
        {
          id: 'item-reaction-3',
          item_name: 'Сода',
          quantity: 1,
          notes: 'Небольшое количество',
          sort_order: 2,
        },
        {
          id: 'item-reaction-4',
          item_name: 'Пипетки',
          quantity: 2,
          notes: 'Для точного дозирования',
          sort_order: 3,
        },
      ],
    },
    ky: {
      title: 'Химиялык реакциянын белгилерин байкоо',
      topic: 'Газ бөлүнүшүн, түстүн өзгөрүшүн жана чөкмөнүн пайда болушун аныктоо',
      goal:
        'Жөнөкөй тажрыйбалардын негизинде химиялык реакциянын негизги белгилерин таанууну үйрөнүү.',
      expected_results:
        'Окуучулар реакциянын белгилерин атап, заттар өзгөргөнүн кайсы байкоолор аркылуу билсе болорун түшүндүрүшөт.',
      teacher_notes:
        'Реактивдерди аз өлчөмдө колдонуп, химиялык жана физикалык өзгөрүүлөрдүн айырмасын өзүнчө талкуулаңыз.',
      steps: [
        {
          id: 'step-reaction-1',
          step_order: 1,
          block_type: 'text',
          content:
            'Эки жөнөкөй тажрыйбаны даярдагыла: уксусту сода менен аралаштыруу жана коопсуз туз эритмелеринин өз ара аракеттениши.',
        },
        {
          id: 'step-reaction-2',
          step_order: 2,
          block_type: 'text',
          content:
            'Түстүн өзгөрүшүн, көбүктүн чыгышын жана чөкмөнүн пайда болушун байкап, бардык белгилерди жазгыла.',
        },
        {
          id: 'step-reaction-3',
          step_order: 3,
          block_type: 'text',
          content:
            'Тажрыйбалардын жыйынтыгын салыштырып, кайсы байкоолор химиялык реакция жүргөнүн далилдей турганын түшүндүргүлө.',
        },
      ],
      resources: [
        {
          id: 'resource-reaction-link',
          resource_type: 'link',
          title: 'Реакциядагы реагенттер жана продукттар модели',
          url: 'https://phet.colorado.edu/sims/html/reactants-products-and-leftovers/latest/reactants-products-and-leftovers_all.html',
          sort_order: 0,
        },
      ],
      items: [
        {
          id: 'item-reaction-1',
          item_name: 'Пробиркалар',
          quantity: 4,
          notes: 'Тажрыйба жүргүзүү үчүн',
          sort_order: 0,
        },
        {
          id: 'item-reaction-2',
          item_name: 'Уксус',
          quantity: 1,
          notes: 'Сода менен реакция үчүн',
          sort_order: 1,
        },
        {
          id: 'item-reaction-3',
          item_name: 'Сода',
          quantity: 1,
          notes: 'Аз өлчөмдө',
          sort_order: 2,
        },
        {
          id: 'item-reaction-4',
          item_name: 'Пипеткалар',
          quantity: 2,
          notes: 'Так өлчөп куюу үчүн',
          sort_order: 3,
        },
      ],
    },
  },
  {
    shared: {
      id: '7c8420f1-5a4b-4d7e-93f0-0d438a85d203',
      slug: 'issledovanie-skorosti-rastvoreniya-veshchestv-1775200000004',
      subject_id: 'subject-chemistry',
      grade_id: 'grade-8',
      equipment_id: 'equipment-chem-starter',
      duration_minutes: 45,
      difficulty: 'intermediate',
      is_published: true,
      created_at: '2026-04-03T08:50:00.000Z',
      updated_at: '2026-04-03T08:50:00.000Z',
      thumbnail_url: null,
    },
    ru: {
      title: 'Исследование скорости растворения веществ',
      topic: 'Влияние температуры и перемешивания на растворение',
      goal:
        'Понять, как температура воды и перемешивание влияют на скорость растворения твёрдого вещества.',
      expected_results:
        'Учащиеся сравнят несколько условий растворения и объяснят, почему скорость процесса изменяется.',
      teacher_notes:
        'Не используйте слишком горячую воду и заранее обсудите с классом понятие скорости процесса.',
      steps: [
        {
          id: 'step-dissolve-1',
          step_order: 1,
          block_type: 'text',
          content:
            'Подготовьте три стакана с водой разной температуры и внесите одинаковое количество растворимого вещества.',
        },
        {
          id: 'step-dissolve-2',
          step_order: 2,
          block_type: 'text',
          content:
            'В одном случае перемешивайте раствор, а в другом наблюдайте растворение без перемешивания.',
        },
        {
          id: 'step-dissolve-3',
          step_order: 3,
          block_type: 'text',
          content:
            'Сравните время растворения и сформулируйте вывод о влиянии температуры и перемешивания.',
        },
      ],
      resources: [
        {
          id: 'resource-dissolve-link',
          resource_type: 'link',
          title: 'Модель растворов сахара и соли',
          url: 'https://phet.colorado.edu/sims/html/sugar-and-salt-solutions/latest/sugar-and-salt-solutions_all.html',
          sort_order: 0,
        },
      ],
      items: [
        {
          id: 'item-dissolve-1',
          item_name: 'Стаканы',
          quantity: 3,
          notes: 'Для воды разной температуры',
          sort_order: 0,
        },
        {
          id: 'item-dissolve-2',
          item_name: 'Соль или сахар',
          quantity: 1,
          notes: 'Растворимое вещество',
          sort_order: 1,
        },
        {
          id: 'item-dissolve-3',
          item_name: 'Ложка для перемешивания',
          quantity: 1,
          notes: 'Для эксперимента',
          sort_order: 2,
        },
        {
          id: 'item-dissolve-4',
          item_name: 'Термометр',
          quantity: 1,
          notes: 'Для контроля температуры воды',
          sort_order: 3,
        },
      ],
    },
    ky: {
      title: 'Заттардын эриш ылдамдыгын изилдөө',
      topic: 'Температура жана аралаштыруу эриш ылдамдыгына кандай таасир этет',
      goal:
        'Суунун температурасы жана аралаштыруу катуу заттын эриш ылдамдыгына кандай таасир берерин түшүнүү.',
      expected_results:
        'Окуучулар эриштин ар кандай шарттарын салыштырып, эмне үчүн процесс ылдамдыгы өзгөрөрүн түшүндүрүшөт.',
      teacher_notes:
        'Өтө ысык сууну колдонбоңуз жана иштин алдында процесс ылдамдыгы деген түшүнүктү кыскача талкуулаңыз.',
      steps: [
        {
          id: 'step-dissolve-1',
          step_order: 1,
          block_type: 'text',
          content:
            'Температурасы ар башка болгон үч стакан сууга эриүүчү заттын бирдей өлчөмүн салыгыла.',
        },
        {
          id: 'step-dissolve-2',
          step_order: 2,
          block_type: 'text',
          content:
            'Бир учурда эритмени аралаштырып, экинчисинде аралаштырбай эриш процессин байкагыла.',
        },
        {
          id: 'step-dissolve-3',
          step_order: 3,
          block_type: 'text',
          content:
            'Эриш убактысын салыштырып, температура менен аралаштыруунун таасири тууралуу жыйынтык чыгаргыла.',
        },
      ],
      resources: [
        {
          id: 'resource-dissolve-link',
          resource_type: 'link',
          title: 'Кант жана туз эритмелеринин модели',
          url: 'https://phet.colorado.edu/sims/html/sugar-and-salt-solutions/latest/sugar-and-salt-solutions_all.html',
          sort_order: 0,
        },
      ],
      items: [
        {
          id: 'item-dissolve-1',
          item_name: 'Стакандар',
          quantity: 3,
          notes: 'Ар башка температурадагы суу үчүн',
          sort_order: 0,
        },
        {
          id: 'item-dissolve-2',
          item_name: 'Туз же кант',
          quantity: 1,
          notes: 'Эриүүчү зат',
          sort_order: 1,
        },
        {
          id: 'item-dissolve-3',
          item_name: 'Аралаштыруучу кашык',
          quantity: 1,
          notes: 'Тажрыйба үчүн',
          sort_order: 2,
        },
        {
          id: 'item-dissolve-4',
          item_name: 'Термометр',
          quantity: 1,
          notes: 'Суунун температурасын көзөмөлдөө үчүн',
          sort_order: 3,
        },
      ],
    },
  },
  {
    shared: {
      id: '1d2b3c44-85f1-4d26-ae2a-ecf7289f4101',
      slug: 'nablyudenie-kletok-epidermisa-luka-1775200000005',
      subject_id: 'subject-biology',
      grade_id: 'grade-7',
      equipment_id: 'equipment-bio-starter',
      duration_minutes: 40,
      difficulty: 'beginner',
      is_published: true,
      created_at: '2026-04-03T09:00:00.000Z',
      updated_at: '2026-04-03T09:00:00.000Z',
      thumbnail_url: null,
    },
    ru: {
      title: 'Наблюдение клеток эпидермиса лука',
      topic: 'Изучение строения растительной клетки под микроскопом',
      goal:
        'Научиться готовить простой микропрепарат и распознавать основные части растительной клетки.',
      expected_results:
        'Учащиеся увидят клеточную стенку, ядро и вакуоль и смогут описать особенности клеток лука.',
      teacher_notes:
        'Покажите, как аккуратно снять тонкую кожицу лука и напомните правила работы с микроскопом.',
      steps: [
        {
          id: 'step-onion-1',
          step_order: 1,
          block_type: 'text',
          content:
            'Снимите тонкую плёнку с внутренней стороны чешуи лука и поместите её на предметное стекло.',
        },
        {
          id: 'step-onion-2',
          step_order: 2,
          block_type: 'text',
          content:
            'Добавьте каплю воды или красителя, накройте покровным стеклом и настройте микроскоп.',
        },
        {
          id: 'step-onion-3',
          step_order: 3,
          block_type: 'text',
          content:
            'Рассмотрите клетки, зарисуйте увиденное и подпишите основные структуры клетки.',
        },
      ],
      resources: [],
      items: [
        {
          id: 'item-onion-1',
          item_name: 'Микроскоп',
          quantity: 1,
          notes: 'Для наблюдения клеток',
          sort_order: 0,
        },
        {
          id: 'item-onion-2',
          item_name: 'Предметное и покровное стекло',
          quantity: 1,
          notes: 'Для приготовления препарата',
          sort_order: 1,
        },
        {
          id: 'item-onion-3',
          item_name: 'Луковица',
          quantity: 1,
          notes: 'Образец ткани',
          sort_order: 2,
        },
        {
          id: 'item-onion-4',
          item_name: 'Пинцет',
          quantity: 1,
          notes: 'Для снятия кожицы',
          sort_order: 3,
        },
      ],
    },
    ky: {
      title: 'Пияз эпидермисинин клеткаларын байкоо',
      topic: 'Өсүмдүк клеткасынын түзүлүшүн микроскоп менен изилдөө',
      goal:
        'Жөнөкөй микропрепарат даярдоону жана өсүмдүк клеткасынын негизги бөлүктөрүн таанууну үйрөнүү.',
      expected_results:
        'Окуучулар клетка дубалын, ядрону жана вакуолду көрүп, пияз клеткаларынын өзгөчөлүктөрүн сүрөттөп бере алышат.',
      teacher_notes:
        'Пияздын жука кабыгын этият алуу жолун көрсөтүп, микроскоп менен иштөө эрежелерин эскертиңиз.',
      steps: [
        {
          id: 'step-onion-1',
          step_order: 1,
          block_type: 'text',
          content:
            'Пияз кабыгынын ички тарабынан жука катмарды алып, аны предметтик айнекке жайгаштыргыла.',
        },
        {
          id: 'step-onion-2',
          step_order: 2,
          block_type: 'text',
          content:
            'Бир тамчы суу же боёк кошуп, үстүн жаап айнек менен жаап, микроскопту тууралагыла.',
        },
        {
          id: 'step-onion-3',
          step_order: 3,
          block_type: 'text',
          content:
            'Клеткаларды байкап, көргөнүңөрдү сүрөткө же сүрөттөмөгө түшүрүп, негизги түзүлүштөрүн белгилегиле.',
        },
      ],
      resources: [],
      items: [
        {
          id: 'item-onion-1',
          item_name: 'Микроскоп',
          quantity: 1,
          notes: 'Клеткаларды байкоо үчүн',
          sort_order: 0,
        },
        {
          id: 'item-onion-2',
          item_name: 'Предметтик жана жабуучу айнек',
          quantity: 1,
          notes: 'Препарат даярдоо үчүн',
          sort_order: 1,
        },
        {
          id: 'item-onion-3',
          item_name: 'Пияз башы',
          quantity: 1,
          notes: 'Ткань үлгүсү',
          sort_order: 2,
        },
        {
          id: 'item-onion-4',
          item_name: 'Пинцет',
          quantity: 1,
          notes: 'Жука кабыкты алуу үчүн',
          sort_order: 3,
        },
      ],
    },
  },
  {
    shared: {
      id: '1d2b3c44-85f1-4d26-ae2a-ecf7289f4102',
      slug: 'issledovanie-usloviy-prorastaniya-semyan-1775200000006',
      subject_id: 'subject-biology',
      grade_id: 'grade-8',
      equipment_id: 'equipment-bio-starter',
      duration_minutes: 45,
      difficulty: 'intermediate',
      is_published: true,
      created_at: '2026-04-03T09:10:00.000Z',
      updated_at: '2026-04-03T09:10:00.000Z',
      thumbnail_url: null,
    },
    ru: {
      title: 'Исследование условий прорастания семян',
      topic: 'Влияние воды, воздуха и температуры на прорастание',
      goal:
        'Определить, какие условия необходимы семенам для начала прорастания.',
      expected_results:
        'Учащиеся сравнят несколько вариантов опыта и объяснят, какие факторы являются обязательными для прорастания.',
      teacher_notes:
        'Подготовьте несколько наборов семян заранее, чтобы ученики могли сравнить результаты в конце занятия.',
      steps: [
        {
          id: 'step-seed-1',
          step_order: 1,
          block_type: 'text',
          content:
            'Разместите семена в разных условиях: с водой, без воды, в тепле и при пониженной температуре.',
        },
        {
          id: 'step-seed-2',
          step_order: 2,
          block_type: 'text',
          content:
            'Наблюдайте изменения каждый день, отмечая появление корешка и ростка.',
        },
        {
          id: 'step-seed-3',
          step_order: 3,
          block_type: 'text',
          content:
            'Сравните результаты всех образцов и сделайте вывод о необходимых условиях прорастания.',
        },
      ],
      resources: [],
      items: [
        {
          id: 'item-seed-1',
          item_name: 'Семена фасоли или гороха',
          quantity: 1,
          notes: 'Для проведения наблюдений',
          sort_order: 0,
        },
        {
          id: 'item-seed-2',
          item_name: 'Чашки Петри',
          quantity: 3,
          notes: 'Для разных условий',
          sort_order: 1,
        },
        {
          id: 'item-seed-3',
          item_name: 'Салфетки',
          quantity: 3,
          notes: 'Для увлажнения семян',
          sort_order: 2,
        },
        {
          id: 'item-seed-4',
          item_name: 'Вода',
          quantity: 1,
          notes: 'Для создания влажной среды',
          sort_order: 3,
        },
      ],
    },
    ky: {
      title: 'Уруктардын өнүү шарттарын изилдөө',
      topic: 'Суу, аба жана температура өнүүгө кандай таасир этет',
      goal:
        'Уруктардын өнүп башташы үчүн кайсы шарттар зарыл экенин аныктоо.',
      expected_results:
        'Окуучулар тажрыйбанын бир нече вариантын салыштырып, өнүү үчүн кайсы факторлор милдеттүү экенин түшүндүрүшөт.',
      teacher_notes:
        'Сабактын аягында салыштыруу оңой болушу үчүн уруктардын бир нече топтомун алдын ала даярдап коюңуз.',
      steps: [
        {
          id: 'step-seed-1',
          step_order: 1,
          block_type: 'text',
          content:
            'Уруктарды ар башка шарттарга жайгаштыргыла: суу менен, суусуз, жылуу жерде жана төмөн температурада.',
        },
        {
          id: 'step-seed-2',
          step_order: 2,
          block_type: 'text',
          content:
            'Күн сайын байкап, тамырчанын жана өсүндүнүн пайда болушун белгилеп тургула.',
        },
        {
          id: 'step-seed-3',
          step_order: 3,
          block_type: 'text',
          content:
            'Бардык үлгүлөрдүн жыйынтыгын салыштырып, өнүү үчүн зарыл шарттар тууралуу корутунду чыгаргыла.',
        },
      ],
      resources: [],
      items: [
        {
          id: 'item-seed-1',
          item_name: 'Буурчак же төө буурчак уруктары',
          quantity: 1,
          notes: 'Байкоо жүргүзүү үчүн',
          sort_order: 0,
        },
        {
          id: 'item-seed-2',
          item_name: 'Петри чөйчөктөрү',
          quantity: 3,
          notes: 'Ар башка шарттар үчүн',
          sort_order: 1,
        },
        {
          id: 'item-seed-3',
          item_name: 'Салфеткалар',
          quantity: 3,
          notes: 'Уруктарды нымдоо үчүн',
          sort_order: 2,
        },
        {
          id: 'item-seed-4',
          item_name: 'Суу',
          quantity: 1,
          notes: 'Нымдуу чөйрө түзүү үчүн',
          sort_order: 3,
        },
      ],
    },
  },
  {
    shared: {
      id: '1d2b3c44-85f1-4d26-ae2a-ecf7289f4103',
      slug: 'izmerenie-chastoty-pulsa-posle-nagruzki-1775200000007',
      subject_id: 'subject-biology',
      grade_id: 'grade-9',
      equipment_id: 'equipment-bio-starter',
      duration_minutes: 35,
      difficulty: 'beginner',
      is_published: true,
      created_at: '2026-04-03T09:20:00.000Z',
      updated_at: '2026-04-03T09:20:00.000Z',
      thumbnail_url: null,
    },
    ru: {
      title: 'Измерение частоты пульса после нагрузки',
      topic: 'Сравнение пульса в покое и после физического упражнения',
      goal:
        'Понять, как физическая нагрузка влияет на работу сердечно-сосудистой системы.',
      expected_results:
        'Учащиеся измерят пульс до и после нагрузки, сравнят результаты и объяснят изменение частоты сердечных сокращений.',
      teacher_notes:
        'Подберите безопасную нагрузку для класса и обсудите, почему организму требуется больше кислорода при движении.',
      steps: [
        {
          id: 'step-pulse-1',
          step_order: 1,
          block_type: 'text',
          content:
            'Измерьте пульс в состоянии покоя в течение 30 секунд и занесите результат в таблицу.',
        },
        {
          id: 'step-pulse-2',
          step_order: 2,
          block_type: 'text',
          content:
            'Выполните короткую физическую нагрузку, затем через 20 секунд снова измерьте пульс.',
        },
        {
          id: 'step-pulse-3',
          step_order: 3,
          block_type: 'text',
          content:
            'Сравните оба значения и объясните, почему после нагрузки частота пульса изменилась.',
        },
      ],
      resources: [],
      items: [
        {
          id: 'item-pulse-1',
          item_name: 'Секундомер',
          quantity: 1,
          notes: 'Для измерения времени',
          sort_order: 0,
        },
        {
          id: 'item-pulse-2',
          item_name: 'Таблица наблюдений',
          quantity: 1,
          notes: 'Для записи результатов',
          sort_order: 1,
        },
        {
          id: 'item-pulse-3',
          item_name: 'Карандаш',
          quantity: 1,
          notes: 'Для заполнения таблицы',
          sort_order: 2,
        },
      ],
    },
    ky: {
      title: 'Жүктөмдөн кийин пульстун жыштыгын өлчөө',
      topic: 'Тынч абалдагы жана көнүгүүдөн кийинки пульсту салыштыруу',
      goal:
        'Физикалык жүктөм жүрөк-кан тамыр системасынын ишине кандай таасир этерин түшүнүү.',
      expected_results:
        'Окуучулар жүктөмгө чейин жана андан кийин пульсту өлчөп, жыйынтыктарды салыштырып, жүрөк кагышынын эмне үчүн өзгөргөнүн түшүндүрүшөт.',
      teacher_notes:
        'Класска ылайыктуу коопсуз жүктөм тандап, кыймыл учурунда организмге эмне үчүн көбүрөөк кычкылтек керек болорун талкуулаңыз.',
      steps: [
        {
          id: 'step-pulse-1',
          step_order: 1,
          block_type: 'text',
          content:
            'Тынч абалда 30 секунд ичинде пульсту өлчөп, жыйынтыкты таблицага жазыңыз.',
        },
        {
          id: 'step-pulse-2',
          step_order: 2,
          block_type: 'text',
          content:
            'Кыска физикалык көнүгүү жасап, 20 секунддан кийин пульсту кайра өлчөгүлө.',
        },
        {
          id: 'step-pulse-3',
          step_order: 3,
          block_type: 'text',
          content:
            'Эки маанини салыштырып, жүктөмдөн кийин пульстун эмне үчүн өзгөргөнүн түшүндүргүлө.',
        },
      ],
      resources: [],
      items: [
        {
          id: 'item-pulse-1',
          item_name: 'Секундомер',
          quantity: 1,
          notes: 'Убакыт өлчөө үчүн',
          sort_order: 0,
        },
        {
          id: 'item-pulse-2',
          item_name: 'Байкоо таблицасы',
          quantity: 1,
          notes: 'Жыйынтыктарды жазуу үчүн',
          sort_order: 1,
        },
        {
          id: 'item-pulse-3',
          item_name: 'Карандаш',
          quantity: 1,
          notes: 'Таблицаны толтуруу үчүн',
          sort_order: 2,
        },
      ],
    },
  },
  // MORE_LABS
]

function main() {
  const ru = readDb('ru')
  const ky = readDb('ky')

  for (const lab of LABS) {
    applyLab(ru, { shared: lab.shared, localized: lab.ru })
    applyLab(ky, { shared: lab.shared, localized: lab.ky })
  }

  saveDb(ru.filePath, ru.db)
  saveDb(ky.filePath, ky.db)
  saveDb(path.join(__dirname, 'data', 'local-db.json'), ru.db)

  console.log(`Repaired ${LABS.length} localized labs`)
}

main()
