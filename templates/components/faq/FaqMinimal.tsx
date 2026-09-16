'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default function FaqMinimal() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const faqs = config?.faq || []

  const sectionTitle = pc.faqTitle || 'Frequently Asked Questions'
  const sectionSubtitle = pc.faqSubtitle || 'Questions & Answers'

  if (faqs.length === 0) return null

  return (
    <section id="faq" className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>{sectionSubtitle}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>{sectionTitle}</h2>
        </AnimateOnScroll>

        <div className="space-y-8">
          {faqs.map((faq: any, i: number) => (
            <AnimateOnScroll key={i} delay={i * 80}>
              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>{faq.question}</h3>
                <p className="leading-relaxed" style={{ color: 'var(--color-muted)' }}>{faq.answer}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
