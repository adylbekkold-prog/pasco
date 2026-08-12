import { GET } from '@/app/api/locale/open/route'
import { localeCookieName } from '@/lib/locale'

describe('GET /api/locale/open', () => {
  it('sets the requested locale and redirects inside the portal', async () => {
    const response = await GET(
      new Request('http://localhost:3000/api/locale/open?locale=ky&redirect=%2Flabs%2Fdemo')
    )

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/labs/demo')
    expect(response.headers.get('set-cookie')).toContain(`${localeCookieName}=ky`)
  })

  it('blocks external redirect targets', async () => {
    const response = await GET(
      new Request('http://localhost:3000/api/locale/open?locale=ru&redirect=%2F%2Fevil.example')
    )

    expect(response.headers.get('location')).toBe('http://localhost:3000/')
  })

  it('uses the real LAN host instead of the server bind address', async () => {
    const response = await GET(
      new Request('http://0.0.0.0:3000/api/locale/open?locale=ky&redirect=%2Flabs%2Fdemo', {
        headers: new Headers({ host: '192.168.31.203:3000' }),
      })
    )

    expect(response.headers.get('location')).toBe('http://192.168.31.203:3000/labs/demo')
  })
})
