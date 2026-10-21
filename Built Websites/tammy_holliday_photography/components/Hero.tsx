'use client'

import { useSiteData } from '@/lib/use-site-data'
import { useEffect, useState } from 'react'

export default function HeroFullscreen() {
  const { config } = useSiteData()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const hero = config?.hero || {}
  const headline = hero.headline || 'Welcome'
  const subheadline = hero.subheadline || ''
  const badge = hero.badge || ''
  const ctaText = hero.ctaText || 'Get Started'
  const ctaLink = hero.ctaLink || '#contact'
  const heroImage = hero.heroImageUrl || ''

  return (
    <section className="relative h-screen flex items-end overflow-hidden img-hero-overlay" style={{ paddingTop: '4rem' }}>
      {/* Full bleed background */}
      {heroImage ? (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
      ) : (
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }} />
      )}

      {/* Bottom gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Content at bottom */}
      <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16 sm:pb-24 hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ transitionDelay: '0.2s' }}>
        {badge && (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider"
            style={{ background: 'var(--color-accent)', color: 'var(--color-primary)' }}>
            {badge}
          </span>
        )}

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.05] mb-4 max-w-4xl"
          style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em', textShadow: '0 2px 30px rgba(0,0,0,0.4)' }}>
          {headline}
        </h1>

        {subheadline && (
          <p className="text-lg sm:text-xl text-white/70 leading-relaxed mb-8 max-w-2xl">
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
