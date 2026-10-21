'use client'

import { useSiteData } from '@/lib/use-site-data'
import { useEffect, useState } from 'react'

export default function HeroCentered({ pageId = 'home' }: { pageId?: string }) {
  const { config, isLoading } = useSiteData()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Skeleton UI while loading
  if (isLoading) {
    return (
      <section className="relative min-h-[80vh] sm:min-min-h-[80vh] sm:min-h-screen flex items-center justify-center overflow-hidden img-hero-overlay">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32">
          <div className="skeleton skeleton-text mx-auto" style={{ width: '120px', height: '36px', marginBottom: '2rem' }} />
          <div className="skeleton skeleton-heading mx-auto" style={{ height: '72px', marginBottom: '1.5rem' }} />
          <div className="skeleton skeleton-text mx-auto" style={{ width: '500px', maxWidth: '100%', height: '28px', marginBottom: '2.5rem' }} />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="skeleton skeleton-button mx-auto sm:mx-0" style={{ width: '160px', height: '52px' }} />
            <div className="skeleton skeleton-button mx-auto sm:mx-0" style={{ width: '160px', height: '52px' }} />
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
    <section className="relative min-h-[80vh] sm:min-min-h-[80vh] sm:min-h-screen flex items-center justify-center overflow-hidden img-hero-overlay">
      {/* Background */}
      {heroImage ? (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, color-mix(in srgb, var(--color-primary) 40%, transparent), transparent 60%)` }} />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }} />
      )}

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32">
        {badge && (
          <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium mb-8 backdrop-blur-sm hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ background: 'color-mix(in srgb, var(--color-bg) 15%, transparent)', color: 'var(--color-bg)', border: '1px solid color-mix(in srgb, var(--color-bg) 20%, transparent)', transitionDelay: '0.1s' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-primary-cta)' }} />
            {badge}
          </div>
        )}

        <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em', textShadow: '0 2px 20px rgba(0,0,0,0.3)', transitionDelay: '0.2s' }}>
          {headline}
        </h1>

        {subheadline && (
          <p className={`text-lg sm:text-xl text-white/80 leading-relaxed mb-10 max-w-2xl mx-auto hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ transitionDelay: '0.3s' }}>
            {subheadline}
          </p>
        )}

        <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          style={{ transitionDelay: '0.4s' }}>
          <a href={ctaLink}
            className="btn btn-lg btn-accent press-scale">
            {ctaText}
          </a>
          {config?.contact?.whatsapp && (
            <a href={`https://wa.me/${config.contact.whatsapp}`}
              target="_blank" rel="noopener noreferrer"
              className="btn btn-lg press-scale"
              style={{ background: '#25D366', color: '#fff' }}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              WhatsApp Us
            </a>
          )}
        </div>

        {/* Trust signals */}
        {config?.hero?.trustSignals && (
          <div className={`mt-16 flex flex-wrap justify-center gap-8 text-white/60 text-sm hero-entrance ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            {config.hero.trustSignals.map((signal: string, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <svg className="w-4 h-4" style={{ color: 'var(--safe-eyebrow)' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                <span>{signal}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t" style={{ '--tw-gradient-from': 'var(--color-bg)', '--tw-gradient-to': 'transparent' } as React.CSSProperties} />
    </section>
  )
}
