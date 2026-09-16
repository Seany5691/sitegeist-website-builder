'use client'

import { useSiteData } from '@/lib/use-site-data'
import Link from 'next/link'

export default function FooterDark() {
  const { config } = useSiteData()
  const businessName = config?.businessName || 'Business'
  const contact = config?.contact || {}
  const social = config?.socialLinks || {}
  const services = config?.services || []

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <footer style={{ background: '#0a0a0a', color: '#fff' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>{businessName}</h3>
            <p className="text-white/50 text-sm leading-relaxed">{config?.hero?.subheadline || ''}</p>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-white/70">Navigation</h4>
            <nav className="space-y-2">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} className="block text-white/50 hover:text-white text-sm transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-white/70">Services</h4>
            <ul className="space-y-2">
              {services.slice(0, 5).map((s: any, i: number) => (
                <li key={i} className="text-white/50 text-sm">{s.title}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-white/70">Contact</h4>
            <ul className="space-y-2">
              {contact.phone && <li><a href={`tel:${contact.phone}`} className="text-white/50 hover:text-white text-sm transition-colors">{contact.phone}</a></li>}
              {contact.email && <li><a href={`mailto:${contact.email}`} className="text-white/50 hover:text-white text-sm transition-colors">{contact.email}</a></li>}
              {contact.address && <li className="text-white/50 text-sm">{contact.address}</li>}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-sm">&copy; {new Date().getFullYear()} {businessName}</p>
          <div className="flex gap-4">
            {social.facebook && <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white text-sm transition-colors">Facebook</a>}
            {social.instagram && <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white text-sm transition-colors">Instagram</a>}
          </div>
        </div>
      </div>
    </footer>
  )
}
