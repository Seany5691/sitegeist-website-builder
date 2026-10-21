'use client'

/**
 * ServiceDetailHero — hero banner for a service sub-page.
 * Shows the service's own heading, subheading, and background image.
 */

import { useSiteData } from '@/lib/use-site-data'

interface Props {
  service: {
    headline?: string
    label?: string
    subheadline?: string
    heroImageUrl?: string
    image?: string
  }
}

export default function ServiceDetailHero({ service }: Props) {
  const { config } = useSiteData()
  const baseHero = config?.hero || {}
  
  const headline = service.headline || service.label || 'Our Service'
  const subheadline = service.subheadline || ''
  const image = service.heroImageUrl || service.image || baseHero.heroImageUrl || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1920&q=80'

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0" style={{ background: 'color-mix(in srgb, var(--color-primary) 60%, transparent)' }} />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
          style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}
        >
          {headline}
        </h1>
        {subheadline && (
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            {subheadline}
          </p>
        )}
      </div>
    </section>
  )
}
