'use client'

import { m } from 'framer-motion'
import { Shield, Linkedin } from 'lucide-react'

const team = [
  {
    name: 'John Mashigo',
    role: 'Owner & Director',
    bio: 'Leading Lekwa Security Services with a vision for reliable, technology-driven security solutions in Lephalale.',
  },
]

export default function Team() {
  return (
    <section className="relative py-20 md:py-28 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-primary/80 mb-3 block">
            Leadership
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white">
            Meet Our Team
          </h2>
        </div>

        {/* Team Grid */}
        <div className="flex justify-center">
          {team.map((member) => (
            <m.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-sm w-full text-center"
            >
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                <Shield className="w-12 h-12 text-primary/60" />
              </div>
              <h3 className="text-xl font-heading font-bold text-white mb-1">
                {member.name}
              </h3>
              <p className="text-sm text-primary/80 mb-3">{member.role}</p>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {member.bio}
              </p>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  )
}
