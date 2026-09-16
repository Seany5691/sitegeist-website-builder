'use client'

import { m } from 'framer-motion'
import { Phone, MessageCircle, Shield, Clock, MapPin } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(238,207,145,0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(238,207,145,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        {/* Radial glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="max-w-3xl">
          {/* Badge */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-400 tracking-wide">
              Locally Operated | Fully Compliant | Rapid Response
            </span>
          </m.div>

          {/* Headline */}
          <m.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-[1.1] tracking-tight mb-6"
          >
            Trusted Security Solutions{' '}
            <span className="text-primary">for Lephalale</span>{' '}
            & Beyond
          </m.h1>

          {/* Subheadline */}
          <m.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-gray-400 leading-relaxed mb-10 max-w-xl"
          >
            Providing reliable armed response, advanced drone surveillance, and
            professional guarding services to protect what matters most to you, 24/7.
          </m.p>

          {/* CTAs */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <a
              href="tel:0140040336"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-slate-950 font-semibold rounded-xl hover:bg-secondary transition-all duration-200 hover:shadow-lg hover:shadow-primary/20"
            >
              <Phone className="w-5 h-5" />
              Call Now: 014 004 0336
            </a>
            <a
              href="https://wa.me/27140040336"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp Us
            </a>
          </m.div>

          {/* Trust Signals */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap gap-6"
          >
            {[
              { icon: Shield, label: 'PSiRA Registered' },
              { icon: Clock, label: '24/7 Response' },
              { icon: MapPin, label: 'Lephalale Based' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm text-gray-500">
                <item.icon className="w-4 h-4 text-primary/60" />
                <span>{item.label}</span>
              </div>
            ))}
          </m.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
    </section>
  )
}
