'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

/**
 * Desktop column count for a row of n items — wraps without leaving a lonely
 * orphan card on the last row when a good split exists.
 */
function lgColCount(n: number): number {
  if (n <= 4) return Math.max(1, n)
  const last3 = n % 3
  const last4 = n % 4
  const bad3 = last3 === 1
  const bad4 = last4 === 1
  if (bad3 && !bad4) return 4
  if (bad4 && !bad3) return 3
  return last3 === 0 ? 3 : last4 === 0 ? 4 : 3
}

/**
 * Count-aware width for each row item. The AnimateOnScroll wrapper is the flex
 * item, so the sizing must live on its className. 1-2 items get a larger card,
 * 3-4 sit in a full row, 5+ wrap into centred rows.
 */
function rowItemClass(n: number): string {
  if (n <= 1) return 'w-full max-w-md lg:max-w-lg'
  if (n === 2) return 'w-full max-w-sm sm: lg:max-w-md'
  return lgColCount(n) === 4
    ? 'w-full max-w-sm sm: lg:'
    : 'w-full max-w-sm sm: lg:'
}


export default function LatestWork() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const caseStudies = config?.caseStudies || []

  if (!Array.isArray(caseStudies) || caseStudies.length === 0) return null

  const title = config?.caseStudiesTitle || pc.caseStudiesTitle || 'Latest Work'
  const subtitle = config?.caseStudiesSubtitle || pc.caseStudiesSubtitle || 'Case Studies'

  return (
    <section id="latest-work" className="section-padding ambient-glow" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>{subtitle}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            {title}
          </h2>
        </AnimateOnScroll>

        <div className="flex flex-wrap justify-center gap-8">
          {caseStudies.map((study: any, i: number) => {
            const tags: string[] = Array.isArray(study.tags) ? study.tags : []
            return (
              <AnimateOnScroll key={i} delay={i * 100} className={rowItemClass(caseStudies.length)}>
                <article className="card hover-lift rounded-2xl overflow-hidden border h-full flex flex-col transition-all duration-300"
                  style={{ background: 'var(--color-bg)', borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                  {study.image && (
                    <div className="aspect-[16/10] overflow-hidden">
                      <img src={study.image} alt={study.title || ''} loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold mb-2"
                      style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                      {study.title}
                    </h3>
                    {study.summary && (
                      <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-muted)' }}>{study.summary}</p>
                    )}
                    {study.result && (
                      <div className="rounded-xl px-4 py-3 mb-4 text-sm font-semibold"
                        style={{ background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)', color: 'var(--safe-eyebrow)' }}>
                        {study.result}
                      </div>
                    )}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-auto pt-2">
                        {tags.map((tag, j) => (
                          <span key={j} className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{ background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', color: 'var(--color-primary)' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              </AnimateOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
