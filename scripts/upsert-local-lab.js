import fs from 'fs'
import path from 'path'

function readStdin() {
  return new Promise((resolve, reject) => {
    let result = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => {
      result += chunk
    })
    process.stdin.on('end', () => resolve(result))
    process.stdin.on('error', reject)
  })
}

function loadDb(locale) {
  const filePath = path.join(__dirname, '..', 'data', `local-db.${locale}.json`)
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

  if (index >= 0) {
    list[index] = entry
  } else {
    list.push(entry)
  }
}

function replaceRelated(list, labId, rows) {
  const next = list.filter((item) => item.lab_id !== labId)
  next.push(...rows)
  return next
}

function applyPayload(target, shared, localized) {
  upsertById(target.db.labs, {
    ...shared,
    title: localized.title,
    topic: localized.topic,
    goal: localized.goal,
    expected_results: localized.expected_results,
    teacher_notes: localized.teacher_notes,
  })

  target.db.lab_steps = replaceRelated(
    target.db.lab_steps,
    shared.id,
    localized.steps.map((step) => ({
      id: step.id,
      lab_id: shared.id,
      step_order: step.step_order,
      block_type: step.block_type,
      content: step.content,
      caption: step.caption,
    }))
  )

  target.db.resources = replaceRelated(
    target.db.resources,
    shared.id,
    localized.resources.map((resource) => ({
      id: resource.id,
      lab_id: shared.id,
      resource_type: resource.resource_type,
      title: resource.title,
      url: resource.url,
      file_size: resource.file_size,
      sort_order: resource.sort_order,
    }))
  )

  target.db.lab_equipment_items = replaceRelated(
    target.db.lab_equipment_items,
    shared.id,
    localized.items.map((item) => ({
      id: item.id,
      lab_id: shared.id,
      item_name: item.item_name,
      quantity: item.quantity,
      notes: item.notes,
      sort_order: item.sort_order,
    }))
  )
}

async function main() {
  const sourceFile = process.argv[2]
  const raw = sourceFile
    ? fs.readFileSync(path.resolve(process.cwd(), sourceFile), 'utf8')
    : await readStdin()
  const payload = JSON.parse(raw)
  const ru = loadDb('ru')
  const ky = loadDb('ky')

  applyPayload(ru, payload.shared, payload.ru)
  applyPayload(ky, payload.shared, payload.ky)

  saveDb(ru.filePath, ru.db)
  saveDb(ky.filePath, ky.db)
  saveDb(path.join(__dirname, '..', 'data', 'local-db.json'), ru.db)

  console.log(`Upserted ${payload.shared.slug}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

