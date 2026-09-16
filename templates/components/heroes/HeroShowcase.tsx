'use client'

import { useSiteData } from '@/lib/use-site-data'
import { useEffect, useState } from 'react'

export default function HeroShowcase() {
  const { config } = useSiteData()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const hero = config?.hero || {}
  const headline = hero.headline || 'Welcome'
  const subheadline = hero.subheadline || ''
  const ctaText = hero.ctaText || 'Get Started'
  const ctaLink = hero.ctaLink || '#contact'
  const services = config?.services || []

  return (
    <section className="relative min-h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        {/* Top: Headline */}
        <div className={`text-center mb-16 hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {hero.badge && (
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6"
              style={{ background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)', color: 'var(--color-accent)' }}>
              {hero.badge}
            </span>
          )}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-4 max-w-3xl mx-auto"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            {headline}
          </h1>
          {subheadline && (
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
              {subheadline}
            </p>
          )}
        </div>

        {/* Service showcase cards */}
        {services.length > 0 && (
          <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            {services.slice(0, 3).map((service: any, i: number) => (
              <div key={i} className="group relative rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ borderColor: 'color-mix(in srgb, var(--color-text) 10%, transparent)' }}>
                <div className="aspect-[16/10] overflow-hidden img-treated">
                  {service.imageUrl ? (
                    <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full" style={{ background: `linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 20%, var(--color-bg)), color-mix(in srgb, var(--color-accent) 15%, var(--color-bg)))` }} />
                  )}
                </div>
                <div className="p-6" style={{ background: 'var(--color-bg)' }}>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
                    {service.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className={`text-center hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <a href={ctaLink} className="btn btn-lg btn-primary">
            {ctaText}
          </a>
        </div>
      </div>
    </section>
  )
}
