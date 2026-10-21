import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumber(phone: string): string {
  // Format SA phone numbers nicely
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('27')) {
    return `+27 ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  
  return phone
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/** Strip UTF-8 BOM before JSON.parse — Windows editors/PowerShell often add one. */
export function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
}

/** JSON.parse that tolerates a UTF-8 BOM. Returns any, like JSON.parse. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseJsonSafe<T = any>(raw: string): T {
  return JSON.parse(stripBom(raw)) as T
}

/**
 * Convert any Google Maps input into an iframe-safe embed URL.
 *
 * Normal place links (google.com/maps/place/...) send X-Frame-Options: sameorigin
 * and are blocked in iframes. Only /maps/embed or ?output=embed work.
 *
 * Priority: embed URL as-is → coords from URL → lat/lng → address query.
 */
export function toMapEmbedUrl(input: {
  url?: string | null
  lat?: number | string | null
  lng?: number | string | null
  address?: string | null
}): string {
  const raw = (input.url || '').trim()
  if (raw) {
    // Already embeddable
    if (/google\.com\/maps\/embed/i.test(raw) || /output=embed/i.test(raw) || /maps\/embed\?pb=/i.test(raw)) {
      return raw
    }

    // Extract coordinates from @lat,lng (place URLs) or ?q=lat,lng
    const atMatch = raw.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
    if (atMatch) {
      return `https://www.google.com/maps?q=${atMatch[1]},${atMatch[2]}&output=embed&z=15`
    }
    const qMatch = raw.match(/[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
    if (qMatch) {
      return `https://www.google.com/maps?q=${qMatch[1]},${qMatch[2]}&output=embed&z=15`
    }

    // Place URL with a searchable name → use the path as a query
    const placeMatch = raw.match(/google\.[^/]+\/maps\/place\/([^/?#]+)/i)
    if (placeMatch) {
      const label = decodeURIComponent(placeMatch[1]).replace(/\+/g, ' ')
      return `https://www.google.com/maps?q=${encodeURIComponent(label)}&output=embed`
    }

    // Generic google maps / maps.google.com query link
    const genericQ = raw.match(/google\.[^/]+\/maps\/?\?q=([^&#]+)/i)
    if (genericQ) {
      return `https://www.google.com/maps?q=${genericQ[1]}&output=embed`
    }
  }

  // Explicit lat/lng (dashboard fields)
  const lat = input.lat != null && String(input.lat).trim() !== '' ? String(input.lat).trim() : ''
  const lng = input.lng != null && String(input.lng).trim() !== '' ? String(input.lng).trim() : ''
  if (lat && lng && /^-?\d+(\.\d+)?$/.test(lat) && /^-?\d+(\.\d+)?$/.test(lng)) {
    return `https://www.google.com/maps?q=${lat},${lng}&output=embed&z=15`
  }

  // Address fallback
  const address = (input.address || '').trim()
  if (address) {
    return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
  }

  return ''
}