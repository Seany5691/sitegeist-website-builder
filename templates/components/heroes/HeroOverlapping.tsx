'use client'

import { useSiteData } from '@/lib/use-site-data'
import { useEffect, useState } from 'react'

export default function HeroOverlapping({ pageId = 'home' }: { pageId?: string }) {
  const { config } = useSiteData()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const baseHero = config?.hero || {}
  const pageHero = config?.pageHeroes?.[pageId] || {}
  const hero = { ...baseHero, ...pageHero }
  const headline = hero.headline || 'Welcome'
  const subheadline = hero.subheadline || ''
  const badge = hero.badge || ''
  const ctaText = hero.ctaText || 'Get Started'
  const ctaLink = hero.ctaLink || '#contact'
  const heroImage = hero.heroImageUrl || ''

  return (
    <section className="relative min-h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Text Side */}
          <div className="order-2 lg:order-1 z-10">
            {badge && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 border hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)', color: 'var(--safe-eyebrow)', borderColor: 'color-mix(in srgb, var(--color-accent) 30%, transparent)', transitionDelay: '0.1s' }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-primary-cta)' }} />
                {badge}
              </div>
            )}

            <h1 className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-6 hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em', transitionDelay: '0.2s' }}>
              {headline}
            </h1>

            {subheadline && (
              <p className={`text-lg sm:text-xl leading-relaxed mb-8 max-w-lg hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ color: 'var(--color-muted)', transitionDelay: '0.3s' }}>
                {subheadline}
              </p>
            )}

            <div className={`flex flex-wrap gap-4 hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: '0.4s' }}>
              <a href={ctaLink} className="btn btn-lg btn-primary press-scale">
                {ctaText}
              </a>
              {config?.contact?.phone && (
                <a href={`tel:${config.contact.phone}`} className="btn btn-lg btn-outline press-scale">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  Call Us
                </a>
              )}
            </div>
          </div>

          {/* Image Side — overlaps into the text area */}
          <div className={`order-1 lg:order-2 relative hero-entrance ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
            style={{ transitionDelay: '0.3s' }}>
            <div className="relative lg:-ml-16 xl:-ml-24">
              <div className="card hover-lift aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl img-treated hover-zoom">
                {heroImage ? (
                  <img src={heroImage} alt={headline} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full" style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              {/* Decorative accent */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-2xl -z-10" style={{ background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)' }} />
              <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full -z-10" style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
