import { getDataProvider } from '@/lib/data-provider'
import { getCurrentLocale } from '@/lib/locale-server'
import { getLabs } from '@/lib/queries'

function jsonResponse(payload: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('content-type', 'application/json')

  const response = new Response(JSON.stringify(payload), {
    ...init,
    headers,
  }) as Response & { json: () => Promise<unknown> }

  response.json = async () => payload

  return response
}

export async function GET() {
  try {
    const locale = await getCurrentLocale()
    const provider = getDataProvider()
    const labs = await getLabs({ adminMode: false, locale })

    return jsonResponse({
      provider,
      count: labs.length,
      items: labs,
    })
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Не удалось загрузить лаборатории' },
      { status: 500 }
    )
  }
}
