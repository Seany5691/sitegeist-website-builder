'use client'

import { useSiteData } from '@/lib/use-site-data'
import { useState } from 'react'
import Link from 'next/link'

export default function HeaderMinimal() {
  const { config } = useSiteData()
  const [menuOpen, setMenuOpen] = useState(false)

  const businessName = config?.businessName || 'Business'

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50" style={{ background: 'var(--color-bg)', borderBottom: '1px solid color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="text-lg font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
            {businessName}
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className="text-xs font-medium uppercase tracking-wider transition-colors hover:opacity-80"
                style={{ color: 'var(--color-muted)' }}>
                {link.label}
              </Link>
            ))}
          </nav>

          <button className="md:hidden p-2" style={{ color: 'var(--color-text)' }} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t" style={{ background: 'var(--color-bg)', borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
          <div className="px-4 py-3 space-y-2">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="block py-2 text-sm"
                style={{ color: 'var(--color-muted)' }} onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
