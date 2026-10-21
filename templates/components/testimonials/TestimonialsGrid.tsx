'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

/** Desktop column count for n cards — avoids a lonely orphan card when possible. */
function lgColCount(n: number): number {
  if (n <= 1) return 1
  if (n === 2) return 2
  if (n === 3) return 3
  if (n === 4) return 4
  return n % 3 === 0 ? 3 : n % 4 === 0 ? 4 : 3
}

/**
 * Count-aware width for each card (the AnimateOnScroll wrapper is the flex item).
 * Literal class strings only, so Tailwind can see them. gap-6 = 1.5rem, hence the calc offsets.
 */
function rowItemClass(n: number): string {
  if (n <= 1) return 'w-full max-w-md'
  if (n === 2) return 'w-full max-w-md sm:w-[calc(50%_-_0.75rem)]'
  return lgColCount(n) === 4
    ? 'w-full max-w-md sm:w-[calc(50%_-_0.75rem)] lg:w-[calc(25%_-_1.125rem)]'
    : 'w-full max-w-md sm:w-[calc(50%_-_0.75rem)] lg:w-[calc(33.333%_-_1rem)]'
}

export default function TestimonialsGrid() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const testimonials = config?.testimonials || []

  const sectionTitle = pc.testimonialsTitle || 'What Our Customers Say'
  const sectionSubtitle = pc.testimonialsSubtitle || 'Happy Clients'

  if (testimonials.length === 0) return null

  const itemClass = rowItemClass(testimonials.length)

  return (
    <section id="testimonials" className="section-padding ambient-glow" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>{sectionSubtitle}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            {sectionTitle}
          </h2>
        </AnimateOnScroll>

        <div className="flex flex-wrap justify-center gap-6">
          {testimonials.map((t: any, i: number) => (
            <AnimateOnScroll key={i} delay={i * 100} className={itemClass}>
              <div className="rounded-xl p-6 border h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ background: 'var(--color-bg)', borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating || 5 }).map((_, j) => (
                    <svg key={j} className="w-4 h-4" style={{ color: 'var(--safe-eyebrow)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="leading-relaxed mb-4 italic" style={{ color: 'var(--color-text)' }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  {t.photoUrl ? (
                    <img src={t.photoUrl} alt={t.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }}>
                      {t.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{t.name}</div>
                    {t.source && <div className="text-xs" style={{ color: 'var(--color-muted)' }}>via {t.source}</div>}
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
