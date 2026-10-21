'use client'

import { useSiteData } from '@/lib/use-site-data'
import { useEffect, useState } from 'react'

export default function HeroFullscreen({ pageId = 'home' }: { pageId?: string }) {
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
    <section className="relative min-h-[calc(100svh-var(--header-h,7.5rem))] flex items-end overflow-hidden img-hero-overlay" style={{ paddingTop: 'var(--header-h, 7.5rem)' }}>
      {/* Full bleed background with parallax */}
      {heroImage ? (
        <div className="absolute inset-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${heroImage})` }} />
      ) : (
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }} />
      )}

      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent" />

      {/* Floating decorative elements (archetype-aware) */}
      <div className="absolute top-20 right-20 text-6xl opacity-10 animate-float hidden lg:block">
        ✨
      </div>
      <div className="absolute bottom-40 left-10 text-5xl opacity-10 animate-float-delayed hidden lg:block">
        🌟
      </div>

      {/* Trust badge — desktop: floating top-right; mobile: sits with the copy */}
      {config?.hero?.rating && (
        <div className="hidden lg:flex absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg items-center gap-2 z-20">
          <span className="text-2xl">⭐</span>
          <span className="font-bold text-gray-900">{config.hero.rating}</span>
          <span className="text-sm text-gray-600">({config.hero.reviewCount || '100+'} reviews)</span>
        </div>
      )}

      {/* Content at bottom */}
      <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16 sm:pb-24 hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ transitionDelay: '0.2s' }}>
        {config?.hero?.rating && (
          <div className="lg:hidden inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg mb-4">
            <span className="text-lg">⭐</span>
            <span className="font-bold text-gray-900 text-sm">{config.hero.rating}</span>
            <span className="text-xs text-gray-600">({config.hero.reviewCount || '100+'} reviews)</span>
          </div>
        )}
        {badge && (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider"
            style={{ background: 'var(--color-primary-cta)', color: 'var(--color-primary)' }}>
            {badge}
          </span>
        )}

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.05] mb-4 max-w-4xl"
          style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em', textShadow: '0 2px 30px rgba(0,0,0,0.4)' }}>
          {headline}
        </h1>

        {subheadline && (
          <p className="text-lg sm:text-xl text-white/70 leading-relaxed mb-8 max-w-2xl" style={{ textShadow: '0 1px 10px rgba(0,0,0,0.3)' }}>
            {subheadline}
          </p>
        )}

        <div className="flex flex-wrap gap-4">
          <a href={ctaLink} className="btn btn-lg btn-accent press-scale">
            {ctaText}
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hero-entrance ${mounted ? 'opacity-100' : 'opacity-0'}`}
        style={{ transitionDelay: '0.5s' }}>
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5">
          <div className="w-1.5 h-3 rounded-full bg-white/60 animate-bounce" />
        </div>
      </div>
    </section>
  )
}
