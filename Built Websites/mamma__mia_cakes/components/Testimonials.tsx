'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState, useEffect, useCallback } from 'react'

export default function TestimonialsSlider() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const testimonials = config?.testimonials || []
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const sectionTitle = pc.testimonialsTitle || 'What Our Customers Say'
  const sectionSubtitle = pc.testimonialsSubtitle || 'Happy Clients'

  const next = useCallback(() => setCurrent(p => (p + 1) % testimonials.length), [testimonials.length])
  const prev = useCallback(() => setCurrent(p => (p - 1 + testimonials.length) % testimonials.length), [testimonials.length])

  useEffect(() => {
    if (paused || testimonials.length <= 1) return
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [paused, next, testimonials.length])

  if (testimonials.length === 0) return null

  return (
    <section id="testimonials" className="section-padding" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>{sectionSubtitle}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            {sectionTitle}
          </h2>
        </AnimateOnScroll>

        <AnimateOnScroll>
          <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <div className="rounded-2xl p-8 sm:p-12 border relative overflow-hidden"
              style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))', borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
              {/* Quote icon */}
              <svg className="absolute top-4 right-4 w-24 h-24 opacity-5" style={{ color: 'var(--color-primary)' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10H0z" />
              </svg>

              <div key={current} className="relative z-10">
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: testimonials[current].rating || 5 }).map((_, i) => (
                    <svg key={i} className="w-5 h-5" style={{ color: 'var(--color-accent)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <blockquote className="text-xl sm:text-2xl leading-relaxed mb-8 italic"
                  style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
                  &ldquo;{testimonials[current].text}&rdquo;
                </blockquote>

                <div className="flex items-center gap-4">
                  {testimonials[current].photoUrl ? (
                    <img src={testimonials[current].photoUrl} alt={testimonials[current].name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                      style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }}>
                      {testimonials[current].name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    <div className="font-bold" style={{ color: 'var(--color-text)' }}>{testimonials[current].name}</div>
                    {testimonials[current].source && <div className="text-sm" style={{ color: 'var(--color-muted)' }}>via {testimonials[current].source}</div>}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button onClick={prev} className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors"
                style={{ borderColor: 'color-mix(in srgb, var(--color-text) 15%, transparent)', color: 'var(--color-text)' }}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></button>
              <div className="flex gap-2">
                {testimonials.map((_: any, i: number) => (
                  <button key={i} onClick={() => setCurrent(i)}
                    className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                    style={{ background: i === current ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-text) 20%, transparent)', width: i === current ? '1.5rem' : '0.625rem' }} />
                ))}
              </div>
              <button onClick={next} className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors"
                style={{ borderColor: 'color-mix(in srgb, var(--color-text) 15%, transparent)', color: 'var(--color-text)' }}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></button>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
