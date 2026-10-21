import { headers } from 'next/headers'

/**
 * Resolve the canonical site base URL at REQUEST time.
 *
 * Why not NEXT_PUBLIC_SITE_URL? That var is inlined at build time, so a domain
 * swap (trial subdomain -> purchased domain) would require a rebuild. Deriving
 * the URL from the request Host header means adding the domain in Vercel is
 * enough — canonical / sitemap / llms.txt / OG flip on the next request.
 *
 * Falls back to NEXT_PUBLIC_SITE_URL (then example.com) when no Host header is
 * available (build-time SSG, scripts, tests).
 */
export function getSiteUrl(): string {
  try {
    const h = headers()
    const host = h.get('x-forwarded-host') || h.get('host')
    if (host) {
      const proto = h.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
      return `${proto}://${host}`
    }
  } catch {
    // headers() unavailable outside a request scope
  }
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
}

/** Join a path onto the resolved site base URL. */
export function siteUrl(path = ''): string {
  return `${getSiteUrl().replace(/\/$/, '')}${path}`
}
