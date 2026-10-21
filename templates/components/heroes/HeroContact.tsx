'use client'

import { useSiteData } from '@/lib/use-site-data'
import { useEffect, useState } from 'react'

export default function HeroContact({ pageId = 'home' }: { pageId?: string }) {
  const { config } = useSiteData()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const baseHero = config?.hero || {}
  const pageHero = config?.pageHeroes?.[pageId] || {}
  const hero = { ...baseHero, ...pageHero }
  const headline = hero.headline || 'Welcome'
  const subheadline = hero.subheadline || ''
  const heroImage = hero.heroImageUrl || ''

  return (
    <section className="relative min-h-[80vh] sm:min-min-h-[80vh] sm:min-h-screen flex items-center overflow-hidden img-hero-overlay">
      {/* Background */}
      {heroImage ? (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
          <div className="absolute inset-0 bg-black/60" />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }} />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            {hero.badge && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--safe-eyebrow)', border: '1px solid rgba(255,255,255,0.15)', transitionDelay: '0.1s' }}>
                {hero.badge}
              </div>
            )}

            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em', transitionDelay: '0.2s' }}>
              {headline}
            </h1>

            {subheadline && (
              <p className={`text-lg text-white/70 leading-relaxed mb-8 hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: '0.3s' }}>
                {subheadline}
              </p>
            )}

            {/* Quick contact options */}
            <div className={`flex flex-wrap gap-4 hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: '0.4s' }}>
              {config?.contact?.phone && (
                <a href={`tel:${config.contact.phone}`} className="btn btn-md btn-accent press-scale">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  Call Now
                </a>
              )}
              {config?.contact?.whatsapp && (
                <a href={`https://wa.me/${config.contact.whatsapp}`}
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn-md press-scale"
                  style={{ background: '#25D366', color: '#fff' }}>
                  WhatsApp Us
                </a>
              )}
            </div>
          </div>

          {/* Quick contact card */}
          <div className={`hero-entrance ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
            style={{ transitionDelay: '0.5s' }}>
            <div className="card hover-lift backdrop-blur-xl rounded-2xl p-8 border"
              style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.15)' }}>
              <h3 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
                Get In Touch
              </h3>

              <div className="space-y-4">
                {config?.contact?.phone && (
                  <a href={`tel:${config.contact.phone}`} className="flex items-center gap-3 text-white/80 hover:text-white transition-colors">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <span>{config.contact.phone}</span>
                  </a>
                )}
                {config?.contact?.email && (
                  <a href={`mailto:${config.contact.email}`} className="flex items-center gap-3 text-white/80 hover:text-white transition-colors">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <span>{config.contact.email}</span>
                  </a>
                )}
                {config?.contact?.address && (
                  <div className="flex items-center gap-3 text-white/80">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <span>{config.contact.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
