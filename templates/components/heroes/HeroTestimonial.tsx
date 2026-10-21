'use client'

import { useSiteData } from '@/lib/use-site-data'
import { useEffect, useState } from 'react'

export default function HeroTestimonial({ pageId = 'home' }: { pageId?: string }) {
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
  const heroImage = hero.heroImageUrl || ''
  const testimonial = config?.testimonials?.[0] || null

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden img-hero-overlay">
      {/* Background */}
      {heroImage ? (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
          <div className="absolute inset-0 bg-black/50" />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }} />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Main content */}
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
              <p className={`text-lg text-white/70 leading-relaxed mb-8 max-w-lg hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: '0.3s' }}>
                {subheadline}
              </p>
            )}

            <div className={`hero-entrance ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: '0.4s' }}>
              <a href={ctaLink}
                className="btn btn-lg btn-accent press-scale">
                {ctaText}
              </a>
            </div>
          </div>

          {/* Testimonial card */}
          {testimonial && (
            <div className={`hero-entrance ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
              style={{ transitionDelay: '0.3s' }}>
              <div className="card hover-lift backdrop-blur-xl rounded-2xl p-8 border"
                style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.15)' }}>
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                    <svg key={i} className="w-5 h-5" style={{ color: 'var(--safe-eyebrow)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <blockquote className="text-xl text-white/90 leading-relaxed mb-6 italic"
                  style={{ fontFamily: 'var(--font-heading)' }}>
                  &ldquo;{testimonial.text}&rdquo;
                </blockquote>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: 'var(--color-primary-cta)', color: 'var(--color-primary)' }}>
                    {testimonial.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="text-white font-medium">{testimonial.name}</div>
                    {testimonial.source && <div className="text-white/50 text-sm">via {testimonial.source}</div>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
