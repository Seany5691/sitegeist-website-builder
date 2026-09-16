'use client'

import { useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    question: 'What areas do you service?',
    answer: 'We are based in Lephalale and primarily provide security services throughout the Lephalale region and surrounding areas in Limpopo.',
  },
  {
    question: 'Are your security officers trained and registered?',
    answer: 'Yes. All our security personnel undergo rigorous training and are registered with the Private Security Industry Regulatory Authority (PSiRA) as required by law.',
  },
  {
    question: 'How can I get a quote for security services?',
    answer: 'You can contact our office directly at 014 004 0336 or email contact@lekwasecurityservices.co.za for a free, no-obligation consultation and quote tailored to your needs.',
  },
  {
    question: 'Do you offer 24/7 monitoring?',
    answer: 'Yes, our armed response and monitoring services operate 24 hours a day, 7 days a week, 365 days a year. We never close.',
  },
  {
    question: 'What technology do you use for surveillance?',
    answer: 'We utilize cutting-edge drone technology for aerial surveillance, combined with traditional CCTV and alarm systems. Our drones provide large-area coverage that traditional systems cannot match.',
  },
]

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="relative py-20 md:py-28 bg-slate-900/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-primary/80 mb-3 block">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400">
            Find answers to common questions about our security services.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-white/[0.06] rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex items-center justify-between w-full p-5 text-left hover:bg-white/[0.02] transition-colors"
                aria-expanded={openIndex === i}
              >
                <span className="text-white font-medium pr-4">{faq.question}</span>
                <span className="flex-shrink-0 text-primary">
                  {openIndex === i ? (
                    <Minus className="w-5 h-5" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </span>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <m.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-gray-400 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* FAQPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </section>
  )
}
