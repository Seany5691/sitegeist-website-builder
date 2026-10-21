'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

type Step = { step?: string; title?: string; description?: string; image?: string }

/** Desktop column count for a row of n items — wraps without leaving a lonely orphan when possible. */
function lgColCount(n: number): number {
  if (n <= 1) return 1
  if (n === 2) return 2
  if (n === 3) return 3
  if (n === 4) return 4
  return n % 3 === 0 ? 3 : n % 4 === 0 ? 4 : 3
}

/**
 * Count-aware width for each row item (the AnimateOnScroll wrapper is the flex item).
 * Literal class strings only, so Tailwind can see them. gap-8 = 2rem, hence the calc offsets.
 */
function rowItemClass(n: number): string {
  if (n <= 1) return 'w-full max-w-sm'
  if (n === 2) return 'w-full max-w-sm sm:max-w-md sm:w-[calc(50%_-_1rem)]'
  return lgColCount(n) === 4
    ? 'w-full max-w-sm sm:w-[calc(50%_-_1rem)] lg:w-[calc(25%_-_1.5rem)]'
    : 'w-full max-w-sm sm:w-[calc(50%_-_1rem)] lg:w-[calc(33.333%_-_1.334rem)]'
}

function StepImage({ src, alt }: { src?: string; alt: string }) {
  if (!src) return null
  return (
    <div className="rounded-2xl overflow-hidden mb-5 aspect-[4/3] img-vignette hover-zoom">
      <img src={src} alt={alt} loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
    </div>
  )
}

/** Default: numbered steps in a clean row/grid with a connecting line across the markers. */
function ProcessStepList({ steps }: { steps: Step[] }) {
  const n = steps.length
  const cols = lgColCount(n)
  const showLine = n >= 3 && n === cols
  const inset = `calc(100% / ${cols} / 2)`

  return (
    <div className="relative">
      {showLine && (
        <div className="hidden lg:block absolute top-12 h-px"
          style={{
            left: inset,
            right: inset,
            background: 'color-mix(in srgb, var(--color-primary) 25%, transparent)',
          }} />
      )}

      <div className="flex flex-wrap justify-center gap-8">
        {steps.map((s: Step, i: number) => (
          <AnimateOnScroll key={i} delay={i * 120} className={rowItemClass(n)}>
            <div className="relative text-center group">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 relative z-10 transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: 'var(--color-primary-cta)',
                  color: 'var(--color-bg)',
                  fontFamily: 'var(--font-heading)',
                  boxShadow: '0 8px 24px color-mix(in srgb, var(--color-accent) 35%, transparent)',
                }}>
                {s.step || i + 1}
              </div>

              <StepImage src={s.image} alt={s.title || ''} />

              <h3 className="text-lg sm:text-xl font-bold mb-2"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                {s.title}
              </h3>
              {s.description && (
                <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: 'var(--color-muted)' }}>
                  {s.description}
                </p>
              )}
            </div>
          </AnimateOnScroll>
        ))}
      </div>
    </div>
  )
}

/** Vertical timeline: connecting line, alternating step cards on desktop, left-aligned on mobile. */
function ProcessTimeline({ steps }: { steps: Step[] }) {
  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Connecting line */}
      <div className="absolute top-0 bottom-0 w-0.5 left-[21px] sm:left-1/2 sm:-translate-x-1/2"
        style={{ background: 'color-mix(in srgb, var(--color-primary) 22%, transparent)' }} />

      <div className="space-y-12 sm:space-y-16">
        {steps.map((s: Step, i: number) => {
          const flip = i % 2 === 1
          return (
            <AnimateOnScroll key={i} delay={i * 120} className="relative group">
              {/* Marker sitting on the line */}
              <div className="absolute left-[22px] top-6 sm:left-1/2 sm:top-1/2 z-10 -translate-x-1/2 sm:-translate-y-1/2">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: 'var(--color-primary-cta)',
                    color: 'var(--color-bg)',
                    fontFamily: 'var(--font-heading)',
                    boxShadow: '0 10px 30px color-mix(in srgb, var(--color-accent) 35%, transparent)',
                    border: '3px solid color-mix(in srgb, var(--color-bg) 85%, var(--color-primary))',
                  }}>
                  {s.step || i + 1}
                </div>
              </div>

              <div className="pl-16 sm:pl-0 sm:grid sm:grid-cols-2 sm:gap-x-20 sm:items-center">
                <div className={`${flip ? 'sm:col-start-2' : 'sm:col-start-1'} ${flip ? 'sm:text-left' : 'sm:text-right'}`}>
                  <div className="rounded-2xl p-6 sm:p-7 border transition-all duration-300 group-hover:shadow-xl"
                    style={{
                      background: 'color-mix(in srgb, var(--color-bg) 92%, var(--color-primary))',
                      borderColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                      boxShadow: '0 10px 40px color-mix(in srgb, var(--color-primary) 6%, transparent)',
                    }}>
                    {s.image && (
                      <div className="rounded-xl overflow-hidden mb-4 aspect-[16/10] img-vignette hover-zoom">
                        <img src={s.image} alt={s.title || ''} loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    )}
                    <h3 className="text-xl sm:text-2xl font-bold mb-2"
                      style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                      {s.title}
                    </h3>
                    {s.description && (
                      <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                        {s.description}
                      </p>
                    )}
                    <div className="w-10 h-1 rounded-full mt-5" style={{ background: 'var(--color-primary-cta)' }} />
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          )
        })}
      </div>
    </div>
  )
}

