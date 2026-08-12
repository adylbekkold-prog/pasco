type SparkOfflineGuardWindow = Window & typeof globalThis & {
  __sparkOfflineGuard?: {
    getBlockedRequests: () => Array<{ kind: string; url: string }>
    isBlockedNetworkUrl: (value: unknown) => boolean
  }
  __sparkOfflineGuardInstalled?: boolean
}

const guardedWindow = window as SparkOfflineGuardWindow

async function installGuard() {
  jest.resetModules()
  Reflect.deleteProperty(guardedWindow, '__sparkOfflineGuard')
  Reflect.deleteProperty(guardedWindow, '__sparkOfflineGuardInstalled')

  // The SPARKvue guard is a classic browser script loaded for side effects.
  // It intentionally has no ESM exports because production loads it with <script>.
  // @ts-expect-error side-effect import of a classic script
  await import('../../sparkvue-pwa/javascripts/offline_guard.js')
}

describe('SPARKvue offline guard', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    Reflect.deleteProperty(guardedWindow, '__sparkOfflineGuard')
    Reflect.deleteProperty(guardedWindow, '__sparkOfflineGuardInstalled')
  })

  it('allows same-origin fetches and blocks external fetches before the network', async () => {
    const fetchMock = jest.fn().mockResolvedValue(new Response('ok'))
    Object.defineProperty(window, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true,
    })

    await installGuard()

    await expect(window.fetch('/sparkvue/spark.wasm')).resolves.toBeInstanceOf(Response)
    await expect(window.fetch('https://updates.example.test/sparkvue.json')).rejects.toMatchObject({
      name: 'SecurityError',
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(guardedWindow.__sparkOfflineGuard?.getBlockedRequests()).toEqual([
      expect.objectContaining({
        kind: 'fetch',
        url: 'https://updates.example.test/sparkvue.json',
      }),
    ])
  })

  it('blocks beacon, XHR, WebSocket, and service worker update paths', async () => {
    const sendBeaconMock = jest.fn().mockReturnValue(true)
    const unregisterMock = jest.fn().mockResolvedValue(true)
    const nativeRegisterMock = jest.fn()

    Object.defineProperty(navigator, 'sendBeacon', {
      configurable: true,
      value: sendBeaconMock,
    })
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        getRegistrations: jest.fn().mockResolvedValue([{ unregister: unregisterMock }]),
        register: nativeRegisterMock,
      },
    })

    await installGuard()

    expect(navigator.sendBeacon('https://analytics.example.test/collect')).toBe(false)
    expect(sendBeaconMock).not.toHaveBeenCalled()

    const xhr = new XMLHttpRequest()
    const xhrError = jest.fn()
    xhr.addEventListener('error', xhrError)
    xhr.open('GET', 'https://cloud.example.test/config.json')
    xhr.send()
    await new Promise((resolve) => window.setTimeout(resolve, 0))
    expect(xhrError).toHaveBeenCalledTimes(1)

    expect(() => new WebSocket('wss://remote.example.test/live')).toThrow(/offline mode/)
    await expect(navigator.serviceWorker.register('/sparkvue/sw.js')).resolves.toMatchObject({
      scope: window.location.origin + '/',
    })
    expect(nativeRegisterMock).not.toHaveBeenCalled()

    expect(guardedWindow.__sparkOfflineGuard?.getBlockedRequests()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'sendBeacon' }),
        expect.objectContaining({ kind: 'XMLHttpRequest' }),
        expect.objectContaining({ kind: 'WebSocket' }),
        expect.objectContaining({ kind: 'serviceWorker.register' }),
      ])
    )
  })
})
