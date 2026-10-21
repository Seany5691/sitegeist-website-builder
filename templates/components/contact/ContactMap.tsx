'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState } from 'react'

export default function ContactMap() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const contact = config?.contact || {}
  const hours = config?.businessHours || []
  const showHours = config?.showBusinessHours !== false && Array.isArray(hours) && hours.length > 0

  const sectionTitle = pc.contactTitle || 'Contact Us'
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const contentType = res.headers.get('content-type') || ''
      const data = contentType.includes('application/json') ? await res.json() : null
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to send message. Please try again.')
      }
      setStatus('sent')
      setTimeout(() => {
        setForm({ name: '', email: '', phone: '', message: '' } as typeof form)
        setStatus('idle')
      }, 3000)
    } catch {
      setStatus('idle')
      console.error('Contact form failed'); setStatus('idle')
    }
  }

  const mapQuery = contact.address ? encodeURIComponent(contact.address) : ''

  return (
    <section id="contact" className="section-padding" style={{ background: 'var(--color-bg)' }}>
      {/* Hours on: form | hours split. Hours off: form centred. Map always below. */}
      <div className={`${showHours ? 'max-w-6xl' : 'max-w-2xl'} mx-auto px-4 sm:px-6 lg:px-8`}>
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--safe-eyebrow)' }}>Get In Touch</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>{sectionTitle}</h2>
        </AnimateOnScroll>

        <div className={`grid gap-10 ${showHours ? 'lg:grid-cols-2 items-stretch' : ''}`}>
          <AnimateOnScroll className={showHours ? 'h-full' : 'w-full'}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
              <div className="floating-label-group">
                <input type="text" required value={form.name} aria-label="Your name" onChange={e => setForm({ ...form, name: e.target.value })}}
                  className="form-input floating-input" placeholder=" " aria-label="Your name" />
                <label className="floating-label">Name</label>
              </div>
              <div className="floating-label-group">
                <input type="email" required value={form.email} aria-label="Your email" onChange={e => setForm({ ...form, email: e.target.value })}}
                  className="form-input floating-input" placeholder=" " aria-label="Your email address" />
                <label className="floating-label">Email</label>
              </div>
              <div className="floating-label-group flex-1 flex flex-col min-h-[120px]">
                <textarea required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  className="form-input floating-input flex-1 h-full" style={{ resize: 'none' }} placeholder=" " aria-label="Your message" />
                <label className="floating-label">Message</label>
              </div>
              <button type="submit" disabled={status === 'sending'} className="btn btn-md btn-primary w-full">
                {status === 'sent' ? '? Sent!' : status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="btn btn-md btn-outline w-full">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  Call: {contact.phone}
                </a>
              )}
            </form>
          </AnimateOnScroll>

          {/* Hours panel — right half of the split */}
          {showHours && (
            <AnimateOnScroll delay={100} className={showHours ? 'h-full' : ''}>
              <div className="rounded-2xl border p-6 sm:p-8"
                style={{
                  borderColor: 'color-mix(in srgb, var(--color-text) 10%, transparent)',
                  background: 'color-mix(in srgb, var(--color-primary) 4%, var(--color-bg))',
                }}>
                <h3 className="text-xl font-bold mb-6" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                  Business Hours
                </h3>
                <div className="space-y-3">
                  {hours.map((row: any, i: number) => (
                    <div key={row.dayOfWeek || i} className="flex items-center justify-between gap-4 py-2"
                      style={{ borderBottom: i < hours.length - 1 ? '1px solid color-mix(in srgb, var(--color-text) 8%, transparent)' : 'none' }}>
                      <span className="font-medium" style={{ color: 'var(--color-text)' }}>{row.dayOfWeek}</span>
                      <span style={{ color: (row.closed || row.opens === 'Closed') ? 'var(--color-muted)' : 'var(--color-primary)', fontWeight: 500 }}>
                        {(row.closed || row.opens === 'Closed') ? 'Closed' : `${row.opens || '09:00'} - ${row.closes || '17:00'}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>
          )}
        </div>

        {/* Map always available, below the form/hours block */}
        <AnimateOnScroll delay={150}>
          <div className="mt-12">
            {mapQuery ? (
              <iframe
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                className="w-full min-h-[400px] rounded-xl border-0"
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            ) : (
              <div className="w-full min-h-[400px] rounded-xl flex items-center justify-center"
                style={{ background: 'color-mix(in srgb, var(--color-primary) 5%, var(--color-bg))' }}>
                <p style={{ color: 'var(--color-muted)' }}>Map will appear here when address is provided</p>
              </div>
            )}
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
