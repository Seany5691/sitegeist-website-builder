'use client'

import { useSiteData } from '@/lib/use-site-data'
import { useEffect, useState } from 'react'

export default function HeroCard({ pageId = 'home' }: { pageId?: string }) {
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden img-hero-overlay">
      {/* Background */}
      {heroImage ? (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
          <div className="absolute inset-0 bg-black/40" />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, var(--color-primary) 0%, var(--color-secondary) 50%, var(--color-accent) 100%)` }} />
      )}

      {/* Floating Card */}
      <div className={`relative z-10 max-w-2xl mx-4 sm:mx-auto hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        style={{ transitionDelay: '0.2s' }}>
        <div className="card hover-lift rounded-2xl p-8 sm:p-12 shadow-2xl backdrop-blur-xl border"
          style={{ background: 'color-mix(in srgb, var(--color-bg) 92%, transparent)', borderColor: 'color-mix(in srgb, var(--color-text) 10%, transparent)' }}>
          {badge && (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider"
              style={{ background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)', color: 'var(--safe-eyebrow)' }}>
              {badge}
            </span>
          )}

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            {headline}
          </h1>

          {subheadline && (
            <p className="text-base sm:text-lg leading-relaxed mb-8" style={{ color: 'var(--color-muted)' }}>
              {subheadline}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <a href={ctaLink} className="btn btn-md btn-primary press-scale">
              {ctaText}
            </a>
            {config?.contact?.phone && (
              <a href={`tel:${config.contact.phone}`} className="btn btn-md btn-ghost press-scale">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                Call
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
