import { promises as fs } from 'fs'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

const LAB_PHOTOS_DIR = path.join(process.cwd(), 'lab_photos')

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const filePath = searchParams.get('path')

  if (!filePath) {
    return NextResponse.json(
      { error: 'File path is required' },
      { status: 400 }
    )
  }

  const root = path.resolve(LAB_PHOTOS_DIR)
  // Resolve against the root, then verify with path.relative — startsWith is
  // unsafe because path.join(root, '/etc/passwd') collapses to root/etc/passwd
  // and would pass a naive prefix check.
  const resolvedPath = path.resolve(root, decodeURIComponent(filePath))
  const relative = path.relative(root, resolvedPath)
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 403 })
  }

  try {
    const fileBuffer = await fs.readFile(resolvedPath)
    
    // Determine the content type based on file extension
    const ext = path.extname(resolvedPath).toLowerCase()
    const contentType = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    }[ext] || 'image/png'

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error) {
    console.error('Error reading image:', error)
    return NextResponse.json(
      { error: 'Failed to read image' },
      { status: 404 }
    )
  }
}
