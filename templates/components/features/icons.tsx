'use client'

import type { CSSProperties, ReactNode } from 'react'

/**
 * Self-contained inline SVG icon set — no icon fonts, no CDNs, no pictographs.
 * 24x24 viewBox, rounded caps/joins, 1.75 default stroke so every glyph
 * shares the same optical weight. Use <Icon name="..." /> everywhere.
 */

export type IconName =
  | 'close'
  | 'check'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'phone'
  | 'whatsapp'
  | 'message'
  | 'bullhorn'
  | 'envelope'
  | 'envelope-open'
  | 'paper-plane'
  | 'shield-check'
  | 'map-pin'
  | 'expand'
  | 'exchange'
  | 'image'
  | 'sun'
  | 'scroll-bar'
  | 'file-signature'
  | 'cookie'
  | 'window'
  | 'arrow-up'
  | 'arrow-down'
  | 'plus'
  | 'trash'
  | 'edit'
  | 'external-link'
  | 'clock'
  | 'star'
  | 'navigation'

const FILLED = new Set<IconName>(['whatsapp'])

const ICONS: Record<IconName, ReactNode> = {
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>
  ),
  check: <path d="M5 13l4 4L19 7" />,
  'chevron-down': <path d="M6 9.5l6 6 6-6" />,
  'chevron-left': <path d="M14.5 6l-6 6 6 6" />,
  'chevron-right': <path d="M9.5 6l6 6-6 6" />,
  phone: (
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  ),
  // Real WhatsApp brand glyph (filled).
  whatsapp: (
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  ),
  message: (
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  ),
  bullhorn: (
    <>
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </>
  ),
  envelope: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7.5 8.5 6 8.5-6" />
    </>
  ),
  'envelope-open': (
    <>
      <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10c0-.63.3-1.22.8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
      <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
    </>
  ),
  'paper-plane': (
    <>
      <path d="M22 2 11 13" />
      <path d="m22 2-7 20-4-9-9-4Z" />
    </>
  ),
  'shield-check': (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  'map-pin': (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  expand: (
    <>
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </>
  ),
  exchange: (
    <>
      <path d="M4 8h14" />
      <path d="m15 5 3 3-3 3" />
      <path d="M20 16H6" />
      <path d="m9 13-3 3 3 3" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </>
  ),
  'scroll-bar': (
    <>
      <rect x="8" y="2" width="8" height="20" rx="4" />
      <path d="M12 6v4" />
    </>
  ),
  'file-signature': (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 15c.8-1.2 1.6-1.2 2.4 0s1.6 1.2 2.4 0 1.6-1.2 2.4 0" />
      <path d="M8 18.5h8" />
    </>
  ),
  cookie: (
    <>
      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
      <path d="M8.5 8.5v.01" />
      <path d="M16 15.5v.01" />
      <path d="M12 12v.01" />
      <path d="M11 17v.01" />
      <path d="M7 14v.01" />
    </>
  ),
  window: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <path d="M7 6.5h.01" />
      <path d="M10 6.5h.01" />
    </>
  ),
  'arrow-up': (
    <>
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </>
  ),
  'arrow-down': (
    <>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </>
  ),
  edit: <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
  'external-link': (
    <>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  star: (
    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01Z" />
  ),
  navigation: <path d="M3 11l19-9-9 19-2-8-8-2z" />,
}

export function Icon({
  name,
  size = 24,
  className,
  style,
  strokeWidth = 1.75,
}: {
  name: IconName
  size?: number | string
  className?: string
  style?: CSSProperties
  strokeWidth?: number
}) {
  const filled = FILLED.has(name)
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={filled ? undefined : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={style}
    >
      {ICONS[name]}
    </svg>
  )
}

/**
 * Map legacy icon-font class tokens found in saved config (e.g. TrustBadges
 * `badge.icon`) to IconName. Keys are the class token WITHOUT the vendor
 * prefix, so this file stays free of any icon-font references.
 */
const LEGACY_CLASS_MAP: Record<string, IconName> = {
  times: 'close',
  xmark: 'close',
  close: 'close',
  check: 'check',
  'check-circle': 'check',
  'check-double': 'check',
  'circle-check': 'check',
  'chevron-down': 'chevron-down',
  'chevron-left': 'chevron-left',
  'chevron-right': 'chevron-right',
  phone: 'phone',
  'phone-alt': 'phone',
  whatsapp: 'whatsapp',
  comment: 'message',
  'comment-dots': 'message',
  comments: 'message',
  bullhorn: 'bullhorn',
  envelope: 'envelope',
  'envelope-open': 'envelope-open',
  'paper-plane': 'paper-plane',
  shield: 'shield-check',
  'shield-alt': 'shield-check',
  'shield-check': 'shield-check',
  lock: 'shield-check',
  certificate: 'shield-check',
  award: 'star',
  medal: 'star',
  trophy: 'star',
  star: 'star',
  stars: 'star',
  'map-marker': 'map-pin',
  'map-marker-alt': 'map-pin',
  'map-pin': 'map-pin',
  directions: 'navigation',
  'location-arrow': 'navigation',
  expand: 'expand',
  'expand-alt': 'expand',
  maximize: 'expand',
  'arrows-left-right': 'exchange',
  'arrows-h': 'exchange',
  exchange: 'exchange',
  'exchange-alt': 'exchange',
  image: 'image',
  images: 'image',
  camera: 'image',
  sun: 'sun',
  'file-signature': 'file-signature',
  'file-alt': 'file-signature',
  cookie: 'cookie',
  'cookie-bite': 'cookie',
  'window-maximize': 'window',
  'arrow-up': 'arrow-up',
  'arrow-down': 'arrow-down',
  plus: 'plus',
  trash: 'trash',
  'trash-alt': 'trash',
  edit: 'edit',
  pen: 'edit',
  'external-link': 'external-link',
  'external-link-alt': 'external-link',
  clock: 'clock',
  history: 'clock',
  'thumbs-up': 'check',
  heart: 'star',
  home: 'shield-check',
  tools: 'shield-check',
  wrench: 'shield-check',
  truck: 'shield-check',
  leaf: 'shield-check',
}

const SKIP_TOKENS = new Set(['fas', 'far', 'fab', 'fal', 'fad', 'fass'])

export function iconFromFaClass(cls: string | undefined): IconName {
  if (!cls) return 'shield-check'
  for (const raw of String(cls).split(/\s+/)) {
    const t = raw.trim()
    if (!t || SKIP_TOKENS.has(t)) continue
    // Accept vendor-prefixed icon-font tokens and bare icon names.
    const key = t.startsWith('fa') ? t.slice(2).replace(/^-/, '') : t
    if (key && LEGACY_CLASS_MAP[key]) return LEGACY_CLASS_MAP[key]
  }
  return 'shield-check'
}
