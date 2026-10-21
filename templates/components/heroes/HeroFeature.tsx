'use client'

import { useSiteData } from '@/lib/use-site-data'
import { useEffect, useState } from 'react'

export default function HeroFeature({ pageId = 'home' }: { pageId?: string }) {
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

  const features = [
    { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: config?.hero?.feature1 || 'Licensed & Insured' },
    { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: config?.hero?.feature2 || '24/7 Availability' },
    { icon: 'M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5', label: config?.hero?.feature3 || 'Trusted by Hundreds' },
  ]

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* Subtle background accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-30"
        style={{ background: `radial-gradient(ellipse at 80% 50%, color-mix(in srgb, var(--color-primary) 15%, transparent), transparent 70%)` }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            {badge && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)', color: 'var(--safe-eyebrow)', border: '1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)', transitionDelay: '0.1s' }}>
                {badge}
              </div>
            )}

            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6 hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em', transitionDelay: '0.2s' }}>
              {headline}
            </h1>

            {subheadline && (
              <p className={`text-lg leading-relaxed mb-8 max-w-lg hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ color: 'var(--color-muted)', transitionDelay: '0.3s' }}>
                {subheadline}
              </p>
            )}

            {/* Feature bullets */}
            <div className={`space-y-4 mb-10 hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: '0.4s' }}>
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 hover-lift"
                    style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                    <svg className="w-5 h-5" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                    </svg>
                  </div>
                  <span className="font-medium" style={{ color: 'var(--color-text)' }}>{feature.label}</span>
                </div>
              ))}
            </div>

            <div className={`hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: '0.5s' }}>
              <a href={ctaLink} className="btn btn-lg btn-primary press-scale">
                {ctaText}
              </a>
            </div>
          </div>

          {/* Image */}
          <div className={`relative hero-entrance ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
            style={{ transitionDelay: '0.3s' }}>
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl img-treated hover-lift">
              {heroImage ? (
                <img src={heroImage} alt={headline} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full" style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }} />
              )}
            </div>
            {/* Floating accent card */}
            <div className="absolute -bottom-6 -left-6 rounded-xl p-4 shadow-lg card hover-lift"
              style={{ background: 'var(--color-primary-cta)', color: 'var(--color-primary)' }}>
              <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                {config?.hero?.stat1Value || '10+'}
              </div>
              <div className="text-sm font-medium opacity-80">
                {config?.hero?.stat1Label || 'Years Experience'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
