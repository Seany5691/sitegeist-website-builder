'use client'

import { useSiteData } from '@/lib/use-site-data'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function HeaderSplit() {
  const { config } = useSiteData()
  const [menuOpen, setMenuOpen] = useState(false)

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
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Left brand bar */}
      <div className="flex">
        <div className="w-1/3 py-4 px-6 hidden lg:flex items-center" style={{ background: 'var(--color-primary)' }}>
          <Link href="/" className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            {businessName}
          </Link>
        </div>

        {/* Right nav bar */}
        <div className="flex-1 lg:w-2/3 py-4 px-6" style={{ background: 'var(--color-bg)' }}>
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold lg:hidden" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
              {businessName}
            </Link>

            <nav className="hidden md:flex items-center gap-8 mx-auto lg:mx-0">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href}
                  className="text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: 'var(--color-text)' }}>
                  {link.label}
                </Link>
              ))}
              {phone && (
                <a href={`tel:${phone}`} className="btn btn-sm btn-primary">
                  Call Now
                </a>
              )}
            </nav>

            <button className="md:hidden p-2" style={{ color: 'var(--color-text)' }} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden overflow-hidden transition-all duration-300"
        style={{ maxHeight: menuOpen ? '400px' : '0', opacity: menuOpen ? 1 : 0, borderTop: menuOpen ? '1px solid color-mix(in srgb, var(--color-text) 10%, transparent)' : 'none', background: 'var(--color-bg)' }}>
        <div className="px-4 py-4 space-y-3">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="block py-2 text-sm font-medium"
              style={{ color: 'var(--color-text)' }} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
