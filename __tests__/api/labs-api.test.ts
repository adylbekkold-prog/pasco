import { GET as getLabsRoute } from '@/app/api/labs/route'
import { GET as getLabRoute } from '@/app/api/labs/[id]/route'
import { getLabById } from '@/lib/queries'

jest.mock('@/lib/queries', () => ({
  getLabs: jest.fn().mockResolvedValue([
    { id: 'lab-1', title: 'Demo lab', slug: 'demo-lab', is_published: true },
  ]),
  getLabById: jest.fn(),
}))

jest.mock('@/lib/locale-server', () => ({
  getCurrentLocale: jest.fn().mockResolvedValue('ru'),
}))

jest.mock('@/lib/data-provider', () => ({
  getDataProvider: jest.fn().mockReturnValue('postgresql'),
}))

const mockedGetLabById = getLabById as jest.Mock

describe('labs API routes', () => {
  beforeEach(() => {
    mockedGetLabById.mockResolvedValue({
      id: 'lab-1',
      title: 'Demo lab',
      slug: 'demo-lab',
      is_published: true,
    })
  })

  it('returns a list of labs', async () => {
    const response = await getLabsRoute()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.count).toBe(1)
    expect(body.items[0].title).toBe('Demo lab')
  })

  it('returns a single lab by id', async () => {
    const response = await getLabRoute(new Request('http://localhost/api/labs/lab-1'), {
      params: Promise.resolve({ id: 'lab-1' }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.item.id).toBe('lab-1')
  })

  it('does not expose draft labs by id on the public endpoint', async () => {
    mockedGetLabById.mockResolvedValueOnce({
      id: 'draft-lab',
      title: 'Draft lab',
      slug: 'draft-lab',
      is_published: false,
    })

    const response = await getLabRoute(new Request('http://localhost/api/labs/draft-lab'), {
      params: Promise.resolve({ id: 'draft-lab' }),
    })
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body).not.toHaveProperty('item')
  })
})
