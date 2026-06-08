import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import type { NextRequest } from 'next/server'

const UPLOADS_ROOT = path.resolve(process.cwd(), 'public', 'uploads')

const CONTENT_TYPES: Record<string, string> = {
  '.avif': 'image/avif',
  '.bmp': 'image/bmp',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.json': 'application/json; charset=utf-8',
  '.m4v': 'video/mp4',
  '.mov': 'video/quicktime',
  '.mp4': 'video/mp4',
  '.ogg': 'video/ogg',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
}

function getContentType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase()
  return CONTENT_TYPES[extension] ?? 'application/octet-stream'
}

function parseRangeHeader(rangeHeader: string | null, fileSize: number) {
  if (!rangeHeader?.startsWith('bytes=')) return null

  const [startValue, endValue] = rangeHeader.replace('bytes=', '').split('-')
  const start = Number(startValue)
  const end = endValue ? Number(endValue) : fileSize - 1

  if (Number.isNaN(start) || Number.isNaN(end) || start < 0 || end >= fileSize || start > end) {
    return null
  }

  return { start, end }
}

export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/uploads/[...path]'>
) {
  const params = await ctx.params
  const safeSegments = params.path.map((segment) => decodeURIComponent(segment))
  const filePath = path.resolve(UPLOADS_ROOT, ...safeSegments)

  if (!filePath.startsWith(UPLOADS_ROOT)) {
    return new Response('Invalid path', { status: 400 })
  }

  try {
    const fileStat = await stat(filePath)
    if (!fileStat.isFile()) {
      return new Response('Not found', { status: 404 })
    }

    const fileBuffer = await readFile(filePath)
    const contentType = getContentType(filePath)
    const range = parseRangeHeader(request.headers.get('range'), fileBuffer.byteLength)

    if (range) {
      const chunk = fileBuffer.subarray(range.start, range.end + 1)

      return new Response(chunk, {
        status: 206,
        headers: {
          'accept-ranges': 'bytes',
          'content-length': String(chunk.byteLength),
          'content-range': `bytes ${range.start}-${range.end}/${fileBuffer.byteLength}`,
          'content-type': contentType,
          'cache-control': 'public, max-age=31536000, immutable',
        },
      })
    }

    return new Response(fileBuffer, {
      headers: {
        'accept-ranges': 'bytes',
        'content-length': String(fileBuffer.byteLength),
        'content-type': contentType,
        'cache-control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
