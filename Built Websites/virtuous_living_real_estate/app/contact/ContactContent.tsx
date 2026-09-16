'use client'

import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState } from 'react'

export default function ContactContent() {
  const { config } = useSiteData()
  const pc = config?.pageContent || {}
  const contact = config?.contact || {}
  const businessHours = config?.businessHours || []

  const sectionTitle = pc.contactTitle || 'Get In Touch'
  const sectionDescription = pc.contactDescription || ''

  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    await new Promise(r => setTimeout(r, 1000))
    setStatus('sent')
    setTimeout(() => setStatus('idle'), 3000)
  }

  const isOpen = () => {
    const now = new Date()
    const day = now.toLocaleDateString('en-US', { weekday: 'long' })
    const today = businessHours.find((h: any) => h.dayOfWeek === day)
    if (!today || today.opens === 'Closed') return false
    const [openH, openM] = today.opens.split(':').map(Number)
    const [closeH, closeM] = today.closes.split(':').map(Number)
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    return currentMinutes >= openH * 60 + openM && currentMinutes < closeH * 60 + closeM
  }

  return (
    <>
      {/* Hero Banner */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80)' }} />
        <div className="absolute inset-0" style={{ background: 'color-mix(in srgb, var(--color-primary) 85%, transparent)' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-white/70">Contact</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mt-3 mb-4"
            style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}>
            {sectionTitle}
          </h1>
          {sectionDescription && (
            <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">{sectionDescription}</p>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <AnimateOnScroll>
              <div className="p-8 rounded-xl border"
                style={{ background: 'var(--color-bg)', borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
                  Send Us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="form-label">Your Name</label>
                    <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="form-input" placeholder="Enter your full name" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Email Address</label>
                      <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                        className="form-input" placeholder="your@email.com" />
                    </div>
                    <div>
                      <label className="form-label">Phone Number</label>
                      <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                        className="form-input" placeholder="072 108 3360" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">How Can We Help?</label>
                    <select value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}
                      className="form-input">
                      <option value="">Select a service...</option>
                      <option value="buying">Buying a Property</option>
                      <option value="selling">Selling a Property</option>
                      <option value="consultation">Property Consultation</option>
                      <option value="investment">Investment Advice</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Your Message</label>
                    <textarea required rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                      className="form-input" style={{ resize: 'none' }} placeholder="Tell us about your property needs..." />
                  </div>
                  {/* Honeypot */}
                  <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
                    <input type="text" tabIndex={-1} autoComplete="off" />
                  </div>
                  <button type="submit" disabled={status === 'sending'} className="btn btn-lg btn-primary w-full">
                    {status === 'sent' ? 'Thank You! We\'ll respond within 24 hours' : status === 'sending' ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </AnimateOnScroll>

            {/* Info */}
            <AnimateOnScroll delay={150}>
              <div className="space-y-8">
                {/* Contact Details */}
                <div className="p-8 rounded-xl border"
                  style={{ background: 'var(--color-bg)', borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                  <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
                    Contact Details
                  </h3>
                  <div className="space-y-4">
                    {contact.phone && (
                      <a href={`tel:${contact.phone}`} className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                          <svg className="w-5 h-5" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm" style={{ color: 'var(--color-muted)' }}>Phone</div>
                          <div className="font-semibold group-hover:underline" style={{ color: 'var(--color-text)' }}>
                            {contact.phone.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '+$1 $2 $3 $4')}
                          </div>
                        </div>
                      </a>
                    )}
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                          <svg className="w-5 h-5" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm" style={{ color: 'var(--color-muted)' }}>Email</div>
                          <div className="font-semibold group-hover:underline" style={{ color: 'var(--color-text)' }}>{contact.email}</div>
                        </div>
                      </a>
                    )}
                    {contact.address && (
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                          <svg className="w-5 h-5" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm" style={{ color: 'var(--color-muted)' }}>Location</div>
                          <div className="font-semibold" style={{ color: 'var(--color-text)' }}>{contact.address}</div>
                        </div>
                      </div>
                    )}
                    {contact.whatsapp && (
                      <a href={`https://wa.me/${contact.whatsapp}?text=Hi%20Virtuous%20Living%20Real%20Estate`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'color-mix(in srgb, #25D366 15%, transparent)' }}>
                          <svg className="w-5 h-5" style={{ color: '#25D366' }} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm" style={{ color: 'var(--color-muted)' }}>WhatsApp</div>
                          <div className="font-semibold group-hover:underline" style={{ color: 'var(--color-text)' }}>Chat with us</div>
                        </div>
                      </a>
                    )}
                  </div>
                </div>

                {/* Business Hours */}
                {businessHours.length > 0 && (
                  <div className="p-8 rounded-xl border"
                    style={{ background: 'var(--color-bg)', borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
                        Business Hours
                      </h3>
                      <span className="text-sm font-semibold px-3 py-1 rounded-full"
                        style={{
                          background: isOpen() ? 'color-mix(in srgb, #059669 15%, transparent)' : 'color-mix(in srgb, #dc2626 15%, transparent)',
                          color: isOpen() ? '#059669' : '#dc2626'
                        }}>
                        {isOpen() ? 'Open Now' : 'Closed'}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {businessHours.map((hour: any, i: number) => (
                        <div key={i} className="flex justify-between items-center py-1"
                          style={{ borderBottom: i < businessHours.length - 1 ? '1px solid color-mix(in srgb, var(--color-text) 5%, transparent)' : 'none' }}>
                          <span className="font-medium" style={{ color: 'var(--color-text)' }}>{hour.dayOfWeek}</span>
                          <span style={{ color: hour.opens === 'Closed' ? 'var(--color-muted)' : 'var(--color-text)' }}>
                            {hour.opens === 'Closed' ? 'Closed' : `${hour.opens} - ${hour.closes}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Map */}
                {contact.address && (
                  <div className="rounded-xl overflow-hidden border"
                    style={{ borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                    <iframe
                      src={`https://www.google.com/maps?q=${encodeURIComponent(contact.address)}&output=embed`}
                      className="w-full h-[300px] border-0"
                      allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                  </div>
                )}
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </>
  )
}
