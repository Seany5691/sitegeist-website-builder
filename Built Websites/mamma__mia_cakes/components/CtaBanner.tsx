'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default function CtaBanner() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}

  const title = pc.ctaTitle || ''
  const text = pc.ctaText || ''
  const ctaText = config?.hero?.ctaText || 'Get Started'
  const ctaLink = config?.hero?.ctaLink || '#contact'

  if (!title && !text) return null

  return (
    <section id="cta" style={{ background: 'var(--color-primary)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
        <AnimateOnScroll>
          {title && (
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}>
              {title}
            </h2>
          )}
          {text && (
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              {text}
            </p>
          )}
          <a href={ctaLink} className="btn btn-lg"
            style={{ background: '#fff', color: 'var(--color-primary)' }}>
            {ctaText}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
