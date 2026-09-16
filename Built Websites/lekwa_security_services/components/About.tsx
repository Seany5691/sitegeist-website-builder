'use client'

import { m } from 'framer-motion'
import { Shield, Award, Clock, Users } from 'lucide-react'

const stats = [
  { icon: Shield, value: '24/7', label: 'Monitoring' },
  { icon: Award, value: 'PSiRA', label: 'Registered' },
  { icon: Clock, value: '<5min', label: 'Response Time' },
  { icon: Users, value: '100%', label: 'Compliant' },
]

export default function About() {
  return (
    <section id="about" className="relative py-20 md:py-28 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <m.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-semibold tracking-widest uppercase text-primary/80 mb-3 block">
              About Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-6">
              Your Vigilant Partner in Security
            </h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              Established to fill a critical need for professional, responsive security
              services in Lephalale, Lekwa Security Services has grown under John
              Mashigo&apos;s leadership by focusing on reliability, advanced technology,
              and building strong community trust.
            </p>
            <p className="text-gray-400 leading-relaxed mb-8">
              We combine local expertise with cutting-edge technology, including drone
              surveillance, to deliver security solutions that truly protect what matters
              most to our clients across the Lephalale region.
            </p>

            {/* Specializations */}
            <div className="space-y-3">
              {[
                'Rapid Armed Response',
                'Commercial & Industrial Site Security',
                'Drone-Based Surveillance & Patrols',
                '24/7 Security Monitoring and Response',
              ].map((spec) => (
                <div key={spec} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-sm text-gray-300">{spec}</span>
                </div>
              ))}
            </div>
          </m.div>

          {/* Stats Grid */}
          <m.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-center hover:bg-white/[0.06] transition-colors"
              >
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-2xl font-heading font-bold text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </m.div>
        </div>
      </div>
    </section>
  )
}
