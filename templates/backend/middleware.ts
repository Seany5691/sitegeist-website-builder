import { NextRequest, NextResponse } from 'next/server'
import type { NextFetchEvent } from 'next/server'
import { recordView } from './lib/view-tracker'

/**
 * Page-view beacon for generated sites.
 * Counts real document navigations only (GET + Accept: text/html) and never
 * blocks the response — the insert is fire-and-forget via event.waitUntil.
 * Self-contained and side-effect free so it can live alongside future middleware.
 */

const STATIC_EXT = /\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt|css|js|map|woff2?)$/i

function isDocumentNavigation(request: NextRequest): boolean {
  if (request.method !== 'GET') return false

  const accept = request.headers.get('accept') || ''
  if (!accept.includes('text/html')) return false

  const path = request.nextUrl.pathname
  if (
    path.startsWith('/api') ||
    path.startsWith('/_next') ||
    path.startsWith('/dashboard') ||
    path.startsWith('/favicon')
  ) {
    return false
  }
  if (STATIC_EXT.test(path)) return false

  return true
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || ''
}

export function middleware(request: NextRequest, event: NextFetchEvent) {
  try {
    const tenantId = process.env.TENANT_ID
    if (tenantId && isDocumentNavigation(request)) {
      const beacon = recordView({
        tenantId,
        path: request.nextUrl.pathname,
        userAgent: request.headers.get('user-agent') || '',
        ip: clientIp(request),
        referrer: request.headers.get('referer') || undefined,
      })

      // Critical: must not block the response.
      if (typeof event?.waitUntil === 'function') {
        event.waitUntil(beacon)
      } else {
        void beacon
      }
    }
  } catch {
    // Never break navigation.
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt|css|js|map|woff2?)$).*)',
  ],
}
