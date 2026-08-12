export function getSeoDescription(value: string | null | undefined, fallback: string) {
  const text = String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()

  if (!text) return fallback
  if (text.length <= 155) return text

  return `${text.slice(0, 152).trim()}...`
}
