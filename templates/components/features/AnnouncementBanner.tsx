'use client'

import { useEffect, useState } from 'react'
import { useSiteData } from '@/lib/use-site-data'

const FEATURE_ID = 'announcementBanner'
const DISMISS_KEY = 'ann_banner_dismissed'

/**
 * Announcement / Holiday Banner — a premium bar at the very top of the site.
 *
 * Sits ABOVE the header (z-index 60) so it is never hidden behind it.
 * When the client leaves the colours blank the banner uses a tasteful brand
 * tint — it is designed to look like part of the site, not a cheap coloured
 * strip. `size` controls the vertical rhythm: compact / comfortable / roomy.
 */
export default function AnnouncementBanner() {
  const { config } = useSiteData()
  const enabled = config?.controls?.features?.[FEATURE_ID] !== false
  const data = config?.featureData?.[FEATURE_ID] || {}

  const [visible, setVisible] = useState(false)

  const text = String(data.text || '').trim()
  const dismissible = data.dismissible !== false
  const size = ['compact', 'comfortable', 'roomy'].includes(String(data.size)) ? String(data.size) : 'comfortable'

  useEffect(() => {
    if (!enabled || !text) return

    try {
      // Dismiss is remembered per exact message — changing the message makes
      // the banner show again, so a client is never stuck with it hidden.
      const hash = String(text.length) + ':' + text.slice(0, 24)
      if (dismissible && window.localStorage.getItem(DISMISS_KEY) === hash) return
    } catch {
      /* storage unavailable — keep showing */
    }

    const now = Date.now()
    if (data.startsAt) {
      const start = new Date(data.startsAt).getTime()
      if (!Number.isNaN(start) && now < start) return
    }
    if (data.endsAt) {
      const end = new Date(data.endsAt).getTime()
      if (!Number.isNaN(end) && now > end) return
    }

    setVisible(true)
  }, [enabled, text, dismissible, data.startsAt, data.endsAt])

  if (!enabled || !visible || !text) return null

  // Premium default colours — a soft brand tint, never a harsh flat block.
  const bg = String(data.bgColor || '').trim()
  const fg = String(data.textColor || '').trim()
  const customColours = !!(bg || fg)

  const pad = size === 'compact' ? '8px 0' : size === 'roomy' ? '18px 0' : '12px 0'
  const fontSize = size === 'compact' ? 13 : size === 'roomy' ? 15.5 : 14

  const dismiss = () => {
    setVisible(false)
    try {
      const hash = String(text.length) + ':' + text.slice(0, 24)
      window.localStorage.setItem(DISMISS_KEY, hash)
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      role="region"
      aria-label="Announcement"
      className="sticky top-0 w-full"
      style={{
        zIndex: 60,
        background: customColours
          ? bg
          : 'color-mix(in srgb, var(--color-primary) 12%, var(--color-bg))',
        color: customColours ? fg : 'var(--color-text)',
        boxShadow: '0 1px 0 color-mix(in srgb, var(--color-primary) 18%, transparent)',
      }}
    >
      {/* thin accent stripe along the top */}
      <div style={{ height: 3, background: 'var(--color-primary-cta)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="flex items-center justify-center gap-3"
          style={{ padding: pad, position: 'relative' }}
        >
          {/* subtle decorative dot */}
          <span
            aria-hidden="true"
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              background: 'var(--color-primary-cta)',
              flex: 'none',
            }}
          />

          <span
            className="text-center leading-snug"
            style={{ fontSize, fontWeight: 500, letterSpacing: '0.01em', paddingRight: dismissible ? 28 : 0 }}
          >
            {text}
          </span>

          {data.linkUrl && (
            <a
              href={data.linkUrl}
              className="flex-none inline-flex items-center gap-1 font-semibold transition-opacity duration-200 hover:opacity-75"
              style={{
                fontSize: fontSize - 1,
                color: customColours ? fg : 'var(--color-primary)',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
                textDecorationThickness: '1.5px',
              }}
            >
              {data.linkLabel || 'Learn more'}
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          )}

          {dismissible && (
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss announcement"
              className="absolute right-0 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
              style={{
                width: 26,
                height: 26,
                opacity: 0.55,
                color: customColours ? fg : 'var(--color-text)',
                background: 'color-mix(in srgb, currentColor 10%, transparent)',
              }}
            >
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
