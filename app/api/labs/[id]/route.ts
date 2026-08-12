import { getDataProvider } from '@/lib/data-provider'
import { getCurrentLocale } from '@/lib/locale-server'
import { getLabById } from '@/lib/queries'

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

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const locale = await getCurrentLocale()
    const provider = getDataProvider()
    const lab = await getLabById(id, locale)

    return jsonResponse({ provider, item: lab })
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Не удалось загрузить лабораторию' },
      { status: 404 }
    )
  }
}
