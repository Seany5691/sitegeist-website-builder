'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState } from 'react'

export default function ContactMinimal() {
  const { config } = useSiteData()
  const contact = config?.contact || {}
  const hours = config?.businessHours || []
  const showHours = config?.showBusinessHours !== false && Array.isArray(hours) && hours.length > 0
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState({ type: 'success' as 'success' | 'error', text: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
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
      setToastMessage({ type: 'success', text: data.message || "Message sent successfully! We'll be in touch soon." })
      setShowToast(true)
      setTimeout(() => {
        setForm({ name: '', email: '', phone: '', message: '' })
        setStatus('idle')
        setShowToast(false)
      }, 3000)
    } catch (error: any) {
      setStatus('idle')
      setToastMessage({ type: 'error', text: error?.message || 'Failed to send message. Please try again.' })
      setShowToast(true)
      setTimeout(() => setShowToast(false), 5000)
    }
  }

  return (
    <section id="contact" className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className={`${showHours ? 'max-w-6xl' : 'max-w-xl'} mx-auto px-4 sm:px-6 lg:px-8`}>
        <AnimateOnScroll>
          <h2 className="text-3xl sm:text-4xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>Get In Touch</h2>
          <p className="mb-8" style={{ color: 'var(--color-muted)' }}>
            {contact.phone && <span>Call <a href={`tel:${contact.phone}`} style={{ color: 'var(--color-primary)' }}>{contact.phone}</a></span>}
            {contact.phone && contact.email && <span> or </span>}
            {contact.email && <span>email <a href={`mailto:${contact.email}`} style={{ color: 'var(--color-primary)' }}>{contact.email}</a></span>}
            {!contact.phone && !contact.email && 'Send us a message below.'}
          </p>
        </AnimateOnScroll>

        <div className={`grid gap-10 ${showHours ? 'lg:grid-cols-2 items-stretch' : ''}`}>
        <AnimateOnScroll>
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
              {status === 'sent' ? '? Sent!' : status === 'sending' ? 'Sending...' : 'Send'}
            </button>
          </form>
        </AnimateOnScroll>

        {showHours && (
          <AnimateOnScroll delay={100} className={showHours ? 'h-full' : ''}>
            <div className="rounded-2xl border p-6 sm:p-8 h-full"
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
                    <span style={{ color: row.closed ? 'var(--color-muted)' : 'var(--color-primary)', fontWeight: 500 }}>
                      {row.closed ? 'Closed' : `${row.opens || '09:00'} - ${row.closes || '17:00'}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        )}
        </div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className={`toast toast-${toastMessage.type}`}>
          {toastMessage.text}
          <div className="toast-progress" style={{ animationDuration: '3s' }} />
          <button className="toast-dismiss" onClick={() => setShowToast(false)} aria-label="Dismiss notification">?</button>
        </div>
      )}
    </section>
  )
}