/** Rich cards with a large ghost numeral behind the content. */
function ProcessCards({ steps }: { steps: Step[] }) {
  const n = steps.length

  return (
    <div className="flex flex-wrap justify-center gap-8">
      {steps.map((s: Step, i: number) => (
        <AnimateOnScroll key={i} delay={i * 120} className={rowItemClass(n)}>
          <div className="relative h-full rounded-2xl overflow-hidden border p-8 pt-10 group hover-lift transition-all duration-300"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
              boxShadow: '0 20px 50px color-mix(in srgb, var(--color-primary) 8%, transparent)',
            }}>
            {/* Decorative accent bloom */}
            <div className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl transition-opacity duration-500 opacity-60"
              style={{ background: 'color-mix(in srgb, var(--color-accent) 18%, transparent)' }} />

            {/* Ghost numeral — lifted above the photo so the number is never hidden.
                Over an image it uses the card background tint + a soft halo so it
                still reads as a large translucent numeral; without an image it
                stays the quiet watermark on the card surface. */}
            <div className="pointer-events-none absolute top-2 right-5 z-20 text-8xl sm:text-9xl font-bold leading-none select-none transition-transform duration-500 group-hover:scale-110"
              style={{
                fontFamily: 'var(--font-heading)',
                color: s.image
                  ? 'color-mix(in srgb, var(--color-bg) 82%, transparent)'
                  : 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                letterSpacing: '-0.04em',
                textShadow: s.image
                  ? '0 4px 28px color-mix(in srgb, var(--color-text) 40%, transparent)'
                  : 'none',
              }}>
              {s.step || i + 1}
            </div>

            <div className="relative">
              {s.image && (
                <div className="rounded-xl overflow-hidden mb-5 aspect-[4/3] img-vignette hover-zoom">
                  <img src={s.image} alt={s.title || ''} loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
              )}

              <h3 className="text-xl sm:text-2xl font-bold mb-3 max-w-[85%]"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                {s.title}
              </h3>
              {s.description && (
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  {s.description}
                </p>
              )}
              <div className="w-10 h-1 rounded-full mt-6" style={{ background: 'var(--color-primary-cta)' }} />
            </div>
          </div>
        </AnimateOnScroll>
      ))}
    </div>
  )
}

export default function ProcessSteps() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const steps = config?.process || []

  if (!Array.isArray(steps) || steps.length === 0) return null

  const title = config?.processTitle || pc.processTitle || 'Our Process'
  const subtitle = config?.processSubtitle || pc.processSubtitle || 'How We Work'
  const layout = config?.processLayout === 'timeline' ? 'timeline' : config?.processLayout === 'cards' ? 'cards' : 'steps'

  return (
    <section id="process" className="section-padding ambient-glow" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>{subtitle}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            {title}
          </h2>
        </AnimateOnScroll>

        {layout === 'timeline' ? (
          <ProcessTimeline steps={steps} />
        ) : layout === 'cards' ? (
          <ProcessCards steps={steps} />
        ) : (
          <ProcessStepList steps={steps} />
        )}
      </div>
    </section>
  )
}
