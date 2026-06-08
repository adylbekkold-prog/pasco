// Test file for lab-photos API endpoint
// Run: curl http://localhost:3000/api/lab-photos

/**
 * Expected response format:
 * {
 *   "success": true,
 *   "data": {
 *     "name": "lab_photos",
 *     "path": ".",
 *     "isDirectory": true,
 *     "children": [
 *       {
 *         "name": "Физика",
 *         "path": "Физика",
 *         "isDirectory": true,
 *         "children": [
 *           {
 *             "name": "Комплект физика-механика",
 *             "path": "Физика/Комплект физика-механика",
 *             "isDirectory": true,
 *             "children": [
 *               {
 *                 "name": "photo1.png",
 *                 "path": "Физика/Комплект физика-механика/photo1.png",
 *                 "isDirectory": false
 *               },
 *               ...
 *             ]
 *           },
 *           ...
 *         ]
 *       },
 *       {
 *         "name": "Химия",
 *         "path": "Химия",
 *         "isDirectory": true,
 *         "children": [...]
 *       },
 *       {
 *         "name": "Биология",
 *         "path": "Биология",
 *         "isDirectory": true,
 *         "children": [...]
 *       }
 *     ]
 *   }
 * }
 */

// Example test cases:

// 1. Get root structure
// GET /api/lab-photos
// Returns all subjects and their categories

// 2. Get specific path
// GET /api/lab-photos?path=Физика
// Returns contents of Physics folder

// 3. Get nested path
// GET /api/lab-photos?path=Физика/Комплект%20физика-механика
// Returns all photos in Physics > Mechanics kit

export const testCases = [
  {
    name: 'Get root photo structure',
    endpoint: '/api/lab-photos',
    method: 'GET',
    expectedFields: ['success', 'data'],
  },
  {
    name: 'Get Physics folder contents',
    endpoint: '/api/lab-photos?path=Физика',
    method: 'GET',
    expectedFields: ['success', 'data'],
  },
  {
    name: 'Security test - block path traversal',
    endpoint: '/api/lab-photos?path=../../etc/passwd',
    method: 'GET',
    shouldFail: true,
  },
]

console.log('Lab Photos API Test Cases')
console.log('========================')
console.log()
console.log('1. Start dev server: npm run dev')
console.log('2. In another terminal, run: curl http://localhost:3000/api/lab-photos')
console.log('3. Or use browser: http://localhost:3000/api/lab-photos')
console.log()
console.log('Expected response structure:')
console.log('- success: boolean')
console.log('- data: PhotoNode tree')
console.log('- error: string (if success is false)')
console.log()
console.log('PhotoNode structure:')
console.log('- name: string (folder or file name)')
console.log('- path: string (relative path from lab_photos)')
console.log('- isDirectory: boolean')
console.log('- children?: PhotoNode[] (only if isDirectory is true)')

test.todo('manual lab-photos API smoke check')
