import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Polyfills for Web APIs
if (typeof global.Request === 'undefined') {
  class FakeRequest {
    constructor(url, options) {
      this.url = url
      this.method = options?.method || 'GET'
      this.headers = options?.headers || new Map()
    }
  }
  global.Request = FakeRequest
}

if (typeof global.Response === 'undefined') {
  class FakeResponse {
    constructor(body, options) {
      this.body = body
      this.status = options?.status || 200
      this.statusText = options?.statusText || 'OK'
      this.headers = options?.headers || new Map()
    }
  }
  global.Response = FakeResponse
}

// Global test setup
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Suppress console errors during tests 
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Not implemented') ||
        args[0].includes('useLayoutEffect') ||
        args[0].includes('Cannot find module'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
