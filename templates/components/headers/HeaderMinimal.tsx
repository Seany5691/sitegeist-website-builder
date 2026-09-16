'use client'

import { useSiteData } from '@/lib/use-site-data'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function HeaderMinimal() {
  const { config } = useSiteData()
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

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
                className="text-xs font-medium uppercase tracking-wider transition-colors hover:opacity-80 relative"
                style={{ color: pathname === link.href ? 'var(--color-primary)' : 'var(--color-muted)' }}>
                {link.label}
                {pathname === link.href && <span className="absolute left-0 right-0 -bottom-1 h-0.5" style={{ background: 'var(--color-primary)' }} />}
              </Link>
            ))}
          </nav>

          <button className="md:hidden p-2" style={{ color: 'var(--color-text)' }} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      <div className="md:hidden overflow-hidden transition-all duration-300 glass"
        style={{ maxHeight: menuOpen ? '400px' : '0', opacity: menuOpen ? 1 : 0, borderTop: menuOpen ? '1px solid color-mix(in srgb, var(--color-text) 8%, transparent)' : 'none' }}>
        <div className="px-4 py-3 space-y-2">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="block py-2 text-sm"
              style={{ color: 'var(--color-muted)' }} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
