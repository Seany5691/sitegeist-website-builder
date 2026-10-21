'use client'

import { useSiteData } from '@/lib/use-site-data'
import { useEffect, useState } from 'react'

export default function HeroSplit({ pageId = 'home' }: { pageId?: string }) {
  const { config, isLoading } = useSiteData()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Skeleton UI while loading
  if (isLoading) {
    return (
      <section className="relative min-h-[80vh] sm:min-min-h-[80vh] sm:min-h-screen flex items-center overflow-hidden bg-[var(--color-bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text skeleton */}
            <div className="order-2 lg:order-1 py-12 lg:py-0">
              <div className="skeleton skeleton-text" style={{ width: '120px', height: '32px', marginBottom: '1.5rem' }} />
              <div className="skeleton skeleton-heading" style={{ height: '60px', marginBottom: '1.5rem' }} />
              <div className="skeleton skeleton-text" style={{ height: '24px', marginBottom: '0.5rem' }} />
              <div className="skeleton skeleton-text" style={{ width: '80%', height: '24px', marginBottom: '2rem' }} />
              <div className="flex gap-4">
                <div className="skeleton skeleton-button" style={{ width: '140px', height: '48px' }} />
                <div className="skeleton skeleton-button" style={{ width: '140px', height: '48px' }} />
              </div>
            </div>
            {/* Image skeleton */}
            <div className="order-1 lg:order-2">
              <div className="skeleton aspect-[4/5] rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
    )
  }

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
    <section className="relative min-h-[80vh] sm:min-min-h-[80vh] sm:min-h-screen flex items-center overflow-hidden bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Side */}
          <div className="order-2 lg:order-1 py-12 lg:py-0">
            {badge && (
              <div 
                className="hero-entrance inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 border transition-all duration-600 ease-out"
                style={{ 
                  background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)', 
                  color: 'var(--safe-eyebrow)', 
                  borderColor: 'color-mix(in srgb, var(--color-accent) 30%, transparent)',
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.95)',
                  transitionDelay: '0.1s'
                }}>
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ 
                    background: 'var(--color-primary-cta)',
                    animation: mounted ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
                  }} 
                />
                {badge}
              </div>
            )}

            <h1 
              className="hero-entrance text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-6 transition-all duration-600 ease-out"
              style={{ 
                fontFamily: 'var(--font-heading)', 
                color: 'var(--color-text)', 
                letterSpacing: '-0.025em',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: '0.2s'
              }}>
              {headline}
            </h1>

            {subheadline && (
              <p 
                className="hero-entrance text-lg sm:text-xl leading-relaxed mb-8 max-w-lg transition-all duration-600 ease-out"
                style={{ 
                  color: 'var(--color-muted)',
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                  transitionDelay: '0.3s'
                }}>
                {subheadline}
              </p>
            )}

            <div 
              className="hero-entrance flex flex-wrap gap-4 transition-all duration-600 ease-out"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: '0.4s'
              }}>
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

          {/* Image Side */}
          <div 
            className="order-1 lg:order-2 relative transition-all duration-1000 ease-out"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateX(0)' : 'translateX(30px)',
              transitionDelay: '0.3s'
            }}>
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl img-treated hover-lift">
              {heroImage ? (
                <img src={heroImage} alt={headline} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full" style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            {/* Decorative accent */}
            <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-2xl -z-10" style={{ background: 'color-mix(in srgb, var(--color-accent) 20%, transparent)' }} />
            <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full -z-10" style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }} />
          </div>
        </div>
      </div>
    </section>
  )
}
