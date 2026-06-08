import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import slugify from 'slugify'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function sanitizeSegment(value: string) {
  return slugify(value, { lower: true, strict: true }) || 'upload'
}

function getSafeFileName(fileName: string) {
  const extension = path.extname(fileName)
  const baseName = path.basename(fileName, extension)
  const safeBase = slugify(baseName, { lower: true, strict: true }) || 'file'

  return `${safeBase}-${Date.now()}${extension.toLowerCase()}`
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file')
  const scope = sanitizeSegment(String(formData.get('scope') ?? 'draft'))

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Файл не передан.' }, { status: 400 })
  }

  const targetDir = path.join(process.cwd(), 'public', 'uploads', 'labs', scope)
  const fileName = getSafeFileName(file.name)
  const targetPath = path.join(targetDir, fileName)

  await mkdir(targetDir, { recursive: true })
  await writeFile(targetPath, Buffer.from(await file.arrayBuffer()))

  return NextResponse.json({
    url: `/uploads/labs/${scope}/${fileName}`,
    fileName: file.name,
    size: file.size,
  })
}
