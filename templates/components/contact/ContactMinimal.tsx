'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState } from 'react'

export default function ContactMinimal() {
  const { config } = useSiteData()
  const contact = config?.contact || {}
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setStatus('sending')
    await new Promise(r => setTimeout(r, 1000))
    setStatus('sent'); setTimeout(() => setStatus('idle'), 3000)
  }

  return (
    <section id="contact" className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll>
          <h2 className="text-3xl sm:text-4xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>Get In Touch</h2>
          <p className="mb-8" style={{ color: 'var(--color-muted)' }}>
            {contact.phone && <span>Call <a href={`tel:${contact.phone}`} style={{ color: 'var(--color-primary)' }}>{contact.phone}</a></span>}
            {contact.phone && contact.email && <span> or </span>}
            {contact.email && <span>email <a href={`mailto:${contact.email}`} style={{ color: 'var(--color-primary)' }}>{contact.email}</a></span>}
            {!contact.phone && !contact.email && 'Send us a message below.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="floating-label-group">
              <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="form-input floating-input" placeholder=" " aria-label="Your name" />
              <label className="floating-label">Name</label>
            </div>
            <div className="floating-label-group">
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="form-input floating-input" placeholder=" " aria-label="Your email address" />
              <label className="floating-label">Email</label>
            </div>
            <div className="floating-label-group">
              <textarea required rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                className="form-input floating-input" style={{ resize: 'none' }} placeholder=" " aria-label="Your message" />
              <label className="floating-label">Message</label>
            </div>
            <button type="submit" disabled={status === 'sending'} className="btn btn-md btn-primary w-full">
              {status === 'sent' ? '✓ Sent!' : status === 'sending' ? 'Sending...' : 'Send'}
            </button>
          </form>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
