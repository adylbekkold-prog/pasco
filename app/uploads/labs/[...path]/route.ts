import { serveUploadedLabFile } from '@/lib/uploaded-lab-files'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface UploadRouteContext {
  params: Promise<{ path: string[] }>
}

export async function GET(request: Request, context: UploadRouteContext) {
  const params = await context.params
  return serveUploadedLabFile(request, params.path)
}

export async function HEAD(request: Request, context: UploadRouteContext) {
  const params = await context.params
  return serveUploadedLabFile(request, params.path)
}
