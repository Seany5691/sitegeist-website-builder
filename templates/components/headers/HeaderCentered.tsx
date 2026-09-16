'use client'

import { useSiteData } from '@/lib/use-site-data'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function HeaderCentered() {
  const { config } = useSiteData()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const businessName = config?.businessName || 'Business'
  const phone = config?.contact?.phone || ''

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}
      style={{ background: scrolled ? 'color-mix(in srgb, var(--color-bg) 95%, transparent)' : 'var(--color-bg)', backdropFilter: scrolled ? 'blur(12px)' : 'none' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top: Brand centered */}
        <div className="text-center py-3" style={{ borderBottom: '1px solid color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
          <Link href="/" className="text-2xl font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
            {businessName}
          </Link>
        </div>

        {/* Bottom: Nav */}
        <nav className="hidden md:flex items-center justify-center gap-8 py-3">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}
              className="text-sm font-medium transition-colors hover:opacity-80 relative"
              style={{ color: pathname === link.href ? 'var(--color-primary)' : 'var(--color-text)' }}>
              {link.label}
              {pathname === link.href && <span className="absolute left-0 right-0 -bottom-1 h-0.5" style={{ background: 'var(--color-primary)' }} />}
            </Link>
          ))}
          {phone && (
            <a href={`tel:${phone}`} className="btn btn-sm btn-primary">
              Call Now
            </a>
          )}
        </nav>

        {/* Mobile */}
        <div className="md:hidden flex items-center justify-between py-2">
          <div />
          <button className="p-2" style={{ color: 'var(--color-text)' }} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      <div className="md:hidden overflow-hidden transition-all duration-300 glass"
        style={{ maxHeight: menuOpen ? '400px' : '0', opacity: menuOpen ? 1 : 0, borderTop: menuOpen ? '1px solid color-mix(in srgb, var(--color-text) 8%, transparent)' : 'none' }}>
        <div className="px-4 py-4 space-y-3">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="block py-2 text-sm font-medium text-center"
              style={{ color: 'var(--color-text)' }} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
