'use client'

import { useSiteData } from '@/lib/use-site-data'
import { useEffect, useState } from 'react'

export default function HeroStats() {
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

  const stats = [
    { value: config?.hero?.stat1Value || '10+', label: config?.hero?.stat1Label || 'Years Experience' },
    { value: config?.hero?.stat2Value || '500+', label: config?.hero?.stat2Label || 'Happy Clients' },
    { value: config?.hero?.stat3Value || '24/7', label: config?.hero?.stat3Label || 'Availability' },
  ]

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden img-hero-overlay">
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
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--color-accent)', border: '1px solid rgba(255,255,255,0.15)' }}>
                {badge}
              </div>
            )}

            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}>
              {headline}
            </h1>

            {subheadline && (
              <p className={`text-lg text-white/70 leading-relaxed mb-8 max-w-xl transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                {subheadline}
              </p>
            )}

            <div className={`flex flex-wrap gap-4 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <a href={ctaLink} className="btn btn-lg btn-accent">
                {ctaText}
              </a>
            </div>
          </div>

          {/* Stats - 2 cols */}
          <div className={`lg:col-span-2 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="grid gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="backdrop-blur-md rounded-xl p-6 border transition-all duration-300 hover:-translate-y-0.5"
                  style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <div className="text-3xl sm:text-4xl font-bold mb-1" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-heading)' }}>
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
