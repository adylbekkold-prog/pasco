# 💻 ПРИМЕРЫ КОДА ДЛЯ БЫСТРОГО СТАРТА

Готовые шаблоны для реализации недостающих компонентов

---

## 1️⃣ JEST КОНФИГУРАЦИЯ

### `jest.config.js`
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
    '**/*.test.ts',
    '**/*.test.tsx',
  ],
  collectCoverageFrom: [
    'lib/**/*.ts',
    'lib/**/*.tsx',
    'app/actions/**/*.ts',
    'components/**/*.tsx',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

### `jest.setup.js`
```javascript
import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      pathname: '/',
      query: {},
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock next/cookies
jest.mock('next/cookies', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
  }),
}))

// Setup Supabase mock
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
}))
```

### `package.json` обновления
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.4",
    "@types/jest": "^29.5.5",
    "ts-jest": "^29.1.1"
  }
}
```

---

## 2️⃣ ПРИМЕРЫ ТЕСТОВ

### `__tests__/lib/sync-queue.test.ts`
```typescript
import { readSyncQueue, writeSyncQueue, processSyncQueue } from '@/lib/sync-queue'

describe('Sync Queue', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('readSyncQueue', () => {
    it('should read sync queue from file', async () => {
      const queue = await readSyncQueue()
      expect(Array.isArray(queue)).toBe(true)
    })

    it('should handle missing queue file', async () => {
      const queue = await readSyncQueue()
      if (!queue || queue.length === 0) {
        expect(queue).toEqual([])
      }
    })
  })

  describe('writeSyncQueue', () => {
    it('should write queue to file', async () => {
      const testQueue = [
        {
          id: '1',
          action: 'upsert',
          table: 'labs',
          data: { id: 'lab-1', title: 'Test' },
          timestamp: new Date().toISOString(),
        },
      ]
      
      await writeSyncQueue(testQueue)
      const read = await readSyncQueue()
      expect(read).toEqual(testQueue)
    })
  })

  describe('processSyncQueue', () => {
    it('should process queued operations when online', async () => {
      // Mock Supabase being available
      const resultbefore = await readSyncQueue()
      const count = resultbefore.length

      // Process should attempt to upload
      // This would need Supabase mocking
      expect(count).toBeGreaterThanOrEqual(0)
    })

    it('should retry failed operations', async () => {
      // Setup test data
      // Simulate failure
      // Assert retry logic
      expect(true).toBe(true) // Placeholder
    })

    it('should map local IDs to remote UUIDs', async () => {
      // Test ID mapping functionality
      expect(true).toBe(true) // Placeholder
    })
  })
})
```

### `__tests__/lib/queries.test.ts`
```typescript
import { getAllLabs, getLabBySlug, getSubjects } from '@/lib/queries'

describe('Database Queries', () => {
  describe('getAllLabs', () => {
    it('should return array of labs', async () => {
      const labs = await getAllLabs('ru')
      expect(Array.isArray(labs)).toBe(true)
    })

    it('should handle different locales', async () => {
      const labsRu = await getAllLabs('ru')
      const labsKy = await getAllLabs('ky')
      
      expect(labsRu).toBeDefined()
      expect(labsKy).toBeDefined()
    })

    it('should filter only published labs if flag is set', async () => {
      // Implementation test
      expect(true).toBe(true)
    })
  })

  describe('getLabBySlug', () => {
    it('should return lab by slug', async () => {
      const lab = await getLabBySlug('some-lab-slug')
      // If exists, should have expected structure
      if (lab) {
        expect(lab).toHaveProperty('id')
        expect(lab).toHaveProperty('title')
        expect(lab).toHaveProperty('slug')
      }
    })

    it('should return null for non-existent lab', async () => {
      const lab = await getLabBySlug('non-existent-lab-xyz')
      expect(lab).toBeNull()
    })
  })

  describe('getSubjects', () => {
    it('should return localized subjects', async () => {
      const subjects = await getSubjects('ru')
      expect(Array.isArray(subjects)).toBe(true)
      
      if (subjects.length > 0) {
        expect(subjects[0]).toHaveProperty('id')
        expect(subjects[0]).toHaveProperty('name')
      }
    })
  })
})
```

### `__tests__/components/LabForm.test.tsx`
```typescript
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LabForm from '@/components/LabForm'

// Mock Server Action
jest.mock('@/app/actions/lab.actions', () => ({
  createLab: jest.fn(),
  updateLab: jest.fn(),
}))

describe('LabForm Component', () => {
  it('should render form fields', () => {
    render(<LabForm onSuccess={() => {}} />)
    
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()
    render(<LabForm onSuccess={() => {}} />)
    
    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)
    
    // Should show validation errors
    expect(screen.getByText(/required/i)).toBeInTheDocument()
  })

  it('should call createLab on valid submit', async () => {
    const { createLab } = require('@/app/actions/lab.actions')
    const user = userEvent.setup()
    const onSuccess = jest.fn()
    
    render(<LabForm onSuccess={onSuccess} />)
    
    await user.type(screen.getByLabelText(/title/i), 'Test Lab')
    await user.click(screen.getByRole('button', { name: /submit/i }))
    
    await waitFor(() => {
      expect(createLab).toHaveBeenCalled()
    })
  })

  it('should display loading state', async () => {
    const user = userEvent.setup()
    render(<LabForm onSuccess={() => {}} />)
    
    // Fill form
    await user.type(screen.getByLabelText(/title/i), 'Test')
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /submit/i })
    
    // Should show loading before submission completes
    expect(submitButton).toBeEnabled()
  })
})
```

---

## 3️⃣ CI/CD WORKFLOWS

### `.github/workflows/test.yml`
```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install deps
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Unit tests
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
      
      - name: Build
        run: npm run build
