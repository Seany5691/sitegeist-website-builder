'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

/** Desktop column count for n members — avoids a lonely orphan card when possible. */
function lgColCount(n: number): number {
  if (n <= 1) return 1
  if (n === 2) return 2
  if (n === 3) return 3
  if (n === 4) return 4
  return n % 3 === 0 ? 3 : n % 4 === 0 ? 4 : 3
}

/**
 * Count-aware width for each member (the AnimateOnScroll wrapper is the flex item).
 * Literal class strings only, so Tailwind can see them. gap-8 = 2rem, hence the calc offsets.
 */
function rowItemClass(n: number): string {
  if (n <= 1) return 'w-full max-w-sm'
  if (n === 2) return 'w-full max-w-sm sm:max-w-md sm:w-[calc(50%-1rem)]'
  return lgColCount(n) === 4
    ? 'w-full max-w-xs sm:max-w-sm sm:w-[calc(50%_-_1rem)] lg:max-w-md lg:w-[calc(25%_-_1.5rem)]'
    : 'w-full max-w-xs sm:max-w-sm sm:w-[calc(50%_-_1rem)] lg:max-w-md lg:w-[calc(33.333%_-_1.334rem)]'
}

/**
 * Our Team page — full-page view. Renders nothing when there is no content,
 * so turning the page on with no data never shows a broken block.
 */
export default function OurTeamPage() {
  const { config } = useSiteData()
  const team = config?.team || []
  if (!config) return null
  if (!Array.isArray(team) || team.length === 0) return null

  const itemClass = rowItemClass(team.length)

  return (
    <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: 'var(--safe-eyebrow)' }}
          >
            The people behind the business
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}
          >
            Our Team
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
            Meet the people who make it happen.
          </p>
        </AnimateOnScroll>

        <div className="flex flex-wrap justify-center gap-8">
          {team.map((member: any, i: number) => {
            const photo = member.photoUrl || member.imageUrl || ''
            return (
              <AnimateOnScroll key={i} delay={i * 100} className={itemClass}>
                <div className="text-center group hover-lift h-full">
                  <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-5 transition-transform duration-500 group-hover:scale-105">
                    {photo ? (
                      <img src={photo} alt={member.name || ''} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold"
                        style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
                        {member.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold"
                    style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                    {member.name}
                  </h3>
                  {member.role && (
                    <p className="text-sm font-semibold mt-1" style={{ color: 'var(--safe-eyebrow)' }}>{member.role}</p>
                  )}
                  {member.bio && (
                    <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--color-muted)' }}>{member.bio}</p>
                  )}
                </div>
              </AnimateOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
