import { m } from 'framer-motion'
import { Shield, Radio, Users, Building2, Phone, ArrowRight, CheckCircle2 } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

export const dynamic = 'force-dynamic'

const services = [
  {
    icon: Shield,
    title: 'Armed Response',
    description: 'Our rapid armed response units are available 24 hours a day, 7 days a week. We provide a decisive and immediate reaction to any alarm activation or security breach, ensuring your safety and the security of your property.',
    features: ['24/7 availability', 'Rapid deployment', 'GPS-tracked units', 'Alarm response', 'Incident reporting'],
    color: 'from-red-500/20 to-red-600/5',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
  },
  {
    icon: Radio,
    title: 'Drone Security & Aerial Surveillance',
    description: 'Utilize cutting-edge technology for superior oversight. Our drone services offer large-area perimeter monitoring, after-hours site patrols, and detailed aerial assessments to identify vulnerabilities and enhance situational awareness.',
    features: ['Large-area coverage', 'Night vision capable', 'Thermal imaging', 'Perimeter monitoring', 'Detailed assessments'],
    color: 'from-blue-500/20 to-blue-600/5',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
  },
  {
    icon: Users,
    title: 'Static Security & Guarding',
    description: 'Provide a constant, visible deterrent with our professional static guarding services. Our trained officers are skilled in access control, patrol procedures, and incident reporting for commercial, industrial, and residential sites.',
    features: ['Access control', 'Regular patrols', 'Incident reporting', 'Visitor management', 'Emergency response'],
    color: 'from-primary/20 to-primary/5',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    icon: Building2,
    title: 'Business Security Solutions',
    description: 'We design and implement integrated security strategies for businesses. From risk assessments to the deployment of response teams and surveillance, we create secure environments that allow your business to thrive.',
    features: ['Risk assessments', 'Custom solutions', 'Integrated systems', 'Staff training', 'Ongoing support'],
    color: 'from-emerald-500/20 to-emerald-600/5',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
  },
]

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-xs font-semibold tracking-widest uppercase text-primary/80 mb-3 block">
                Our Services
              </span>
              <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-6">
                Comprehensive Security Solutions
              </h1>
              <p className="text-gray-400 text-lg">
                From rapid armed response to advanced drone surveillance, we deliver
                complete protection solutions tailored to your needs in Lephalale.
              </p>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-20 md:py-28 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-16">
              {services.map((service, i) => (
                <div
                  key={service.title}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${
                    i % 2 === 1 ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                    <div className={`w-14 h-14 rounded-xl ${service.iconBg} flex items-center justify-center mb-5`}>
                      <service.icon className={`w-7 h-7 ${service.iconColor}`} />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-4">
                      {service.title}
                    </h2>
                    <p className="text-gray-400 leading-relaxed mb-6">
                      {service.description}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {service.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-sm text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={`${i % 2 === 1 ? 'lg:order-1' : ''} p-8 bg-gradient-to-br ${service.color} border border-white/[0.06] rounded-2xl`}>
                    <div className="aspect-square rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                      <service.icon className={`w-24 h-24 ${service.iconColor} opacity-20`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-slate-950">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-heading font-bold text-white mb-4">
              Ready to Secure Your Property?
            </h2>
            <p className="text-gray-400 mb-8">
              Contact us today for a free consultation and quote tailored to your security needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:0140040336"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-slate-950 font-semibold rounded-xl hover:bg-secondary transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call Now: 014 004 0336
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
              >
                Get a Quote <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppWidget />
    </>
  )
}
