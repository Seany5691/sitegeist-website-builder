'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState } from 'react'

export default function ContactMap() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const contact = config?.contact || {}

  const sectionTitle = pc.contactTitle || 'Contact Us'
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setStatus('sending')
    await new Promise(r => setTimeout(r, 1000))
    setStatus('sent'); setTimeout(() => setStatus('idle'), 3000)
  }

  const mapQuery = contact.address ? encodeURIComponent(contact.address) : ''

  return (
    <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>Get In Touch</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>{sectionTitle}</h2>
        </AnimateOnScroll>

        <div className="grid lg:grid-cols-2 gap-8">
          <AnimateOnScroll>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="form-input" placeholder="Name" />
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="form-input" placeholder="Email" />
              <textarea required rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                className="form-input" style={{ resize: 'none' }} placeholder="Message" />
              <button type="submit" disabled={status === 'sending'} className="btn btn-md btn-primary w-full">
                {status === 'sent' ? '✓ Sent!' : status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="btn btn-md btn-outline w-full">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  Call: {contact.phone}
                </a>
              )}
            </form>
          </AnimateOnScroll>

          <AnimateOnScroll delay={150}>
            {mapQuery ? (
              <iframe
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                className="w-full h-full min-h-[400px] rounded-xl border-0"
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            ) : (
              <div className="w-full h-full min-h-[400px] rounded-xl flex items-center justify-center"
                style={{ background: 'color-mix(in srgb, var(--color-primary) 5%, var(--color-bg))' }}>
                <p style={{ color: 'var(--color-muted)' }}>Map will appear here when address is provided</p>
              </div>
            )}
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  )
}
