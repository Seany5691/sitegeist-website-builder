'use client'

import { m } from 'framer-motion'
import { Shield, Radio, Users, Building2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const services = [
  {
    icon: Shield,
    title: 'Armed Response',
    description: 'Rapid armed response units available 24/7. Immediate reaction to any alarm activation or security breach, ensuring your safety and property security.',
    color: 'from-red-500/20 to-red-600/5',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
  },
  {
    icon: Radio,
    title: 'Drone Security & Aerial Surveillance',
    description: 'Cutting-edge drone technology for superior oversight. Large-area perimeter monitoring, after-hours site patrols, and detailed aerial assessments.',
    color: 'from-blue-500/20 to-blue-600/5',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
  },
  {
    icon: Users,
    title: 'Static Security & Guarding',
    description: 'Professional static guarding services providing a constant, visible deterrent. Trained officers skilled in access control, patrol procedures, and incident reporting.',
    color: 'from-primary/20 to-primary/5',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    icon: Building2,
    title: 'Business Security Solutions',
    description: 'Integrated security strategies for businesses. From risk assessments to deployment of response teams and surveillance, we create secure environments.',
    color: 'from-emerald-500/20 to-emerald-600/5',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function Services() {
  return (
    <section id="services" className="relative py-20 md:py-28 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-primary/80 mb-3 block">
            What We Offer
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mb-4">
            Comprehensive Security Services
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            From rapid armed response to advanced drone surveillance, we deliver
            complete protection solutions tailored to your needs.
          </p>
        </div>

        {/* Cards */}
        <m.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {services.map((service) => (
            <m.div
              key={service.title}
              variants={cardVariants}
              className="group relative p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl ${service.iconBg} flex items-center justify-center mb-5`}>
                <service.icon className={`w-6 h-6 ${service.iconColor}`} />
              </div>
              <h3 className="text-lg font-heading font-bold text-white mb-3">
                {service.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                {service.description}
              </p>
              <Link
                href="/services"
                className="inline-flex items-center gap-1 text-sm text-primary/70 hover:text-primary transition-colors"
              >
                Learn more <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </m.div>
          ))}
        </m.div>
      </div>
    </section>
  )
}
