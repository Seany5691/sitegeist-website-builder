'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState, useRef } from 'react'

export default function FaqCards() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const faqs = config?.faq || []
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const sectionTitle = pc.faqTitle || 'Frequently Asked Questions'
  const sectionSubtitle = pc.faqSubtitle || 'Questions & Answers'

  if (faqs.length === 0) return null

  return (
    <section id="faq" className="section-padding ambient-glow" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>{sectionSubtitle}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>{sectionTitle}</h2>
        </AnimateOnScroll>

        <div className="grid sm:grid-cols-2 gap-4">
          {faqs.map((faq: any, i: number) => (
            <AnimateOnScroll key={i} delay={i * 80}>
              <div className="rounded-xl border overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md"
                style={{ borderColor: openIndex === i ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-text) 8%, transparent)', background: 'var(--color-bg)' }}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                <div className="p-5 flex items-start justify-between gap-3">
                  <h3 className="font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>{faq.question}</h3>
                  <span 
                    className="flex-shrink-0 text-lg transition-transform duration-300" 
                    style={{ 
                      color: 'var(--color-primary)',
                      transform: openIndex === i ? 'rotate(45deg)' : 'rotate(0deg)'
                    }}
                  >
                    +
                  </span>
                </div>
                <div className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: openIndex === i ? (contentRef.current?.scrollHeight ? contentRef.current.scrollHeight + 'px' : '500px') : '0', opacity: openIndex === i ? 1 : 0 }}>
                  <div ref={contentRef} className="px-5 pb-5" style={{ color: 'var(--color-muted)' }}>{faq.answer}</div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