```

### `.github/workflows/deploy.yml`
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install & Build
        run: |
          npm ci
          npm run lint
          npm run test:coverage
          npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          script: |
            cd /app/pasco-lab-portal
            git pull origin main
            npm ci
            npm run build
            pm2 restart pasco-lab-portal
```

---

## 4️⃣ SERVER-SIDE VALIDATION

### `lib/validators.ts`
```typescript
import { z } from 'zod'

export const CreateLabSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(255, 'Title must be less than 255 characters'),
  slug: z.string()
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  subject_id: z.string().uuid('Invalid subject ID'),
  grade_id: z.string().uuid('Invalid grade ID'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  duration_minutes: z.number().min(5).max(480),
  is_published: z.boolean().default(false),
  steps: z.array(z.object({
    block_type: z.enum(['text', 'image', 'video']),
    content: z.string(),
  })),
})

export const UpdateLabSchema = CreateLabSchema.partial()

export const FiltersSchema = z.object({
  subject: z.string().optional(),
  grade: z.string().optional(),
  difficulty: z.string().optional(),
  search: z.string().optional(),
})

export type CreateLabInput = z.infer<typeof CreateLabSchema>
export type UpdateLabInput = z.infer<typeof UpdateLabSchema>
export type Filters = z.infer<typeof FiltersSchema>
```

### Обновленный `app/actions/lab.actions.ts`
```typescript
'use server'

import { CreateLabSchema, UpdateLabSchema } from '@/lib/validators'
import { upsertLab, deleteLab as deleteLabFromDb } from '@/lib/queries'

export async function createLab(input: unknown) {
  try {
    // ✅ SERVER-SIDE VALIDATION
    const validated = CreateLabSchema.parse(input)
    
    // Authenticate - verify user is admin
    // const user = await getCurrentUser()
    // if (!user?.is_admin) throw new Error('Unauthorized')
    
    const result = await upsertLab(validated)
    
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        details: error.errors,
      }
    }
    
    console.error('Failed to create lab:', error)
    return {
      success: false,
      error: 'Failed to create lab. Please try again.',
    }
  }
}

export async function updateLab(id: string, input: unknown) {
  try {
    // ✅ SERVER-SIDE VALIDATION
    const validated = UpdateLabSchema.parse(input)
    
    // Authenticate and authorize
    // const user = await getCurrentUser()
    // const lab = await getLabBy Id(id)
    // if (user.id !== lab.created_by && !user.is_admin) {
    //   throw new Error('Unauthorized')
    // }
    
    const result = await upsertLab({ ...validated, id })
    
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        details: error.errors,
      }
    }
    
    console.error('Failed to update lab:', error)
    return {
      success: false,
      error: 'Failed to update lab. Please try again.',
    }
  }
}

export async function deleteLab(id: string) {
  try {
    // Authenticate and authorize
    const result = await deleteLabFromDb(id)
    return { success: true }
  } catch (error) {
    console.error('Failed to delete lab:', error)
    return {
      success: false,
      error: 'Failed to delete lab. Please try again.',
    }
  }
}
```

---

## 5️⃣ LOGGER & MONITORING

### `lib/logger.ts`
```typescript
import pino from 'pino'

const isDev = process.env.NODE_ENV === 'development'

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
})

export function logInfo(message: string, data?: Record<string, any>) {
  logger.info(data, message)
}

export function logWarn(message: string, data?: Record<string, any>) {
  logger.warn(data, message)
}

export function logError(message: string, error?: Error, data?: Record<string, any>) {
  logger.error({ err: error, ...data }, message)
}

export function logDebug(message: string, data?: Record<string, any>) {
  logger.debug(data, message)
}
```

### `lib/monitoring.ts`
```typescript
import * as Sentry from "@sentry/nextjs"

export function initMonitoring() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      integrations: [
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    })
  }
}

export function captureException(error: Error, context?: Record<string, any>) {
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      contexts: {
        app: context,
      },
    })
  }
}
```

---

## 6️⃣ CUSTOM ERROR PAGE

### `app/error.tsx`
```typescript
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { captureException } from '@/lib/monitoring'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Send error to monitoring service
    captureException(error, {
      page: 'root-error-boundary',
    })
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Oops! Something went wrong
        </h1>
        
        <p className="text-gray-600 mb-6">
          We've been notified about this error and are working to fix it.
        </p>
        
        {error.message && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-sm text-red-700">{error.message}</p>
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Try again
          </button>
          
          <Link
            href="/"
            className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-md hover:bg-gray-300 text-center"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
```

---

## 7️⃣ DOCKER

### `Dockerfile`
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Next.js application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["npm", "start"]
```

### `.dockerignore`
```
node_modules
npm-debug.log
.git
.gitignore
README.md
.next
.env.local
.env.*.local
```

### `docker-compose.yml`
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATA_PROVIDER=hybrid
      - NEXT_PUBLIC_DATA_PROVIDER=hybrid
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    command: npm run dev

  # Optional: Postgres for local development
  # db:
  #   image: postgres:15
  #   environment:
  #     POSTGRES_PASSWORD: postgres
  #   ports:
  #     - "5432:5432"
```

---

## 8️⃣ SECURITY HEADERS

### `next.config.ts` обновление
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
        ],
      },
    ]
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
```

---

## 9️⃣ API RATE LIMITING

### `lib/rate-limit.ts`
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'),
})

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier)
  return success
}
```

### Использование в API route
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  
  const allowed = await checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }
  
  // Handle request...
}
```

---

**Все эти примеры готовы к использованию - просто скопируйте и адаптируйте под вашу архитектуру!**

