import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isAllowedLocalAdminRequest } from '@/lib/admin-access'
import { ADMIN_BASE_PATH, ADMIN_INTERNAL_BASE_PATH } from '@/lib/admin-routes'
import { isLocalOnlyMode } from '@/lib/data-provider'

export async function proxy(request: NextRequest) {
  try {
    const isLegacyAdminRoute =
      request.nextUrl.pathname === ADMIN_INTERNAL_BASE_PATH ||
      request.nextUrl.pathname.startsWith(`${ADMIN_INTERNAL_BASE_PATH}/`)
    const isSecretAdminRoute =
      request.nextUrl.pathname === ADMIN_BASE_PATH ||
      request.nextUrl.pathname.startsWith(`${ADMIN_BASE_PATH}/`)

    if (isLegacyAdminRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    if (isLocalOnlyMode()) {
      if (isSecretAdminRoute && !isAllowedLocalAdminRequest(request)) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }

      return NextResponse.next({ request })
    }

    return NextResponse.next({ request })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.next({ request })
  }
}

export const config = {
  matcher: ['/admin/:path*', '/sersdp/:path*'],
}
