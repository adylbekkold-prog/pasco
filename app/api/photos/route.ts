import { promises as fs } from 'fs'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

const LAB_PHOTOS_DIR = path.join(process.cwd(), 'lab_photos')

// Mapping between equipment names and actual folder names in lab_photos
const EQUIPMENT_FOLDER_MAP: Record<string, string> = {
  // Russian equipment names
  'Комплект по механике': 'Физика/Комплект физика-механика',
  'Комплект по оптике': 'Физика/Комплект физика-оптика',
  'Комплект по электричеству и магнетизму': 'Физика/Комплект физика-мегнетизм',
  'Комплект по жидкостям': 'Физика/Комплект физика - жидкость',
  'Комплект по волнам и звуку': 'Физика/Комплект физика-волны и звук',
  'Стартовый набор по химии': 'Химия',
  'Стартовый набор по биологии': 'Биология',
  // Kyrgyz equipment names
  'Механика комплекти': 'Физика/Комплект физика-механика',
  'Оптика комплекти': 'Физика/Комплект физика-оптика',
  'Электр жана магнетизм комплекти': 'Физика/Комплект физика-мегнетизм',
  'Суюктуктар комплекти': 'Физика/Комплект физика - жидкость',
  'Толкундар жана үн комплекти': 'Физика/Комплект физика-волны и звук',
  'Химия боюнча баштапкы комплект': 'Химия',
  'Биология боюнча баштапкы комплект': 'Биология',
}

export async function GET(request: NextRequest) {
  const equipmentName = request.nextUrl.searchParams.get('equipment')

  if (!equipmentName) {
    return NextResponse.json(
      { error: 'Equipment name is required' },
      { status: 400 }
    )
  }

  try {
    // Get the actual folder name from the mapping
    const folderName = EQUIPMENT_FOLDER_MAP[equipmentName] || equipmentName
    
    // Try to find the folder - first check for exact match, then check with Cyrillic variations
    let equipmentPath = path.join(LAB_PHOTOS_DIR, folderName)
    
    try {
      await fs.access(equipmentPath)
    } catch {
      // If the mapped folder doesn't exist, try searching in the physics folder first
      const physicsPath = path.join(LAB_PHOTOS_DIR, 'Физика')
      const physicsContents = await fs.readdir(physicsPath, { withFileTypes: true })
      
      // Find folder that contains the equipment name (fuzzy match)
      const matchedFolder = physicsContents.find(
        (item) => item.isDirectory() && 
        item.name.toLowerCase().includes(
          equipmentName.toLowerCase().slice(0, 5) // Use first 5 chars for fuzzy matching
        )
      )
      
      if (matchedFolder) {
        equipmentPath = path.join(physicsPath, matchedFolder.name)
      } else {
        // Try the original folder name from all subjects
        const allDirs = await fs.readdir(LAB_PHOTOS_DIR, { withFileTypes: true })
        for (const dir of allDirs) {
          if (!dir.isDirectory()) continue
          const subPath = path.join(LAB_PHOTOS_DIR, dir.name)
          const subContents = await fs.readdir(subPath, { withFileTypes: true })
          const found = subContents.find((item) => item.isDirectory() && item.name === folderName)
          if (found) {
            equipmentPath = path.join(subPath, found.name)
            break
          }
        }
      }
    }

    const files = await fs.readdir(equipmentPath, { withFileTypes: true })

    const imageFiles = files
      .filter((file) => 
        file.isFile() && /\.(png|jpg|jpeg|gif|webp)$/i.test(file.name)
      )
      .map((file) => {
        const relativePath = path.relative(LAB_PHOTOS_DIR, path.join(equipmentPath, file.name)).replace(/\\/g, '/')
        return {
          name: file.name,
          path: `/api/photos/image?path=${encodeURIComponent(relativePath)}`,
          relativePath: relativePath, // Store the actual relative path for database storage
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({ photos: imageFiles })
  } catch (error) {
    console.error('Error reading photos:', error)
    return NextResponse.json(
      { error: 'Failed to read photos', photos: [] },
      { status: 200 }
    )
  }
}
