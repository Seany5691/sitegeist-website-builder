'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default function AwardsPress() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const awards = config?.awards || []

  if (!Array.isArray(awards) || awards.length === 0) return null

  const title = config?.awardsTitle || pc.awardsTitle || 'Awards & Press'
  const subtitle = config?.awardsSubtitle || pc.awardsSubtitle || 'Recognition'

  return (
    <section id="awards" className="section-padding ambient-glow" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>{subtitle}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            {title}
          </h2>
        </AnimateOnScroll>

        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border overflow-hidden"
            style={{ background: 'var(--color-bg)', borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
            {awards.map((award: any, i: number) => {
              const body = (
                <div className="flex items-center gap-5 px-6 sm:px-8 py-6 transition-colors duration-200"
                  style={{ borderBottom: i < awards.length - 1 ? '1px solid color-mix(in srgb, var(--color-text) 8%, transparent)' : 'none' }}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center flex-none"
                    style={{ background: 'color-mix(in srgb, var(--color-accent) 14%, transparent)', color: 'var(--safe-eyebrow)' }}>
                    <i className="fas fa-award" aria-hidden="true"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold leading-snug"
                      style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.015em' }}>
                      {award.title}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
                      {award.issuer}{award.issuer && award.year ? ' · ' : ''}{award.year}
                    </p>
                  </div>
                  {award.image && (
                    <img src={award.image} alt="" loading="lazy" className="hidden sm:block w-12 h-12 rounded-lg object-contain flex-none" />
                  )}
                  {award.url && (
                    <i className="fas fa-arrow-up-right-from-square text-xs flex-none" style={{ color: 'var(--safe-eyebrow)' }} aria-hidden="true"></i>
                  )}
                </div>
              )
              return (
                <AnimateOnScroll key={i} delay={i * 80}>
                  {award.url ? (
                    <a href={award.url} target="_blank" rel="noopener noreferrer" className="block">{body}</a>
                  ) : (
                    body
                  )}
                </AnimateOnScroll>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
