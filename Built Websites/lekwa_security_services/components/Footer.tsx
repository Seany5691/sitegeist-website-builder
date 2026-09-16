'use client'

import { Shield, Phone, Mail, MapPin, ArrowUp } from 'lucide-react'
import Link from 'next/link'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="relative bg-slate-950 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Shield className="w-5 h-5 text-slate-950" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-white font-heading leading-none">
                  Lekwa Security
                </span>
                <span className="text-[10px] text-primary/80 tracking-widest uppercase">
                  Services
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Your vigilant partner in security. Providing reliable armed response,
              drone surveillance, and professional guarding services in Lephalale.
            </p>
            <p className="text-xs text-gray-600">
              PSiRA Registered | Fully Compliant
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2">
              {['Armed Response', 'Drone Surveillance', 'Static Guarding', 'Business Security'].map((service) => (
                <li key={service}>
                  <Link
                    href="/services"
                    className="text-sm text-gray-500 hover:text-primary transition-colors"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
            <div className="space-y-3">
              <a
                href="tel:0140040336"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                014 004 0336
              </a>
              <a
                href="mailto:contact@lekwasecurityservices.co.za"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                contact@lekwasecurityservices.co.za
              </a>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                Lephalale, Limpopo
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Lekwa Security Services. All rights reserved.
          </p>
          <button
            onClick={scrollToTop}
            className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Back to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  )
}
