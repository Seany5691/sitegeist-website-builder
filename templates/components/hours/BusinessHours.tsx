'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

function isToday(dayOfWeek: any, todayIndex: number): boolean {
  if (dayOfWeek === undefined || dayOfWeek === null) return false
  if (typeof dayOfWeek === 'number') {
    // Accept both 0=Sunday and 1=Monday conventions
    return dayOfWeek === todayIndex || dayOfWeek === ((todayIndex + 6) % 7) + 1
  }
  const normalized = String(dayOfWeek).trim().toLowerCase()
  const todayName = DAY_NAMES[todayIndex]
  return normalized === todayName || normalized === todayName.slice(0, 3)
}

export default function BusinessHours() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const hours = config?.businessHours || []

  if (!Array.isArray(hours) || hours.length === 0) return null

  const title = config?.businessHoursTitle || pc.businessHoursTitle || 'Business Hours'
  const subtitle = config?.businessHoursSubtitle || pc.businessHoursSubtitle || 'When to Find Us'
  const todayIndex = new Date().getDay()

  return (
    <section id="hours" className="section-padding ambient-glow" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>{subtitle}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            {title}
          </h2>
        </AnimateOnScroll>

        <AnimateOnScroll className="max-w-2xl mx-auto">
          <div className="rounded-2xl border overflow-hidden"
            style={{ background: 'var(--color-bg)', borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
            {hours.map((row: any, i: number) => {
              const today = isToday(row.dayOfWeek, todayIndex)
              const closed = row.closed || (!row.opens && !row.closes)
              return (
                <div key={row.dayOfWeek ?? i}
                  className="flex items-center justify-between gap-4 px-6 sm:px-8 py-4 transition-colors duration-200"
                  style={{
                    background: today ? 'color-mix(in srgb, var(--color-primary) 8%, transparent)' : 'transparent',
                    borderBottom: i < hours.length - 1 ? '1px solid color-mix(in srgb, var(--color-text) 8%, transparent)' : 'none',
                    borderLeft: today ? '3px solid var(--color-accent)' : '3px solid transparent',
                  }}>
                  <div className="flex items-center gap-3">
                    <span className="font-medium" style={{ color: 'var(--color-text)' }}>{row.dayOfWeek}</span>
                    {today && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider"
                        style={{ background: 'var(--color-primary-cta)', color: 'var(--color-bg)' }}>
                        Today
                      </span>
                    )}
                  </div>
                  <span className="text-sm sm:text-base font-semibold tabular-nums"
                    style={{ color: closed ? 'var(--color-muted)' : 'var(--color-primary)' }}>
                    {(() => {
                      if (closed) return 'Closed'
                      const opens = String(row.opens || '09:00').trim()
                      const closes = String(row.closes || '17:00').trim()
                      // Special hours like "Emergency only" — show once, not twice
                      if (!closes || opens === closes) return opens
                      return `${opens} – ${closes}`
                    })()}
                  </span>
                </div>
              )
            })}
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
