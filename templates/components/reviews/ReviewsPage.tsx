'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import Testimonials from '@/components/Testimonials'

/**
 * Reviews page — full-page view. Renders nothing when there is no content,
 * so turning the page on with no data never shows a broken block.
 */
export default function ReviewsPage() {
  const { config } = useSiteData()
  if (!config) return null

  return (
    <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: 'var(--safe-eyebrow)' }}
          >
            What our customers say
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}
          >
            Reviews
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
            Real feedback from real customers, wherever they left it.
          </p>
        </AnimateOnScroll>
        <Testimonials />
      </div>
    </section>
  )
}
