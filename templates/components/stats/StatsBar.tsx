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
  if (n === 2) return 'w-full max-w-sm sm:w-[calc(50%_-_1rem)] lg:max-w-md'
  return lgColCount(n) === 4
    ? 'w-full max-w-sm sm:w-[calc(50%_-_1rem)] lg:w-[calc(25%_-_1.5rem)]'
    : 'w-full max-w-sm sm:w-[calc(50%_-_1rem)] lg:w-[calc(33.333%_-_1.334rem)]'
}


export default function StatsBar() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const stats = config?.stats || []

  if (!Array.isArray(stats) || stats.length === 0) return null

  const title = config?.statsTitle || pc.statsTitle || ''
  const subtitle = config?.statsSubtitle || pc.statsSubtitle || ''


  return (
    <section id="stats" className="section-padding ambient-glow" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <AnimateOnScroll className="text-center mb-12">
            {subtitle && (
              <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>{subtitle}</span>
            )}
            {title && (
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
                {title}
              </h2>
            )}
          </AnimateOnScroll>
        )}

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
          {stats.map((stat: any, i: number) => (
            <AnimateOnScroll key={i} delay={i * 100} className={rowItemClass(stats.length)}>
              <div className="relative text-center px-4 sm:px-6 py-8 sm:py-10">
                {i > 0 && (
                  <div className="hidden lg:block absolute left-0 top-1/4 bottom-1/4 w-px"
                    style={{ background: 'color-mix(in srgb, var(--color-text) 12%, transparent)' }} />
                )}
                <div className="font-bold mb-3"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', letterSpacing: '-0.025em', fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-muted)' }}>
                  {stat.label}
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
