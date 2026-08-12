import { serveSparkVueAsset } from '@/lib/sparkvue-files'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const params = await ctx.params
  const requestedPath =
    params.path.length === 1 && ['index.html', 'index.htm'].includes(params.path[0].toLowerCase())
      ? ['WhatsNew_kkz.htm']
      : params.path

  return serveSparkVueAsset(request, ['whatsnew', ...requestedPath])
}

export const HEAD = GET
