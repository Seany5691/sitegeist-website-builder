'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

/**
 * Convert any Google Maps input into an iframe-safe embed URL.
 * Normal place links send X-Frame-Options: sameorigin and are blocked.
 */
function toMapEmbedUrl(input: {
  url?: string | null
  lat?: number | string | null
  lng?: number | string | null
  address?: string | null
}): string {
  const raw = (input.url || '').trim()
  if (raw) {
    if (/google\.com\/maps\/embed/i.test(raw) || /output=embed/i.test(raw) || /maps\/embed\?pb=/i.test(raw)) {
      return raw
    }
    const atMatch = raw.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
    if (atMatch) {
      return `https://www.google.com/maps?q=${atMatch[1]},${atMatch[2]}&output=embed&z=15`
    }
    const qMatch = raw.match(/[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
    if (qMatch) {
      return `https://www.google.com/maps?q=${qMatch[1]},${qMatch[2]}&output=embed&z=15`
    }
    const placeMatch = raw.match(/google\.[^/]+\/maps\/place\/([^/?#]+)/i)
    if (placeMatch) {
      const label = decodeURIComponent(placeMatch[1]).replace(/\+/g, ' ')
      return `https://www.google.com/maps?q=${encodeURIComponent(label)}&output=embed`
    }
    const genericQ = raw.match(/google\.[^/]+\/maps\/?\?q=([^&#]+)/i)
    if (genericQ) {
      return `https://www.google.com/maps?q=${genericQ[1]}&output=embed`
    }
  }

  const lat = input.lat != null && String(input.lat).trim() !== '' ? String(input.lat).trim() : ''
  const lng = input.lng != null && String(input.lng).trim() !== '' ? String(input.lng).trim() : ''
  if (lat && lng && /^-?\d+(\.\d+)?$/.test(lat) && /^-?\d+(\.\d+)?$/.test(lng)) {
    return `https://www.google.com/maps?q=${lat},${lng}&output=embed&z=15`
  }

  const address = (input.address || '').trim()
  if (address) {
    return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
  }

  return ''
}

export default function LocationMap() {
  const { config } = useSiteData()
  const contact = config?.contact || {}
  const address = contact.address || ''
  const heading = config?.locationHeading || 'Our Location'
  const eyebrow = config?.locationEyebrow || 'Find Us'

  const mapEmbedUrl = toMapEmbedUrl({
    url: config?.mapEmbedUrl || contact.mapEmbedUrl,
    lat: (config?.geo as any)?.latitude ?? (config?.geo as any)?.coordinates?.lat,
    lng: (config?.geo as any)?.longitude ?? (config?.geo as any)?.coordinates?.lng,
    address,
  })

  if (!mapEmbedUrl && !address) return null

  const directionsUrl = address ? `https://maps.google.com/?q=${encodeURIComponent(address)}` : ''

  return (
    <section id="location" className="section-padding ambient-glow" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>{eyebrow}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            {heading}
          </h2>
          {address && (
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>{address}</p>
          )}
        </AnimateOnScroll>

        <AnimateOnScroll>
          {mapEmbedUrl ? (
            <div className="rounded-2xl overflow-hidden border shadow-sm" style={{ borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
              <iframe
                src={mapEmbedUrl}
                className="w-full aspect-video border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Location map"
              />
            </div>
          ) : (
            <div className="rounded-2xl border p-8 sm:p-12 text-center"
              style={{
                background: 'var(--color-bg)',
                borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)',
              }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }}>
                <i className="fas fa-map-marker-alt text-xl" aria-hidden="true"></i>
              </div>
              <p className="text-lg sm:text-xl leading-relaxed max-w-lg mx-auto mb-8"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                {address}
              </p>
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer"
                className="btn btn-md btn-primary inline-flex items-center gap-2">
                Get Directions
                <i className="fas fa-arrow-right text-sm" aria-hidden="true"></i>
              </a>
            </div>
          )}
        </AnimateOnScroll>
      </div>
    </section>
  )
}
