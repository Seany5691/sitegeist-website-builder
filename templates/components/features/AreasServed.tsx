'use client'

import { useSiteData } from '@/lib/use-site-data'
import { Icon } from './icons'

const FEATURE_ID = 'areasServedStrip'

export default function AreasServed() {
  const { config } = useSiteData()
  const enabled = config?.controls?.features?.[FEATURE_ID] !== false
  const data = config?.featureData?.[FEATURE_ID] || {}

  const rawItems: any[] =
    (Array.isArray(data.items) && data.items.length > 0 && data.items) ||
    (Array.isArray(data.areas) && data.areas.length > 0 && data.areas) ||
    (Array.isArray(config?.geo?.serviceAreas) && config.geo.serviceAreas) ||
    []

  const items = rawItems
    .map((item) => {
      if (typeof item === 'string') return { name: item, url: undefined }
      return { name: item?.name || item?.label || '', url: item?.url }
    })
    .filter((item) => Boolean(item.name))

  if (!enabled || items.length === 0) return null

  return (
    <section className="py-12 sm:py-14" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {data.title && (
          <h2
            className="text-center text-2xl sm:text-3xl font-bold mb-8"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.02em' }}
          >
            {data.title}
          </h2>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {items.map((item, i) => {
            const chip = (
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                style={{
                  background: 'color-mix(in srgb, var(--color-text) 4%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--color-text) 10%, transparent)',
                  color: 'var(--color-text)',
                }}
              >
                <Icon name="map-pin" size={15} style={{ color: 'var(--safe-eyebrow)' }} />
                {item.name}
              </span>
            )

            return item.url ? (
              <a
                key={i}
                href={item.url}
                className="hover:-translate-y-0.5 transition-transform duration-200"
                style={{ textDecoration: 'none' }}
              >
                {chip}
              </a>
            ) : (
              <div key={i}>{chip}</div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
