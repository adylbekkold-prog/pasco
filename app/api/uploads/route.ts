import { chmod, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import slugify from 'slugify'
import { NextResponse } from 'next/server'
import { assertServerLocalAdminAccess } from '@/lib/admin-access'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads', 'labs')
const PUBLIC_UPLOADS_ROOT = path.dirname(UPLOAD_ROOT)
const DEFAULT_MAX_UPLOAD_BYTES = 100 * 1024 * 1024
const PUBLIC_UPLOAD_DIR_MODE = 0o755
const PUBLIC_UPLOAD_FILE_MODE = 0o644

const ALLOWED_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.avif',
  '.mp4', '.webm', '.ogg', '.mov',
  '.pdf',
  '.spklab',
])

const ALLOWED_MIME_TYPES = new Map<string, Set<string>>([
  ['.avif', new Set(['image/avif'])],
  ['.bmp', new Set(['image/bmp', 'image/x-ms-bmp'])],
  ['.gif', new Set(['image/gif'])],
  ['.jpeg', new Set(['image/jpeg'])],
  ['.jpg', new Set(['image/jpeg'])],
  ['.mov', new Set(['video/quicktime', 'video/mp4'])],
  ['.mp4', new Set(['video/mp4'])],
  ['.ogg', new Set(['video/ogg', 'application/ogg'])],
  ['.pdf', new Set(['application/pdf'])],
  ['.png', new Set(['image/png'])],
  ['.spklab', new Set(['application/octet-stream', 'application/zip'])],
  ['.webm', new Set(['video/webm'])],
  ['.webp', new Set(['image/webp'])],
])

function sanitizeSegment(value: string) {
  return slugify(value, { lower: true, strict: true }) || 'upload'
}

function isMissingPathError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'ENOENT'
  )
}

async function chmodIfExists(filePath: string, mode: number) {
  try {
    await chmod(filePath, mode)
  } catch (error) {
    if (!isMissingPathError(error)) throw error
  }
}

async function preparePublicUploadDirectory(targetDir: string) {
  await mkdir(targetDir, { recursive: true, mode: PUBLIC_UPLOAD_DIR_MODE })
  await chmodIfExists(PUBLIC_UPLOADS_ROOT, PUBLIC_UPLOAD_DIR_MODE)
  await chmodIfExists(UPLOAD_ROOT, PUBLIC_UPLOAD_DIR_MODE)
  await chmodIfExists(targetDir, PUBLIC_UPLOAD_DIR_MODE)
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

function getMaxUploadBytes() {
  const configured = Number.parseInt(process.env.MAX_UPLOAD_BYTES ?? '', 10)
  return Number.isInteger(configured) && configured > 0
    ? configured
    : DEFAULT_MAX_UPLOAD_BYTES
}

function exceedsRequestSizeLimit(request: Request) {
  const contentLength = Number.parseInt(request.headers.get('content-length') ?? '', 10)
  return Number.isInteger(contentLength) && contentLength > getMaxUploadBytes()
}

function hasAllowedMimeType(fileName: string, fileType: string) {
  const extension = path.extname(fileName).toLowerCase()
  const allowedTypes = ALLOWED_MIME_TYPES.get(extension)
  const normalizedType = fileType.split(';')[0]?.trim().toLowerCase()

  if (!normalizedType) return extension === '.spklab'
  return Boolean(allowedTypes && normalizedType && allowedTypes.has(normalizedType))
}

function startsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((byte, index) => bytes[index] === byte)
}

function asciiAt(bytes: Uint8Array, offset: number, value: string) {
  if (bytes.length < offset + value.length) return false
  return value.split('').every((char, index) => bytes[offset + index] === char.charCodeAt(0))
}

function hasExpectedSignature(fileName: string, bytes: Uint8Array) {
  const extension = path.extname(fileName).toLowerCase()

  switch (extension) {
    case '.avif':
      return asciiAt(bytes, 4, 'ftyp') && ['avif', 'avis'].some((brand) => asciiAt(bytes, 8, brand))
    case '.bmp':
      return asciiAt(bytes, 0, 'BM')
    case '.gif':
      return asciiAt(bytes, 0, 'GIF87a') || asciiAt(bytes, 0, 'GIF89a')
    case '.jpeg':
    case '.jpg':
      return startsWith(bytes, [0xff, 0xd8, 0xff])
    case '.mov':
    case '.mp4':
      return asciiAt(bytes, 4, 'ftyp')
    case '.ogg':
      return asciiAt(bytes, 0, 'OggS')
    case '.pdf':
      return asciiAt(bytes, 0, '%PDF-')
    case '.png':
      return startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    case '.webm':
      return startsWith(bytes, [0x1a, 0x45, 0xdf, 0xa3])
    case '.webp':
      return asciiAt(bytes, 0, 'RIFF') && asciiAt(bytes, 8, 'WEBP')
    case '.spklab':
      return bytes.length > 0
    default:
      return false
  }
}

export async function POST(request: Request) {
  try {
    await assertServerLocalAdminAccess()
  } catch {
    return NextResponse.json({ error: 'Требуется пароль администратора.' }, { status: 401 })
  }

  if (exceedsRequestSizeLimit(request)) {
    return NextResponse.json({ error: 'Файл слишком большой.' }, { status: 413 })
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

  if (file.size <= 0 || file.size > getMaxUploadBytes()) {
    return NextResponse.json({ error: 'Файл слишком большой или пустой.' }, { status: 413 })
  }

  if (!hasAllowedMimeType(file.name, file.type)) {
    return NextResponse.json(
      { error: 'MIME-тип файла не соответствует разрешенным типам.' },
      { status: 415 }
    )
  }

  const fileBytes = new Uint8Array(await file.arrayBuffer())
  if (!hasExpectedSignature(file.name, fileBytes)) {
    return NextResponse.json(
      { error: 'Содержимое файла не соответствует расширению.' },
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

  await preparePublicUploadDirectory(targetDir)
  await writeFile(targetPath, Buffer.from(fileBytes), { mode: PUBLIC_UPLOAD_FILE_MODE })
  await chmodIfExists(targetPath, PUBLIC_UPLOAD_FILE_MODE)

  return NextResponse.json({
    url: `/uploads/labs/${scope}/${fileName}`,
    fileName: file.name,
    size: file.size,
  })
}
