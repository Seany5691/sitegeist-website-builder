'use client'

import dynamic from 'next/dynamic'
import { useSiteData } from '@/lib/use-site-data'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'
import { useState } from 'react'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })
const WhatsAppWidget = dynamic(() => import('@/components/WhatsAppWidget'), { ssr: false })

export default function ContactPage() {
  const { config } = useSiteData()
  const contact = config?.contact || {}
  const hours = config?.businessHours || []
  const pc = config?.pageContent || {}
  const social = config?.socialLinks || {}

  const sectionTitle = pc.contactTitle || 'Get In Touch'
  const sectionDescription = pc.contactDescription || 'Ready to order? Reach out and let\'s create something delicious together.'

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
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Header */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1920&q=80)' }} />
          <div className="absolute inset-0" style={{ background: 'color-mix(in srgb, var(--color-primary) 85%, transparent)' }} />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimateOnScroll>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider"
                style={{ background: 'var(--color-accent)', color: 'var(--color-primary)' }}>
                Contact Us
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em' }}>
                {sectionTitle}
              </h1>
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                {sectionDescription}
              </p>
            </AnimateOnScroll>
          </div>
        </section>

        {/* Contact Content */}
        <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Form */}
              <AnimateOnScroll>
                <form onSubmit={handleSubmit} className="rounded-2xl p-8 border space-y-5"
                  style={{ background: 'color-mix(in srgb, var(--color-primary) 2%, var(--color-bg))', borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                  <div>
                    <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                      Send Us a Message
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--color-muted)' }}>We respond to every message within a few hours.</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="form-label">Your Name</label>
                      <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                        className="form-input" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="form-label">Email Address</label>
                      <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                        className="form-input" placeholder="your@email.com" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Phone Number</label>
                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="form-input" placeholder="Your phone number" />
                  </div>
                  <div>
                    <label className="form-label">How Can We Help?</label>
                    <textarea required rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                      className="form-input" style={{ resize: 'none' }}
                      placeholder="Tell us about your event, cake ideas, or any questions..." />
                  </div>
                  <button type="submit" disabled={status === 'sending'} className="btn btn-lg btn-primary w-full">
                    {status === 'sent' ? 'Thank you! We\'ll be in touch soon.' : status === 'sending' ? 'Sending...' : 'Send Message'}
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
                        <h3 className="font-bold mb-1" style={{ color: 'var(--color-text)' }}>Call or WhatsApp</h3>
                        <a href={`tel:${contact.phone}`} className="text-lg font-medium" style={{ color: 'var(--color-primary)' }}>
                          {contact.phone}
                        </a>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>We answer during business hours</p>
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
                        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>Exact address provided upon order confirmation</p>
                      </div>
                    </div>
                  )}

                  {social.facebook && (
                    <div className="flex items-start gap-4 p-5 rounded-xl border"
                      style={{ borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                        <svg className="w-6 h-6" style={{ color: 'var(--color-primary)' }} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold mb-1" style={{ color: 'var(--color-text)' }}>Facebook</h3>
                        <a href={social.facebook} target="_blank" rel="noopener noreferrer"
                          className="text-sm" style={{ color: 'var(--color-primary)' }}>
                          Follow us on Facebook
                        </a>
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
      </main>
      <Footer />
      <WhatsAppWidget />
    </>
  )
}
