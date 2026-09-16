'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState } from 'react'

export default function ContactSplit() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const contact = config?.contact || {}
  const hours = config?.businessHours || []

  const sectionTitle = pc.contactTitle || 'Contact Us'
  const sectionSubtitle = pc.contactDescription || ''

  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    await new Promise(r => setTimeout(r, 1000))
    setStatus('sent')
    setTimeout(() => setStatus('idle'), 3000)
  }

  return (
    <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-16">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>Get In Touch</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            {sectionTitle}
          </h2>
          {sectionSubtitle && <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>{sectionSubtitle}</p>}
        </AnimateOnScroll>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <AnimateOnScroll>
            <form onSubmit={handleSubmit} className="rounded-2xl p-8 border space-y-5"
              style={{ background: 'color-mix(in srgb, var(--color-primary) 2%, var(--color-bg))', borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="form-label">Name</label>
                  <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="form-input"
                    placeholder="Your name" />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="form-input"
                    placeholder="your@email.com" />
                </div>
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="form-input"
                  placeholder="Your phone number" />
              </div>
              <div>
                <label className="form-label">Message</label>
                <textarea required rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  className="form-input"
                  style={{ resize: 'none' }}
                  placeholder="Tell us about your needs..." />
              </div>
              <button type="submit" disabled={status === 'sending'} className="btn btn-lg btn-primary w-full">
                {status === 'sent' ? '✓ Thank you! We\'ll be in touch.' : status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </AnimateOnScroll>

          {/* Info */}
          <AnimateOnScroll delay={150}>
            <div className="space-y-6">
              {contact.phone && (
                <div className="flex items-start gap-4 p-5 rounded-xl border"
                  style={{ borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                    <svg className="w-6 h-6" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold mb-1" style={{ color: 'var(--color-text)' }}>Call Us</h3>
                    <a href={`tel:${contact.phone}`} className="text-lg font-medium" style={{ color: 'var(--color-primary)' }}>{contact.phone}</a>
                  </div>
                </div>
              )}

              {contact.email && (
                <div className="flex items-start gap-4 p-5 rounded-xl border"
                  style={{ borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                    <svg className="w-6 h-6" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold mb-1" style={{ color: 'var(--color-text)' }}>Email</h3>
                    <a href={`mailto:${contact.email}`} style={{ color: 'var(--color-primary)' }}>{contact.email}</a>
                  </div>
                </div>
              )}

              {contact.address && (
                <div className="flex items-start gap-4 p-5 rounded-xl border"
                  style={{ borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                    <svg className="w-6 h-6" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold mb-1" style={{ color: 'var(--color-text)' }}>Location</h3>
                    <p style={{ color: 'var(--color-muted)' }}>{contact.address}</p>
                  </div>
                </div>
              )}

              {hours.length > 0 && (
                <div className="p-5 rounded-xl border"
                  style={{ borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                  <h3 className="font-bold mb-3" style={{ color: 'var(--color-text)' }}>Business Hours</h3>
                  <div className="space-y-2">
                    {hours.map((h: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span style={{ color: 'var(--color-muted)' }}>{h.dayOfWeek}</span>
                        <span className="font-medium" style={{ color: h.opens === 'Closed' ? '#ef4444' : 'var(--color-text)' }}>
                          {h.opens === 'Closed' ? 'Closed' : `${h.opens} - ${h.closes}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  )
}
