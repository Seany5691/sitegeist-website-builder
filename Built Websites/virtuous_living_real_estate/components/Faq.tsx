'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState } from 'react'

export default function FaqAccordion() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const faqs = config?.faq || []
  const [openIndex, setOpenIndex] = useState(0)

  const sectionTitle = pc.faqTitle || 'Frequently Asked Questions'
  const sectionSubtitle = pc.faqSubtitle || 'Questions & Answers'

  if (faqs.length === 0) return null

  return (
    <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>{sectionSubtitle}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            {sectionTitle}
          </h2>
        </AnimateOnScroll>

        <AnimateOnScroll>
          <div className="space-y-3">
            {faqs.map((faq: any, i: number) => (
              <div key={i} className="rounded-xl border overflow-hidden transition-all duration-300"
                style={{ borderColor: openIndex === i ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                <button onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                  style={{ background: openIndex === i ? 'color-mix(in srgb, var(--color-primary) 5%, var(--color-bg))' : 'var(--color-bg)' }}>
                  <span className="text-lg font-bold pr-4" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
                    {faq.question}
                  </span>
                  <span className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                    {openIndex === i ? (
                      <svg className="w-4 h-4" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </span>
                </button>
                <div className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: openIndex === i ? '200px' : '0', opacity: openIndex === i ? 1 : 0 }}>
                  <div className="px-6 pb-5 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
