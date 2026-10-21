'use client'

import { useSiteData } from '@/lib/use-site-data'
import { Icon, iconFromFaClass } from './icons'

const FEATURE_ID = 'trustBadges'

export default function TrustBadges() {
  const { config } = useSiteData()
  const enabled = config?.controls?.features?.[FEATURE_ID] !== false
  const data = config?.featureData?.[FEATURE_ID] || {}

  const badges = Array.isArray(data.badges) ? data.badges : []
  if (!enabled || badges.length === 0) return null

  return (
    <section
      className="py-12 sm:py-14"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {data.title && (
          <h2
            className="text-center text-2xl sm:text-3xl font-bold mb-8"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.02em' }}
          >
            {data.title}
          </h2>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          {badges.map((badge: any, i: number) => {
            const hasImage = !!(badge.image && String(badge.image).trim())
            const chip = (
              <div
                className="inline-flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all duration-200"
                style={{
                  background: 'color-mix(in srgb, var(--color-primary) 7%, var(--color-bg))',
                  border: '1px solid color-mix(in srgb, var(--color-primary) 18%, transparent)',
                  color: 'var(--color-text)',
                  minWidth: 96,
                }}
              >
                {hasImage ? (
                  // Brand logo (e.g. Toyota, Castrol) — let the logo define the
                  // card width so it never floats in a bigger empty frame.
                  <img
                    src={badge.image}
                    alt={badge.label || 'Partner logo'}
                    className="object-contain"
                    style={{ height: 56, width: 'auto', maxWidth: 190 }}
                    loading="lazy"
                  />
                ) : (
                  <Icon
                    name={iconFromFaClass(badge.icon)}
                    size={22}
                    style={{ color: 'var(--color-primary)' }}
                  />
                )}
                {badge.label && (
                  <span
                    className="text-xs font-semibold text-center leading-snug"
                    style={{ color: hasImage ? 'var(--color-muted)' : 'var(--color-text)' }}
                  >
                    {badge.label}
                  </span>
                )}
              </div>
            )

            return badge.url ? (
              <a
                key={i}
                href={badge.url}
                target={badge.url.startsWith('http') ? '_blank' : undefined}
                rel={badge.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="hover:-translate-y-0.5 transition-transform duration-200"
              >
                {chip}
              </a>
            ) : (
              <div key={i} className="hover:-translate-y-0.5 transition-transform duration-200">
                {chip}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
