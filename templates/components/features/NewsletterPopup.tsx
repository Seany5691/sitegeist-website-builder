'use client'

import { useEffect, useRef, useState } from 'react'
import { useSiteData } from '@/lib/use-site-data'
import { Icon } from './icons'

const FEATURE_ID = 'newsletterPopup'
const SEEN_KEY = 'nl_popup_seen'

export default function NewsletterPopup() {
  const { config } = useSiteData()
  const enabled = config?.controls?.features?.[FEATURE_ID] !== false
  const data = config?.featureData?.[FEATURE_ID] || {}

  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState('')
  // POPIA: opt-in must be an affirmative act, so this starts UNTICKED.
  const [marketingConsent, setMarketingConsent] = useState(false)
  const CONSENT_TEXT = 'Yes, send me news, specials and updates.'
  const inputRef = useRef<HTMLInputElement>(null)

  const trigger = (data.trigger === 'delay' ? 'delay' : 'scroll') as 'scroll' | 'delay'
  const scrollPercent = Number(data.scrollPercent) > 0 ? Number(data.scrollPercent) : 50
  const delaySeconds = Number(data.delaySeconds) > 0 ? Number(data.delaySeconds) : 8
  const oncePerVisitor = data.oncePerVisitor !== false

  useEffect(() => {
    if (!enabled) return

    try {
      if (oncePerVisitor && window.localStorage.getItem(SEEN_KEY) === '1') return
    } catch {
      /* storage unavailable — show every visit */
    }

    let fired = false
    const fire = () => {
      if (fired) return
      fired = true
      setOpen(true)
    }

    let timer: ReturnType<typeof setTimeout> | undefined
    let onScroll: (() => void) | undefined

    if (trigger === 'delay') {
      timer = setTimeout(fire, delaySeconds * 1000)
    } else {
      onScroll = () => {
        const doc = document.documentElement
        const max = doc.scrollHeight - window.innerHeight
        const pct = max > 0 ? (window.scrollY / max) * 100 : 0
        if (pct >= scrollPercent) fire()
      }
      window.addEventListener('scroll', onScroll, { passive: true })
    }

    return () => {
      if (timer) clearTimeout(timer)
      if (onScroll) window.removeEventListener('scroll', onScroll)
    }
  }, [enabled, trigger, scrollPercent, delaySeconds, oncePerVisitor])

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    inputRef.current?.focus()

    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const close = () => {
    setOpen(false)
    try {
      if (oncePerVisitor) window.localStorage.setItem(SEEN_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  const submit = async (e: React.FormEvent) => {
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
      try {
        if (oncePerVisitor) window.localStorage.setItem(SEEN_KEY, '1')
      } catch {
        /* ignore */
      }
    } catch {
      setFormError('Sorry, that did not go through. Please check your connection and try again.')
      setSending(false)
    }
  }

  if (!enabled || !open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ background: 'color-mix(in srgb, var(--color-text) 45%, transparent)' }}
        onClick={close}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={data.headline || 'Newsletter'}
        className="relative w-full max-w-md rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          background: 'var(--color-bg)',
          boxShadow: '0 24px 64px color-mix(in srgb, var(--color-text) 25%, transparent)',
          border: '1px solid color-mix(in srgb, var(--color-text) 8%, transparent)',
        }}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200"
          style={{
            background: 'color-mix(in srgb, var(--color-text) 6%, transparent)',
            color: 'var(--color-text)',
          }}
        >
          <Icon name="close" size={16} />
        </button>

        {data.image && (
          <div className="h-40 w-full overflow-hidden">
            <img src={data.image} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-4">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'var(--color-primary-cta)', color: 'var(--color-bg)' }}
              >
                <Icon name="check" size={22} />
              </div>
              <h3
                className="text-xl font-bold mb-2"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
              >
                You&apos;re on the list!
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                Thanks for signing up. We&apos;ll be in touch soon.
              </p>
            </div>
          ) : (
            <>
              <h3
                className="text-2xl font-bold mb-2"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.02em' }}
              >
                {data.headline || 'Stay in the loop'}
              </h3>
              {data.body && (
                <p
                  className="text-sm leading-relaxed mb-6 whitespace-pre-wrap"
                  style={{ color: 'var(--color-muted)' }}
                >
                  {data.body}
                </p>
              )}

              <form onSubmit={submit} className="space-y-3">
                <input
                  ref={inputRef}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full h-11 px-4 rounded-xl text-sm outline-none transition-shadow duration-200"
                  style={{
                    background: 'color-mix(in srgb, var(--color-text) 5%, transparent)',
                    color: 'var(--color-text)',
                    border: '1px solid color-mix(in srgb, var(--color-text) 12%, transparent)',
                    fontFamily: 'var(--font-body)',
                  }}
                />
                <label className="flex items-start gap-2.5 text-left cursor-pointer">
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
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl text-sm font-semibold transition-opacity duration-200 hover:opacity-90"
                  style={{ background: 'var(--color-primary-cta)', color: 'var(--color-bg)' }}
                >
                  {data.ctaLabel || 'Sign me up'}
                </button>
              </form>
                {formError && (
                  <p className="text-sm mt-3" role="alert" style={{ color: '#c0392b' }}>
                    {formError}
                  </p>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
