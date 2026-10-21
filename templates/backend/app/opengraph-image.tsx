import { ImageResponse } from 'next/og'
import { loadJSON } from '@/lib/blob-storage'
import { generateLogoSet, LogoPalette } from '@/lib/logo-engine'

export const runtime = 'nodejs'
// Force dynamic — static prerender of @vercel/og crashes on Windows paths
// that contain spaces ("Coding Projects") inside fileURLToPath.
export const dynamic = 'force-dynamic'
export const alt = 'Business preview'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Dynamic Open Graph image — branded per site from site-config.json.
 * Renders the site's logo mark so WhatsApp / social link previews show the
 * real brand rather than plain text.
 */
export default async function OpengraphImage() {
  let config: {
    businessName?: string
    city?: string
    motto?: string
    industry?: string
    brandAssets?: {
      logoUrl?: string
      brandColors?: { primary?: string; secondary?: string; accent?: string; bg?: string }
    }
    theme?: { palette?: { primary?: string; secondary?: string; accent?: string; bg?: string; text?: string } }
  } = {}
  try {
    config = (await loadJSON('site-config.json')) || {}
  } catch {
    config = {}
  }

  const primary = config.brandAssets?.brandColors?.primary || config.theme?.palette?.primary || '#0f172a'
  const accent = config.brandAssets?.brandColors?.accent || config.theme?.palette?.accent || '#f59e0b'
  const secondary = config.brandAssets?.brandColors?.secondary || config.theme?.palette?.secondary
  const bg = config.theme?.palette?.bg || '#f8fafc'
  const text = config.theme?.palette?.text || '#0f172a'
  const businessName = config.businessName || 'Website'
  const motto = config.motto || config.city || ''

  // Prefer the real uploaded/scraped logo; fall back to a generated mark
  let logoSrc: string | null = null
  if (config.brandAssets?.logoUrl) {
    try {
      const url = config.brandAssets.logoUrl
      const abs = url.startsWith('http') ? url : `http://localhost${url.startsWith('/') ? '' : '/'}${url}`
      const res = await fetch(abs, { cache: 'no-store' })
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer())
        const type = res.headers.get('content-type') || 'image/png'
        logoSrc = `data:${type};base64,${buf.toString('base64')}`
      }
    } catch {
      logoSrc = null
    }
  }
  if (!logoSrc) {
    const palette: LogoPalette = { primary, secondary, accent, bg, text }
    const set = generateLogoSet({ businessName, industry: config.industry, palette })
    logoSrc = `data:image/svg+xml;base64,${Buffer.from(set.faviconSvg).toString('base64')}`
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: bg,
          padding: 72,
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt=""
            style={{ width: 132, height: 132, objectFit: 'contain', borderRadius: 18 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              style={{
                fontSize: 24,
                color: primary,
                letterSpacing: 6,
                textTransform: 'uppercase',
                opacity: 0.75,
              }}
            >
              {config.city || 'South Africa'}
            </div>
            <div
              style={{
                fontSize: businessName.length > 26 ? 58 : 76,
                fontWeight: 700,
                color: text,
                lineHeight: 1.05,
                maxWidth: 900,
              }}
            >
              {businessName}
            </div>
          </div>
        </div>

        {motto ? (
          <div style={{ fontSize: 34, color: primary, opacity: 0.85, maxWidth: 1000 }}>{motto}</div>
        ) : (
          <div />
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ width: 180, height: 10, background: accent, borderRadius: 999 }} />
          <div style={{ fontSize: 24, color: primary, opacity: 0.6 }}>sitespire.co.za</div>
        </div>
      </div>
    ),
    { ...size }
  )
}
