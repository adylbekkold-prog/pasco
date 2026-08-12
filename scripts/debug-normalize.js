const fs = require('fs')

const ru = JSON.parse(fs.readFileSync('./data/local-db.ru.json', 'utf8'))

function removeAlt(v, fields, locale) {
  const n = { ...v }
  const alt = locale === 'ky' ? 'ru' : 'ky'
  for (const f of fields) delete n[f + '_' + alt]
  return n
}

// Simulate normalizeDb for ru locale on pasco_kit_components
const normalizedComps = ru.pasco_kit_components
  .map((c) => removeAlt(c, ['name', 'description', 'storage_location', 'notes'], 'ru'))
  .sort((a, b) => a.kit_id.localeCompare(b.kit_id) || a.sort_order - b.sort_order)

// Compare with raw
const rawComps = ru.pasco_kit_components
const rawIds = rawComps.map((c) => c.id).sort()
const normIds = normalizedComps.map((c) => c.id).sort()

console.log('Raw comp count:', rawComps.length)
console.log('Normalized comp count:', normalizedComps.length)
console.log('Same IDs:', JSON.stringify(rawIds) === JSON.stringify(normIds))

// Check if raw has _ky fields that normalized strips
const rawHasKy = rawComps.some((c) => c.name_ky)
console.log('Raw has name_ky:', rawHasKy)
const normHasKy = normalizedComps.some((c) => c.name_ky)
console.log('Normalized has name_ky:', normHasKy)

// Check if raw has _ru fields
const rawHasRu = rawComps.some((c) => c.name_ru)
console.log('Raw has name_ru:', rawHasRu)
const normHasRu = normalizedComps.some((c) => c.name_ru)
console.log('Normalized has name_ru:', normHasRu)

// Check if raw file matches normalized (ignoring _ky fields)
const rawStripped = rawComps.map((c) => removeAlt(c, ['name', 'description', 'storage_location', 'notes'], 'ru'))
const rawStrippedSorted = rawStripped.sort((a, b) => a.kit_id.localeCompare(b.kit_id) || a.sort_order - b.sort_order)
console.log('Raw-stripped == Normalized:', JSON.stringify(rawStrippedSorted) === JSON.stringify(normalizedComps))
