'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState } from 'react'

export default function ContactCentered() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const contact = config?.contact || {}

  const sectionTitle = pc.contactTitle || 'Contact Us'
  const sectionSubtitle = pc.contactDescription || ''

  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState({ type: 'success' as 'success' | 'error', text: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    
    try {
      await new Promise(r => setTimeout(r, 1000))
      setStatus('sent')
      setToastMessage({ type: 'success', text: 'Message sent successfully! We\'ll be in touch soon.' })
      setShowToast(true)
      setTimeout(() => {
        setForm({ name: '', email: '', phone: '', message: '' })
        setStatus('idle')
        setShowToast(false)
      }, 3000)
    } catch (error) {
      setStatus('idle')
      setToastMessage({ type: 'error', text: 'Failed to send message. Please try again.' })
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  return (
    <section id="contact" className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll className="text-center mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>Get In Touch</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
            {sectionTitle}
          </h2>
          {sectionSubtitle && <p className="text-lg" style={{ color: 'var(--color-muted)' }}>{sectionSubtitle}</p>}
        </AnimateOnScroll>

        <AnimateOnScroll>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
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
            </div>
            <div className="floating-label-group">
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="form-input floating-input" placeholder=" " aria-label="Your phone number" />
              <label className="floating-label">Phone</label>
            </div>
            <div className="floating-label-group">
              <textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                className="form-input floating-input" style={{ resize: 'none' }} placeholder=" " aria-label="Your message" />
              <label className="floating-label">Message</label>
            </div>
            <button type="submit" disabled={status === 'sending'} className="btn btn-lg btn-primary w-full">
              {status === 'sent' ? '✓ Message Sent!' : status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
          </form>

          {/* Quick contact links */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                {contact.phone}
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {contact.email}
              </a>
            )}
          </div>
        </AnimateOnScroll>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className={`toast toast-${toastMessage.type}`}>
          {toastMessage.text}
          <div className="toast-progress" style={{ animationDuration: '3s' }} />
          <button className="toast-dismiss" onClick={() => setShowToast(false)} aria-label="Dismiss notification">✕</button>
        </div>
      )}
    </section>
  )
}
