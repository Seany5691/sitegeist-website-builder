'use client'

import { useEffect, useRef, useState } from 'react'
import { useSiteData } from '@/lib/use-site-data'
import { useFloatingRightOffset } from '@/lib/floating-stack'
import { Icon } from './icons'

const FEATURE_ID = 'quoteSlideIn'

export default function QuoteSlideIn() {
  const { config } = useSiteData()
  const enabled = config?.controls?.features?.[FEATURE_ID] !== false
  const data = config?.featureData?.[FEATURE_ID] || {}

  // Stack offset — sits directly above whatever is below it (WhatsApp, Click-to-Call)
  const quoteBottom = useFloatingRightOffset('quote')

  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const firstFieldRef = useRef<HTMLInputElement>(null)

  const setField = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const t = setTimeout(() => firstFieldRef.current?.focus(), 280)
    return () => {
      window.removeEventListener('keydown', onKey)
      clearTimeout(t)
    }
  }, [open])

  if (!enabled) return null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending) return
    setSending(true)
    setFormError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'quote',
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
          name: form.name, email: form.email, phone: form.phone, message: form.message,
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
    <>
      {/* Trigger — sits on the floating stack (WhatsApp / Click-to-Call / Quote) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed z-50 inline-flex items-center gap-2.5 rounded-full font-semibold text-sm transition-transform duration-200 hover:scale-105 active:scale-95"
        style={{
          bottom: quoteBottom,
          right: '1.25rem',
          minHeight: '3.25rem',
          padding: '0 1.5rem',
          background: 'var(--color-primary-cta)',
          color: 'var(--color-bg)',
          boxShadow:
            '0 12px 32px color-mix(in srgb, var(--color-primary) 35%, transparent), 0 2px 8px color-mix(in srgb, var(--color-text) 14%, transparent)',
        }}
      >
        <Icon name="file-signature" size={20} />
        {data.buttonLabel ? (
          <span>{data.buttonLabel}</span>
        ) : (
          <>
            <span className="hidden min-[420px]:inline">Get a Quote</span>
            <span className="min-[420px]:hidden">Quote</span>
          </>
        )}
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'color-mix(in srgb, var(--color-text) 40%, transparent)' }}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={data.title || 'Request a quote'}
        aria-hidden={!open}
        className="fixed top-0 right-0 bottom-0 z-[61] w-full max-w-md overflow-y-auto transition-transform duration-300 ease-out"
        style={{
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          background: 'var(--color-bg)',
          boxShadow: '-12px 0 48px color-mix(in srgb, var(--color-text) 18%, transparent)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.02em' }}
              >
                {data.title || 'Request a quote'}
              </h2>
              {data.body && (
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-muted)' }}>
                  {data.body}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="flex-none w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200"
              style={{
                background: 'color-mix(in srgb, var(--color-text) 6%, transparent)',
                color: 'var(--color-text)',
              }}
            >
              <Icon name="close" size={16} />
            </button>
          </div>

          {submitted ? (
            <div className="text-center py-12">
              <div
                className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center"
                style={{ background: 'var(--color-primary-cta)', color: 'var(--color-bg)' }}
              >
                <Icon name="check" size={24} />
              </div>
              <h3
                className="text-xl font-bold mb-2"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
              >
                Thank you!
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                Your enquiry has been sent. We&apos;ll get back to you shortly.
              </p>
            </div>
          ) : (
            <>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                  Name
                </label>
                <input
                  ref={firstFieldRef}
                  type="text"
                  required
                  value={form.name}
                  onChange={setField('name')}
                  className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                  style={{
                    background: 'color-mix(in srgb, var(--color-text) 5%, transparent)',
                    color: 'var(--color-text)',
                    border: '1px solid color-mix(in srgb, var(--color-text) 12%, transparent)',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={setField('email')}
                  className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                  style={{
                    background: 'color-mix(in srgb, var(--color-text) 5%, transparent)',
                    color: 'var(--color-text)',
                    border: '1px solid color-mix(in srgb, var(--color-text) 12%, transparent)',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={setField('phone')}
                  className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                  style={{
                    background: 'color-mix(in srgb, var(--color-text) 5%, transparent)',
                    color: 'var(--color-text)',
                    border: '1px solid color-mix(in srgb, var(--color-text) 12%, transparent)',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={setField('message')}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-y"
                  style={{
                    background: 'color-mix(in srgb, var(--color-text) 5%, transparent)',
                    color: 'var(--color-text)',
                    border: '1px solid color-mix(in srgb, var(--color-text) 12%, transparent)',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              </div>
              <button
                type="submit"
                className="w-full h-12 rounded-xl text-sm font-semibold transition-opacity duration-200 hover:opacity-90"
                style={{ background: 'var(--color-primary-cta)', color: 'var(--color-bg)' }}
              >
                Send enquiry
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
      </aside>
    </>
  )
}
