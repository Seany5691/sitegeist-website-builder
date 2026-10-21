'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

/**
 * Trust Badges / partner logo strip — renders as an ORDERABLE homepage section.
 *
 * Content lives in `siteConfig.featureData.trustBadges` (edited from the
 * dashboard Features tab). Falls back to the legacy `config.trustBadges` key.
 *
 * `showFrame: false` renders the logos bare, no card chrome — all items keep
 * the same height so a logo wall stays tidy.
 */
export default function TrustBadges() {
  const { config } = useSiteData()
  const data = config?.featureData?.trustBadges || config?.trustBadges || {}
  const badges = Array.isArray(data.badges) ? data.badges : []

  if (badges.length === 0) return null

  const title = data.title || ''
  const showFrame = data.showFrame !== false
  // Logo size — three tasteful tiers. Large is prominent but never overwhelming.
  const sizeKey = ['small', 'medium', 'large'].includes(String(data.size)) ? String(data.size) : 'medium'
  const logoHeight = sizeKey === 'small' ? 34 : sizeKey === 'large' ? 62 : 48
  const cellHeight = sizeKey === 'small' ? 56 : sizeKey === 'large' ? 96 : 72
  const cellPadX = sizeKey === 'small' ? 12 : sizeKey === 'large' ? 26 : 18
  const maxLogoWidth = sizeKey === 'small' ? 110 : sizeKey === 'large' ? 240 : 170

  return (
    <section
      id="trust-badges"
      className="section-padding"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <AnimateOnScroll className="text-center mb-12">
            <span
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: 'var(--safe-eyebrow)' }}
            >
              Trusted by
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}
            >
              {title}
            </h2>
          </AnimateOnScroll>
        )}

        <div
          className="flex flex-wrap items-center justify-center"
          style={{ gap: showFrame ? '1rem' : '2.25rem' }}
        >
          {badges.map((badge: any, i: number) => {
            const hasImage = !!(badge.image && String(badge.image).trim())
            const label = badge.label || ''
            const icon = badge.icon || ''

            const body = (
              <div
                className="flex items-center justify-center"
                style={{
                  height: cellHeight,
                  padding: showFrame ? `0 ${cellPadX}px` : '0',
                  borderRadius: showFrame ? 16 : 0,
                  background: showFrame
                    ? 'color-mix(in srgb, var(--color-primary) 6%, var(--color-bg))'
                    : 'transparent',
                  border: showFrame
                    ? '1px solid color-mix(in srgb, var(--color-primary) 16%, transparent)'
                    : '1px solid transparent',
                  transition: 'all 220ms ease',
                }}
              >
                {hasImage ? (
                  // Fixed height per size tier so every logo lines up; width follows the logo
                  <img
                    src={badge.image}
                    alt={label || 'Partner logo'}
                    style={{ height: logoHeight, width: 'auto', maxWidth: maxLogoWidth, objectFit: 'contain' }}
                    loading="lazy"
                  />
                ) : (
                  <div className="flex items-center gap-2.5">
                    {icon ? (
                      <span
                        className="flex items-center justify-center"
                        style={{ width: Math.round(logoHeight * 0.72), height: Math.round(logoHeight * 0.72), color: 'var(--color-primary)' }}
                      >
                        <svg viewBox="0 0 24 24" width={Math.round(logoHeight * 0.58)} height={Math.round(logoHeight * 0.58)} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 2l2.6 6.6L22 9.3l-5 4.9 1.2 7.1L12 17.8 5.8 21.3 7 14.2 2 9.3l7.4-.7L12 2z" />
                        </svg>
                      </span>
                    ) : null}
                    <span
                      className="font-semibold"
                      style={{ color: 'var(--color-text)', fontSize: sizeKey === 'small' ? 13 : sizeKey === 'large' ? 18 : 15 }}
                    >
                      {label}
                    </span>
                  </div>
                )}
              </div>
            )

            return badge.url ? (
              <a
                key={i}
                href={badge.url}
                target={String(badge.url).startsWith('http') ? '_blank' : undefined}
                rel={String(badge.url).startsWith('http') ? 'noopener noreferrer' : undefined}
                className="transition-transform duration-200 hover:-translate-y-0.5"
              >
                {body}
              </a>
            ) : (
              <div key={i} className="transition-transform duration-200 hover:-translate-y-0.5">
                {body}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
