import 'server-only'

import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'

const UPLOADS_ROOT = path.join(/* turbopackIgnore: true */ process.cwd(), 'public', 'uploads', 'labs')
const CONTENT_TYPES: Record<string, string> = {
  '.avif': 'image/avif',
  '.bmp': 'image/bmp',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.mov': 'video/quicktime',
  '.mp4': 'video/mp4',
  '.ogg': 'video/ogg',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.spklab': 'application/octet-stream',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
}

const ALLOWED_EXTENSIONS = new Set(Object.keys(CONTENT_TYPES))

interface ByteRange {
  end: number
  start: number
}

function resolveUploadPath(segments: string[]) {
  const decodedSegments = segments.map((segment) => decodeURIComponent(segment))
  const filePath = path.resolve(/* turbopackIgnore: true */ UPLOADS_ROOT, ...decodedSegments)
  const relativePath = path.relative(UPLOADS_ROOT, filePath)

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) return null
  if (!ALLOWED_EXTENSIONS.has(path.extname(filePath).toLowerCase())) return null

  return filePath
}

function createEntityTag(size: number, modifiedAt: Date) {
  return `W/"${size.toString(16)}-${Math.trunc(modifiedAt.getTime()).toString(16)}"`
}

function getContentDisposition(filePath: string) {
  const fileName = path.basename(filePath).replaceAll('"', '')
  return `inline; filename="${fileName}"`
}

function getBaseHeaders(
  filePath: string,
  contentLength: number,
  entityTag: string,
  modifiedAt: Date
) {
  const extension = path.extname(filePath).toLowerCase()

  return {
    'accept-ranges': 'bytes',
    'cache-control': 'public, max-age=31536000, immutable',
    'content-disposition': getContentDisposition(filePath),
    'content-length': String(contentLength),
    'content-type': CONTENT_TYPES[extension] ?? 'application/octet-stream',
    'cross-origin-embedder-policy': 'credentialless',
    'cross-origin-opener-policy': 'same-origin',
    'cross-origin-resource-policy': 'same-origin',
    etag: entityTag,
    'last-modified': modifiedAt.toUTCString(),
    'origin-agent-cluster': '?1',
    'permissions-policy': 'bluetooth=(self), cross-origin-isolated=(self), serial=(self), usb=(self)',
    'referrer-policy': 'no-referrer',
    'x-content-type-options': 'nosniff',
    'x-dns-prefetch-control': 'off',
  }
}

function parseRangeHeader(rangeHeader: string | null, fileSize: number): ByteRange | 'invalid' | null {
  if (!rangeHeader) return null
  if (!rangeHeader.startsWith('bytes=') || rangeHeader.includes(',')) return 'invalid'

  const [startValue, endValue] = rangeHeader.slice(6).split('-', 2)
  if (!startValue && !endValue) return 'invalid'

  if (!startValue) {
    const suffixLength = Number(endValue)
    if (!Number.isInteger(suffixLength) || suffixLength <= 0) return 'invalid'

    return {
      start: Math.max(0, fileSize - suffixLength),
      end: fileSize - 1,
    }
  }

  const start = Number(startValue)
  const end = endValue ? Number(endValue) : fileSize - 1

  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end < start ||
    start >= fileSize ||
    end >= fileSize
  ) {
    return 'invalid'
  }

  return { start, end }
}

function isNotModified(request: Request, entityTag: string, modifiedAt: Date) {
  if (request.headers.get('if-none-match') === entityTag) return true

  const ifModifiedSince = request.headers.get('if-modified-since')
  if (!ifModifiedSince) return false

  const parsedDate = new Date(ifModifiedSince)
  if (Number.isNaN(parsedDate.getTime())) return false

  return Math.trunc(modifiedAt.getTime() / 1000) <= Math.trunc(parsedDate.getTime() / 1000)
}

function createBody(filePath: string, request: Request, range: ByteRange | null) {
  const fileStream = createReadStream(
    /* turbopackIgnore: true */ filePath,
    range ? { start: range.start, end: range.end } : undefined
  )

  request.signal.addEventListener('abort', () => fileStream.destroy(), { once: true })

  return Readable.toWeb(fileStream) as ReadableStream<Uint8Array>
}

export async function serveUploadedLabFile(request: Request, segments: string[]) {
  try {
    const filePath = resolveUploadPath(segments)
    if (!filePath) return new Response('Invalid path', { status: 400 })

    const fileStat = await stat(/* turbopackIgnore: true */ filePath)
    if (!fileStat.isFile()) return new Response('Not found', { status: 404 })

    const entityTag = createEntityTag(fileStat.size, fileStat.mtime)
    const baseHeaders = getBaseHeaders(filePath, fileStat.size, entityTag, fileStat.mtime)

    if (isNotModified(request, entityTag, fileStat.mtime)) {
      const headers = new Headers(baseHeaders)
      headers.delete('content-length')
      return new Response(null, { status: 304, headers })
    }

    const range = parseRangeHeader(request.headers.get('range'), fileStat.size)
    if (range === 'invalid') {
      return new Response(null, {
        status: 416,
        headers: {
          ...baseHeaders,
          'content-length': '0',
          'content-range': `bytes */${fileStat.size}`,
        },
      })
    }

    const contentLength = range ? range.end - range.start + 1 : fileStat.size
    const headers = {
      ...getBaseHeaders(filePath, contentLength, entityTag, fileStat.mtime),
      ...(range ? { 'content-range': `bytes ${range.start}-${range.end}/${fileStat.size}` } : {}),
    }

    if (request.method === 'HEAD') {
      return new Response(null, { status: range ? 206 : 200, headers })
    }

    return new Response(createBody(filePath, request, range), {
      status: range ? 206 : 200,
      headers,
    })
  } catch {
    return new Response('Not found', {
      status: 404,
      headers: { 'cache-control': 'no-store' },
    })
  }
}
