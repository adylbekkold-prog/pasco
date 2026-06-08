import { NextResponse } from 'next/server'
import { readdir, stat } from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

interface PhotoNode {
  name: string
  path: string
  isDirectory: boolean
  children?: PhotoNode[]
}

interface BrowseResponse {
  success: boolean
  data?: PhotoNode
  error?: string
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
const LAB_PHOTOS_ROOT = path.join(process.cwd(), 'lab_photos')

async function isImageFile(filePath: string): Promise<boolean> {
  try {
    const stats = await stat(filePath)
    if (!stats.isFile()) return false
    const ext = path.extname(filePath).toLowerCase()
    return IMAGE_EXTENSIONS.includes(ext)
  } catch {
    return false
  }
}

async function buildPhotoTree(
  dirPath: string,
  basePath: string = LAB_PHOTOS_ROOT
): Promise<PhotoNode> {
  const dirName = path.basename(dirPath)
  const node: PhotoNode = {
    name: dirName,
    path: path.relative(basePath, dirPath),
    isDirectory: true,
    children: [],
  }

  try {
    const entries = await readdir(dirPath)
    const sortedEntries = entries.sort()

    for (const entry of sortedEntries) {
      const fullPath = path.join(dirPath, entry)

      try {
        const stats = await stat(fullPath)

        if (stats.isDirectory()) {
          const subNode = await buildPhotoTree(fullPath, basePath)
          node.children?.push(subNode)
        } else if (await isImageFile(fullPath)) {
          node.children?.push({
            name: entry,
            path: path.relative(basePath, fullPath),
            isDirectory: false,
          })
        }
      } catch {
        // Skip files that can't be read
        continue
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error)
  }

  return node
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const subPath = searchParams.get('path')

    let targetPath = LAB_PHOTOS_ROOT

    if (subPath) {
      const cleanPath = subPath.replace(/\.\./g, '').replace(/\\/g, '/')
      targetPath = path.join(LAB_PHOTOS_ROOT, cleanPath)

      // Security: ensure the path is within LAB_PHOTOS_ROOT
      if (!targetPath.startsWith(LAB_PHOTOS_ROOT)) {
        return NextResponse.json<BrowseResponse>(
          { success: false, error: 'Invalid path' },
          { status: 400 }
        )
      }
    }

    const photoTree = await buildPhotoTree(targetPath)
    return NextResponse.json<BrowseResponse>({ success: true, data: photoTree })
  } catch (error) {
    console.error('Error browsing lab photos:', error)
    return NextResponse.json<BrowseResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
