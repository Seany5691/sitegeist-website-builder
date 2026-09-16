'use client'

import { useSiteData } from '@/lib/use-site-data'
import { useEffect, useState } from 'react'

export default function HeroGradient() {
  const { config } = useSiteData()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const hero = config?.hero || {}
  const headline = hero.headline || 'Welcome'
  const subheadline = hero.subheadline || ''
  const badge = hero.badge || ''
  const ctaText = hero.ctaText || 'Get Started'
  const ctaLink = hero.ctaLink || '#contact'

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 50%, var(--color-accent) 100%)` }}>
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-20 animate-pulse"
          style={{ background: 'radial-gradient(circle, var(--color-accent), transparent)' }} />
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-15 animate-pulse"
          style={{ background: 'radial-gradient(circle, var(--color-primary), transparent)', animationDelay: '1s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32">
        {badge && (
          <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-sm hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
            {badge}
          </div>
        )}

        <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em', textShadow: '0 2px 20px rgba(0,0,0,0.2)' }}>
          {headline}
        </h1>

        {subheadline && (
          <p className={`text-lg sm:text-xl text-white/80 leading-relaxed mb-10 max-w-2xl mx-auto hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            {subheadline}
          </p>
        )}

        <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <a href={ctaLink} className="btn btn-lg" style={{ background: '#fff', color: 'var(--color-primary)' }}>
            {ctaText}
          </a>
          {config?.contact?.phone && (
            <a href={`tel:${config.contact.phone}`} className="btn btn-lg" style={{ border: '2px solid rgba(255,255,255,0.3)', color: '#fff' }}>
              Call Us Today
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
