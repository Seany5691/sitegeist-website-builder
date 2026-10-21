'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState } from 'react'

export default function NewsletterBlock() {
  const { config } = useSiteData()
  const newsletter = config?.newsletter || {}

  const headline = newsletter.headline || ''
  const body = newsletter.body || ''
  const ctaLabel = newsletter.ctaLabel || 'Subscribe'

  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState('')
  // POPIA: opt-in must be an affirmative act, so this starts UNTICKED.
  const [marketingConsent, setMarketingConsent] = useState(false)
  const CONSENT_TEXT = 'Yes, send me news, specials and updates.'

  if (!headline && !body) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || sending) return
    setSending(true)
    setFormError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'newsletter',
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
          email,
          marketingConsent,
          marketingConsentText: CONSENT_TEXT,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.success) {
        setFormError(json.message || 'Sorry, that did not go through. Please try again.')
        setSending(false)
        return
      }
      setSubmitted(true)
    } catch {
      setFormError('Sorry, that did not go through. Please check your connection and try again.')
      setSending(false)
    }
  }

  return (
    <section id="newsletter" className="section-padding ambient-glow" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, var(--color-bg))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll>
          <div className="rounded-2xl border px-6 sm:px-10 lg:px-16 py-12 sm:py-14 text-center max-w-3xl mx-auto"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)',
              boxShadow: '0 20px 50px color-mix(in srgb, var(--color-primary) 8%, transparent)',
            }}>
            {headline && (
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
                {headline}
              </h2>
            )}
            {body && (
              <p className="text-base sm:text-lg max-w-xl mx-auto mb-8" style={{ color: 'var(--color-muted)' }}>
                {body}
              </p>
            )}

            {submitted ? (
              <div className="flex items-center justify-center gap-3 py-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-none"
                  style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: 'var(--color-primary)' }}>
                  <i className="fas fa-check" aria-hidden="true"></i>
                </div>
                <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
                  Thanks for subscribing!
                </p>
              </div>
            ) : (
              <>
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  aria-label="Email address"
                  className="form-input flex-1 px-5 py-3 rounded-xl border text-sm"
                  style={{
                    background: 'var(--color-bg)',
                    borderColor: 'color-mix(in srgb, var(--color-text) 12%, transparent)',
                    color: 'var(--color-text)',
                  }}
                />
                <button type="submit" className="btn btn-md btn-primary px-8 whitespace-nowrap">
                  {ctaLabel}
                </button>
              </form>
              <label className="flex items-start gap-2.5 justify-center text-left max-w-md mx-auto mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={e => setMarketingConsent(e.target.checked)}
                  className="mt-0.5 flex-none"
                  style={{ accentColor: 'var(--color-primary)', width: 16, height: 16 }}
                />
                <span className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  {CONSENT_TEXT}
                </span>
              </label>
              {formError && (
                <p className="text-sm mt-3" role="alert" style={{ color: '#c0392b' }}>
                  {formError}
                </p>
              )}
              </>
            )}
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
