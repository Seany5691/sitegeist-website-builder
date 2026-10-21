'use client'

import { useSiteData } from '@/lib/use-site-data'
import { useEffect, useState } from 'react'

export default function HeroStats({ pageId = 'home' }: { pageId?: string }) {
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

  // Single source of truth — same values as About/StatsBar. Never invent fallbacks.
  const stats = (() => {
    if (!config) return []
    if (Array.isArray(config.stats) && config.stats.length > 0) {
      return config.stats
        .filter((s: any) => s && (s.value || s.label))
        .map((s: any) => ({ value: String(s.value ?? ''), label: String(s.label ?? '') }))
    }
    const pairs: Array<[any, any]> = [
      [hero.stat1Value, hero.stat1Label],
      [hero.stat2Value, hero.stat2Label],
      [hero.stat3Value, hero.stat3Label],
      [hero.stat4Value, hero.stat4Label],
    ]
    const out: Array<{ value: string; label: string }> = []
    for (const [value, label] of pairs) {
      if (value && label) out.push({ value: String(value), label: String(label) })
      else if (value) out.push({ value: String(value), label: '' })
    }
    return out
  })()

  return (
    <section className="relative min-h-[80vh] sm:min-min-h-[80vh] sm:min-h-screen flex items-center overflow-hidden img-hero-overlay">
      {/* Background */}
      {heroImage ? (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
          <div className="absolute inset-0 bg-black/60" />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 80%, #000))` }} />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-32">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          {/* Text - 3 cols */}
          <div className="lg:col-span-3">
            {badge && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--safe-eyebrow)', border: '1px solid rgba(255,255,255,0.15)', transitionDelay: '0.1s' }}>
                {badge}
              </div>
            )}

            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em', transitionDelay: '0.2s' }}>
              {headline}
            </h1>

            {subheadline && (
              <p className={`text-lg text-white/70 leading-relaxed mb-8 max-w-xl hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: '0.3s' }}>
                {subheadline}
              </p>
            )}

            <div className={`flex flex-wrap gap-4 hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: '0.4s' }}>
              <a href={ctaLink} className="btn btn-lg btn-accent press-scale">
                {ctaText}
              </a>
            </div>
          </div>

          {/* Stats - 2 cols */}
          <div className={`lg:col-span-2 hero-entrance ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
            style={{ transitionDelay: '0.3s' }}>
            <div className="grid gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="card hover-lift backdrop-blur-md rounded-xl p-6 border transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <div className="text-3xl sm:text-4xl font-bold mb-1" style={{ color: 'var(--safe-eyebrow)', fontFamily: 'var(--font-heading)' }}>
                    {stat.value}
                  </div>
                  <div className="text-white/60 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
