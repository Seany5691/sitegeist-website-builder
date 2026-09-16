import { m } from 'framer-motion'
import { Shield, Award, Clock, Users, Target, Eye, Heart } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

export const dynamic = 'force-dynamic'

const stats = [
  { icon: Shield, value: '24/7', label: 'Monitoring & Response' },
  { icon: Award, value: 'PSiRA', label: 'Registered & Compliant' },
  { icon: Clock, value: '<5min', label: 'Average Response Time' },
  { icon: Users, value: '100%', label: 'Client Satisfaction' },
]

const values = [
  {
    icon: Target,
    title: 'Reliability',
    description: 'We are always there when you need us. Our commitment to reliability means your security is never compromised.',
  },
  {
    icon: Eye,
    title: 'Vigilance',
    description: 'Constant watchfulness is at the core of what we do. We stay alert so you can rest easy.',
  },
  {
    icon: Heart,
    title: 'Community Trust',
    description: 'Building strong relationships with the Lephalale community through consistent, quality service.',
  },
]

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-xs font-semibold tracking-widest uppercase text-primary/80 mb-3 block">
                About Us
              </span>
              <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-6">
                Your Vigilant Partner in Security
              </h1>
              <p className="text-gray-400 text-lg">
                Established to fill a critical need for professional, responsive security
                services in Lephalale, Lekwa Security Services has grown under John
                Mashigo&apos;s leadership.
              </p>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 md:py-28 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-heading font-bold text-white mb-6">Our Story</h2>
                <div className="space-y-4 text-gray-400 leading-relaxed">
                  <p>
                    Lekwa Security Services was established to address a critical gap in
                    professional security services in the Lephalale region. Under the leadership
                    of John Mashigo, the company has grown by focusing on three core principles:
                    reliability, advanced technology, and community trust.
                  </p>
                  <p>
                    Today, we serve businesses and residents throughout Lephalale and the
                    surrounding areas in Limpopo, providing a comprehensive range of security
                    solutions from rapid armed response to cutting-edge drone surveillance.
                  </p>
                  <p>
                    Our commitment to excellence and our deep understanding of local security
                    needs make us the trusted choice for protection in the region.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-center"
                  >
                    <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                    <p className="text-2xl font-heading font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 md:py-28 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-heading font-bold text-white mb-4">Our Values</h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                The principles that guide everything we do.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {values.map((value, i) => (
                <div
                  key={value.title}
                  className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-white mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-400">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership */}
        <section className="py-20 md:py-28 bg-slate-900/50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-heading font-bold text-white mb-12">Leadership</h2>
            <div>
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                <Shield className="w-12 h-12 text-primary/60" />
              </div>
              <h3 className="text-xl font-heading font-bold text-white mb-1">John Mashigo</h3>
              <p className="text-sm text-primary/80 mb-4">Owner & Director</p>
              <p className="text-gray-400 leading-relaxed">
                Leading Lekwa Security Services with a vision for reliable, technology-driven
                security solutions in Lephalale. John&apos;s commitment to excellence and community
                safety drives every aspect of our operations.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppWidget />
    </>
  )
}
