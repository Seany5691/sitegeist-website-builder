'use client'

import { useSiteData } from '@/lib/use-site-data'
import { useEffect, useState } from 'react'

export default function HeroMinimal({ pageId = 'home' }: { pageId?: string }) {
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

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* Hero photo (required) */}
      {heroImage && (
        <div className="absolute inset-0">
          <img src={heroImage} alt="" aria-hidden="true" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, color-mix(in srgb, var(--color-bg) 70%, transparent) 0%, color-mix(in srgb, var(--color-bg) 90%, transparent) 100%)' }} />
        </div>
      )}
      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-5"
        style={{ background: `radial-gradient(circle at 70% 30%, var(--color-primary), transparent 70%)` }} />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 opacity-5"
        style={{ background: `radial-gradient(circle at 30% 70%, var(--color-accent), transparent 70%)` }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        {/* Thin accent line */}
        <div className={`w-16 h-1 mb-8 hero-entrance ${mounted ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`}
          style={{ background: 'var(--color-primary-cta)', transitionDelay: '0.1s' }} />

        <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light leading-[1.15] mb-8 hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.02em', transitionDelay: '0.2s' }}>
          {headline}
        </h1>

        {subheadline && (
          <p className={`text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ color: 'var(--color-muted)', transitionDelay: '0.3s' }}>
            {subheadline}
          </p>
        )}

        <div className={`flex flex-wrap gap-4 hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          style={{ transitionDelay: '0.4s' }}>
          <a href={ctaLink} className="btn btn-lg btn-primary press-scale">
            {ctaText}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </a>
        </div>
      </div>
    </section>
  )
}
