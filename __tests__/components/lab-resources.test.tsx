import { fireEvent, render, screen, within } from '@testing-library/react'
import LabResources from '@/components/LabResources'
import type { Resource } from '@/types'

jest.mock('@/components/PdfViewer', () => ({
  __esModule: true,
  default: ({ src, title }: { src: string; title: string }) => (
    <div data-testid="pdf-viewer" data-src={src} data-title={title} />
  ),
}))

const resources: Resource[] = [
  {
    id: 'pdf-1',
    lab_id: 'lab-1',
    resource_type: 'pdf',
    title: 'Первый PDF',
    url: '/uploads/labs/demo/first.pdf',
    file_size: 1024,
    sort_order: 0,
  },
  {
    id: 'pdf-2',
    lab_id: 'lab-1',
    resource_type: 'pdf',
    title: 'Второй PDF',
    url: '/uploads/labs/demo/second.pdf',
    file_size: 2048,
    sort_order: 1,
  },
]

const sparkLabResource: Resource = {
  id: 'spark-1',
  lab_id: 'lab-1',
  resource_type: 'worksheet',
  title: 'Кинетическая энергия.spklab',
  url: '/uploads/labs/demo/kinetic-energy.spklab',
  file_size: 4096,
  sort_order: 2,
}

describe('LabResources', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'isSecureContext', {
      configurable: true,
      value: true,
    })
    Object.defineProperty(window, 'crossOriginIsolated', {
      configurable: true,
      value: true,
    })
    Object.defineProperty(globalThis, 'SharedArrayBuffer', {
      configurable: true,
      value: ArrayBuffer,
    })
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: jest.fn(),
    })
    Object.defineProperty(globalThis, 'Worker', {
      configurable: true,
      value: class MockWorker {},
    })
    window.history.pushState({}, '', '/labs/demo')
  })

  it('keeps only one material viewer open at a time', () => {
    const { container } = render(<LabResources resources={resources} locale="ru" />)
    const firstCard = screen.getByRole('heading', { name: 'Первый PDF' }).closest('article')
    const secondCard = screen.getByRole('heading', { name: 'Второй PDF' }).closest('article')

    expect(firstCard).not.toBeNull()
    expect(secondCard).not.toBeNull()
    expect(container.querySelectorAll('iframe')).toHaveLength(0)

    fireEvent.click(within(firstCard!).getByRole('button', { name: 'Открыть здесь' }))

    expect(container.querySelectorAll('iframe')).toHaveLength(0)
    expect(screen.getByTestId('pdf-viewer')).toHaveAttribute('data-src', resources[0].url)
    expect(container.querySelector('#sparkvue-resource-viewer')).toBeNull()

    fireEvent.click(within(secondCard!).getByRole('button', { name: 'Открыть здесь' }))

    expect(container.querySelectorAll('iframe')).toHaveLength(0)
    expect(screen.getByTestId('pdf-viewer')).toHaveAttribute('data-src', resources[1].url)

    fireEvent.click(screen.getByRole('button', { name: 'Закрыть просмотр материала' }))

    expect(container.querySelectorAll('iframe')).toHaveLength(0)
    expect(screen.queryByTestId('pdf-viewer')).toBeNull()
  })

  it('opens a .spklab resource in a separate SPARKvue window', () => {
    const { container } = render(<LabResources resources={[sparkLabResource]} locale="ru" />)

    const openLink = screen.getByRole('link', { name: 'Открыть в SPARKvue' })

    expect(openLink).toHaveAttribute(
      'href',
      '/sparkvue/index.html?file=%2Fuploads%2Flabs%2Fdemo%2Fkinetic-energy.spklab'
    )
    expect(openLink).toHaveAttribute('target', '_blank')
    expect(openLink.getAttribute('rel')).toContain('noopener')
    expect(container.querySelector('#sparkvue-resource-viewer')).toBeNull()
    expect(container.querySelector('#material-resource-viewer')).toBeNull()
  })

  it('keeps the SPARKvue launch link available after client-side navigation', () => {
    Object.defineProperty(window, 'crossOriginIsolated', {
      configurable: true,
      value: false,
    })

    const { container } = render(<LabResources resources={[sparkLabResource]} locale="ru" />)
    const launchHref = '/sparkvue/index.html?file=%2Fuploads%2Flabs%2Fdemo%2Fkinetic-energy.spklab'
    const launchLink = Array.from(container.querySelectorAll('a')).find(
      (link) => link.getAttribute('href') === launchHref
    )

    expect(launchLink).not.toBeNull()
    expect(launchLink).toHaveAttribute('target', '_blank')
    expect(container.querySelector('#sparkvue-resource-viewer')).toBeNull()
    expect(container.querySelector('#material-resource-viewer')).toBeNull()
  })

  it('keeps an open PDF in place when launching SPARKvue separately', () => {
    const { container } = render(
      <LabResources resources={[...resources, sparkLabResource]} locale="ru" />
    )
    const firstCard = screen.getByRole('heading', { name: 'Первый PDF' }).closest('article')

    fireEvent.click(within(firstCard!).getByRole('button', { name: 'Открыть здесь' }))

    expect(screen.getByTestId('pdf-viewer')).toHaveAttribute('data-src', resources[0].url)
    expect(container.querySelectorAll('iframe')).toHaveLength(0)

    expect(screen.getByRole('link', { name: 'Открыть в SPARKvue' })).toHaveAttribute(
      'target',
      '_blank'
    )
    expect(container.querySelector('#sparkvue-resource-viewer')).toBeNull()
    expect(screen.getByTestId('pdf-viewer')).toHaveAttribute('data-src', resources[0].url)
    expect(container.querySelectorAll('iframe')).toHaveLength(0)
  })

  it('uses compact accessible actions and allows hiding the resource list', () => {
    render(<LabResources resources={resources} locale="ru" />)
    const firstCard = screen.getByRole('heading', { name: 'Первый PDF' }).closest('article')

    expect(within(firstCard!).getByRole('link', { name: 'Открыть отдельно' })).toHaveAttribute(
      'href',
      resources[0].url
    )

    fireEvent.click(screen.getByRole('button', { name: 'Скрыть список' }))
    expect(screen.queryByRole('heading', { name: 'Первый PDF' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Показать список' }))
    expect(screen.getByRole('heading', { name: 'Первый PDF' })).toBeInTheDocument()
  })

  it('blocks unsafe resource links before rendering viewers or downloads', () => {
    const unsafeResource: Resource = {
      id: 'unsafe-pdf',
      lab_id: 'lab-1',
      resource_type: 'pdf',
      title: 'Небезопасный PDF',
      url: 'javascript:alert(1).pdf',
      file_size: null,
      sort_order: 0,
    }
    const { container } = render(<LabResources resources={[unsafeResource]} locale="ru" />)

    expect(screen.getByText('Небезопасная ссылка заблокирована.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Открыть здесь' })).toBeNull()
    expect(screen.queryByRole('link')).toBeNull()
    expect(container.querySelector('iframe')).toBeNull()
  })

  it('explains the HTTPS requirement instead of showing an unsupported browser', () => {
    Object.defineProperty(window, 'isSecureContext', {
      configurable: true,
      value: false,
    })

    const sparkLab: Resource = {
      id: 'spark-insecure',
      lab_id: 'lab-1',
      resource_type: 'worksheet',
      title: 'Лаборатория.spklab',
      url: '/uploads/labs/demo/lab.spklab',
      file_size: null,
      sort_order: 0,
    }
    const { container } = render(<LabResources resources={[sparkLab]} locale="ru" />)

    fireEvent.click(screen.getByRole('button', { name: 'Нужен HTTPS' }))

    expect(screen.getByText('SPARKvue требует безопасное соединение')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Открыть через HTTPS' })).toHaveAttribute(
      'href',
      'https://localhost/labs/demo'
    )
    expect(container.querySelector('#sparkvue-resource-viewer iframe')).toBeNull()

    Object.defineProperty(window, 'isSecureContext', {
      configurable: true,
      value: undefined,
    })
  })
})
