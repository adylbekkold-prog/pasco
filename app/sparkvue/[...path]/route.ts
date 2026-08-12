import { serveSparkVueAsset } from '@/lib/sparkvue-files'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const params = await ctx.params
  return serveSparkVueAsset(request, params.path)
}

export const HEAD = GET
