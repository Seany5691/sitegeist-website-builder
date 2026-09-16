'use client'

import { useState } from 'react'
import { m } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle } from 'lucide-react'

const businessHours = [
  { day: 'Monday - Friday', hours: '08:00 - 17:00' },
  { day: 'Saturday', hours: '09:00 - 14:00' },
  { day: 'Sunday', hours: 'Closed' },
]

function isOpenNow(): boolean {
  const now = new Date()
  const day = now.getDay()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const time = hour + minute / 60

  if (day === 0) return false
  if (day === 6) return time >= 9 && time < 14
  return time >= 8 && time < 17
}

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const open = isOpenNow()

  return (
    <section id="contact" className="relative py-20 md:py-28 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-primary/80 mb-3 block">
            Get In Touch
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mb-4">
            Contact Us
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Ready to secure your property? Get a free consultation and quote today.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3"
          >
            <div className="p-6 sm:p-8 bg-white/[0.03] border border-white/[0.06] rounded-2xl backdrop-blur-sm">
              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-xl font-heading font-bold text-white mb-2">
                    Thank You!
                  </h3>
                  <p className="text-gray-400">
                    We&apos;ll respond within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
                        placeholder="Your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Service Interest</label>
                      <select
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors"
                      >
                        <option value="">Select a service</option>
                        <option value="armed-response">Armed Response</option>
                        <option value="drone-surveillance">Drone Surveillance</option>
                        <option value="static-guarding">Static Guarding</option>
                        <option value="business-security">Business Security</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Message</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                      placeholder="Tell us about your security needs..."
                    />
                  </div>
                  {/* Honeypot */}
                  <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 bg-primary text-slate-950 font-semibold rounded-xl hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </m.div>

          {/* Contact Info */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Quick Contact */}
            <div className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
              <h3 className="text-lg font-heading font-bold text-white mb-4">Quick Contact</h3>
              <div className="space-y-4">
                <a
                  href="tel:0140040336"
                  className="flex items-center gap-3 text-gray-300 hover:text-primary transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">014 004 0336</p>
                    <p className="text-xs text-gray-500">Click to call</p>
                  </div>
                </a>
                <a
                  href="https://wa.me/27140040336"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-300 hover:text-whatsapp transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-whatsapp/10 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-whatsapp" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">WhatsApp</p>
                    <p className="text-xs text-gray-500">Chat with us</p>
                  </div>
                </a>
                <a
                  href="mailto:contact@lekwasecurityservices.co.za"
                  className="flex items-center gap-3 text-gray-300 hover:text-primary transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">contact@lekwasecurityservices.co.za</p>
                    <p className="text-xs text-gray-500">Email us</p>
                  </div>
                </a>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Lephalale</p>
                    <p className="text-xs text-gray-500">Limpopo, South Africa</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-heading font-bold text-white">Business Hours</h3>
                <span className={`flex items-center gap-1.5 text-xs font-medium ${open ? 'text-emerald-400' : 'text-red-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${open ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  {open ? 'Open Now' : 'Closed'}
                </span>
              </div>
              <div className="space-y-2">
                {businessHours.map((item) => (
                  <div key={item.day} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{item.day}</span>
                    <span className="text-white font-medium">{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  )
}
