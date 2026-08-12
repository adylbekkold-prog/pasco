const fs = require('fs')

const ru = JSON.parse(fs.readFileSync('./data/local-db.ru.json', 'utf8'))
const ky = JSON.parse(fs.readFileSync('./data/local-db.ky.json', 'utf8'))

function removeAlt(v, fields, locale) {
  const n = { ...v }
  const alt = locale === 'ky' ? 'ru' : 'ky'
  for (const f of fields) delete n[f + '_' + alt]
  return n
}

// Simulate normalizeDb for ru locale
const ruComps = ru.pasco_kit_components.map((c) =>
  removeAlt(c, ['name', 'description', 'storage_location', 'notes'], 'ru')
)

const kit = ru.pasco_kits.find((k) => k.id === 'pasco-kit-1')
const comps = ruComps
  .filter((c) => c.kit_id === kit.id)
  .sort((a, b) => a.sort_order - b.sort_order)

console.log('Kit:', kit.name)
console.log('Components count:', comps.length)
console.log('First 3 names:', comps.slice(0, 3).map((c) => c.name))
console.log('First 3 descriptions:', comps.slice(0, 3).map((c) => c.description))
