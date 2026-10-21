'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default function TestimonialsMinimal() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const testimonials = config?.testimonials || []

  const sectionTitle = pc.testimonialsTitle || 'What Our Customers Say'
  const sectionSubtitle = pc.testimonialsSubtitle || 'Happy Clients'

  if (testimonials.length === 0) return null

  return (
    <section id="testimonials" className="section-padding ambient-glow" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>{sectionSubtitle}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            {sectionTitle}
          </h2>
        </AnimateOnScroll>

        <div className="space-y-8">
          {testimonials.map((t: any, i: number) => (
            <AnimateOnScroll key={i} delay={i * 100}>
              <div className="flex gap-4">
                <div className="w-1 rounded-full flex-shrink-0" style={{ background: 'var(--color-primary-cta)' }} />
                <div>
                  <p className="text-lg leading-relaxed mb-3 italic" style={{ color: 'var(--color-text)' }}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-2">
                    {t.photoUrl ? (
                      <img src={t.photoUrl} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                        style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }}>
                        {t.name?.charAt(0) || '?'}
                      </div>
                    )}
                    <span className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>{t.name}</span>
                    {t.source && <span className="text-xs" style={{ color: 'var(--color-muted)' }}>— via {t.source}</span>}
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
