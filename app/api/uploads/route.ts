import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import slugify from 'slugify'
import { NextResponse } from 'next/server'
import { assertServerLocalAdminAccess } from '@/lib/admin-access'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads', 'labs')

const ALLOWED_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.svg', '.avif',
  '.mp4', '.webm', '.ogg', '.mov',
  '.pdf',
  '.spklab',
])

function sanitizeSegment(value: string) {
  return slugify(value, { lower: true, strict: true }) || 'upload'
}

function getSafeFileName(fileName: string) {
  const extension = path.extname(fileName)
  const baseName = path.basename(fileName, extension)
  const safeBase = slugify(baseName, { lower: true, strict: true }) || 'file'

  return `${safeBase}-${Date.now()}${extension.toLowerCase()}`
}

function isAllowedExtension(fileName: string) {
  return ALLOWED_EXTENSIONS.has(path.extname(fileName).toLowerCase())
}

export async function POST(request: Request) {
  try {
    await assertServerLocalAdminAccess()
  } catch {
    return NextResponse.json({ error: 'Требуется пароль администратора.' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  const scope = sanitizeSegment(String(formData.get('scope') ?? 'draft'))

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Файл не передан.' }, { status: 400 })
  }

  if (!isAllowedExtension(file.name)) {
    return NextResponse.json(
      { error: 'Тип файла не поддерживается.' },
      { status: 415 }
    )
  }

  const fileName = getSafeFileName(file.name)
  const targetDir = path.join(UPLOAD_ROOT, scope)
  const targetPath = path.join(targetDir, fileName)

  // Belt-and-suspender: ensure we stay inside uploads root
  const root = path.resolve(UPLOAD_ROOT)
  const resolved = path.resolve(targetDir, fileName)
  const relative = path.relative(root, resolved)
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return NextResponse.json({ error: 'Недопустимый путь.' }, { status: 400 })
  }

  await mkdir(targetDir, { recursive: true })
  await writeFile(targetPath, Buffer.from(await file.arrayBuffer()))

  return NextResponse.json({
    url: `/uploads/labs/${scope}/${fileName}`,
    fileName: file.name,
    size: file.size,
  })
}
