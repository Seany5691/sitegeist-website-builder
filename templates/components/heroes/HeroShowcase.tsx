'use client'

import { useSiteData } from '@/lib/use-site-data'
import { useEffect, useState } from 'react'

export default function HeroShowcase({ pageId = 'home' }: { pageId?: string }) {
  const { config } = useSiteData()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const baseHero = config?.hero || {}
  const pageHero = config?.pageHeroes?.[pageId] || {}
  const hero = { ...baseHero, ...pageHero }
  const headline = hero.headline || 'Welcome'
  const subheadline = hero.subheadline || ''
  const ctaText = hero.ctaText || 'Get Started'
  const ctaLink = hero.ctaLink || '#contact'
  const heroImage = hero.heroImageUrl || hero.imageUrl || ''
  const services = config?.services || []
  const testimonials = config?.testimonials || []
  const avgRating = testimonials.length > 0
    ? (testimonials.reduce((sum: number, t: any) => sum + (Number(t.rating) || 5), 0) / testimonials.length).toFixed(1)
    : '5.0'

  return (
    <section className="relative min-h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* Full-bleed hero image — required on every hero template */}
      {heroImage && (
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center' }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, color-mix(in srgb, var(--color-bg) 75%, transparent) 0%, color-mix(in srgb, var(--color-bg) 88%, transparent) 55%, var(--color-bg) 100%)',
            }}
          />
        </div>
      )}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        {/* Top: Headline */}
        <div className={`text-center mb-12 hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          style={{ transitionDelay: '0.1s' }}>
          {hero.badge && (
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6"
              style={{ background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)', color: 'var(--safe-eyebrow)' }}>
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
          <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ transitionDelay: '0.2s' }}>
            {services.slice(0, 3).map((service: any, i: number) => (
              <div key={i} className="card hover-lift group relative rounded-xl overflow-hidden border transition-all duration-300"
                style={{ borderColor: 'color-mix(in srgb, var(--color-text) 10%, transparent)' }}>
                <div className="aspect-[16/10] overflow-hidden img-treated hover-zoom">
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
        <div className={`text-center hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          style={{ transitionDelay: '0.3s' }}>
          <a href={ctaLink} className="btn btn-lg btn-primary press-scale">
            {ctaText}
          </a>
        </div>
      </div>
    </section>
  )
}
