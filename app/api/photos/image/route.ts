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

  try {
    const fullPath = path.join(LAB_PHOTOS_DIR, decodeURIComponent(filePath))
    
    // Security: ensure the path is within lab_photos directory
    const resolvedPath = path.resolve(fullPath)
    if (!resolvedPath.startsWith(path.resolve(LAB_PHOTOS_DIR))) {
      return NextResponse.json(
        { error: 'Invalid path' },
        { status: 403 }
      )
    }

    const fileBuffer = await fs.readFile(fullPath)
    
    // Determine the content type based on file extension
    const ext = path.extname(fullPath).toLowerCase()
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
