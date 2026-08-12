const FILE_URL = '/uploads/labs/demo/reliable.spklab'

function createFetchResponse(bytes: number[]) {
  const buffer = Uint8Array.from(bytes).buffer

  return {
    ok: true,
    status: 200,
    headers: {
      get(name: string) {
        if (name.toLowerCase() === 'content-length') return String(buffer.byteLength)
        if (name.toLowerCase() === 'content-type') return 'application/octet-stream'
        return null
      },
    },
    arrayBuffer: jest.fn().mockResolvedValue(buffer),
  } as unknown as Response
}

function installSparkRuntime() {
  const writeFile = jest.fn()
  const loadWorkbook = jest.fn(() => {
    document.querySelector('#workbook')?.remove()
    const workbook = document.createElement('div')
    workbook.id = 'workbook'
    workbook.innerHTML = '<div class="workbook-page"></div>'
    document.body.appendChild(workbook)
  })

  Object.assign(window, {
    FS: { writeFile },
    viewController: {
      GetMainDiv: jest.fn(),
      LoadWorkbook: loadWorkbook,
    },
  })

  return { loadWorkbook, writeFile }
}

async function installBridge() {
  await jest.isolateModulesAsync(async () => {
    // @ts-expect-error side-effect import of a classic script
    await import('../../sparkvue-pwa/pasco-lab-bridge.js')
  })
}

function requestOpen(force = false) {
  window.dispatchEvent(new MessageEvent('message', {
    origin: window.location.origin,
    data: {
      type: 'pasco-lab:sparkvue-open',
      fileUrl: FILE_URL,
      force,
    },
  }))
}

describe('SPARKvue bridge reliability', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.resetModules()
    document.body.innerHTML = '<div id="main"></div>'

    Object.defineProperty(window, 'crossOriginIsolated', {
      configurable: true,
      value: true,
    })
    Object.defineProperty(navigator, 'usb', {
      configurable: true,
      value: {},
    })
    Object.defineProperty(navigator, 'bluetooth', {
      configurable: true,
      value: {},
    })
    Object.defineProperty(window, 'Worker', {
      configurable: true,
      value: jest.fn(),
    })
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
    Reflect.deleteProperty(window, 'FS')
    Reflect.deleteProperty(window, 'viewController')
    Reflect.deleteProperty(global, 'fetch')
  })

  it('retries a temporary failure and deduplicates repeated open messages', async () => {
    const runtime = installSparkRuntime()
    const fetchResolvers: Array<(value: Response) => void> = []
    const fetchMock = jest
      .fn()
      .mockRejectedValueOnce(new Error('temporary network failure'))
      .mockImplementationOnce(() => new Promise<Response>((resolve) => {
        fetchResolvers.push(resolve)
      }))
    Object.defineProperty(global, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true,
    })

    await installBridge()
    window.dispatchEvent(new Event('load'))
    await jest.advanceTimersByTimeAsync(0)

    requestOpen()
    await jest.advanceTimersByTimeAsync(500)
    requestOpen()
    requestOpen()

    expect(fetchMock).toHaveBeenCalledTimes(2)

    const resolveFetch = fetchResolvers[0]
    if (!resolveFetch) throw new Error('Fetch promise was not created')
    resolveFetch(createFetchResponse([5, 6, 7, 8]))
    await jest.advanceTimersByTimeAsync(250)

    expect(runtime.writeFile).toHaveBeenCalledTimes(1)
    expect(runtime.loadWorkbook).toHaveBeenCalledTimes(1)
  })

  it('opens a workbook even when sensor permission APIs are unavailable', async () => {
    const runtime = installSparkRuntime()
    Reflect.deleteProperty(navigator, 'usb')
    Reflect.deleteProperty(navigator, 'bluetooth')

    const fetchMock = jest.fn().mockResolvedValue(createFetchResponse([1, 2, 3, 4]))
    Object.defineProperty(global, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true,
    })

    await installBridge()
    requestOpen()
    await jest.advanceTimersByTimeAsync(250)

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining(FILE_URL), expect.any(Object))
    expect(runtime.writeFile).toHaveBeenCalledTimes(1)
    expect(runtime.loadWorkbook).toHaveBeenCalledTimes(1)
  })
})
