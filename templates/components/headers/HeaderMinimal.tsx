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
  const logoUrl = config?.brandAssets?.logoUrl || config?.logoUrl || ''
  // Header brand display: logo + name, name only, or logo only
  const logoMode = config?.brandAssets?.logoMode || config?.logoMode || (logoUrl ? 'both' : 'text')
  const showLogo = !!logoUrl && logoMode !== 'text'
  const showName = logoMode !== 'logo'
  const serviceSubpages = config?.serviceSubpages
  const serviceItems = serviceSubpages?.enabled && Array.isArray(serviceSubpages.items)
    ? serviceSubpages.items.filter((i: any) => i && (i.slug || i.label))
    : []
  const nav = config?.navigation || {}

  const navLinks = [
    { href: '/', label: nav.home || 'Home' },
    { href: '/services', label: nav.services || 'Services' },
    { href: '/about', label: nav.about || 'About' },
    { href: '/contact', label: nav.contact || 'Contact' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50" style={{ background: 'var(--color-bg)', borderBottom: '1px solid color-mix(in srgb, var(--color-text) 8%, transparent)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="text-lg font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
            <span className="inline-flex items-center gap-3">
              {showLogo && (
                <img src={logoUrl} alt={businessName} className="h-10 w-auto object-contain" />
              )}
              {showName && <span>{businessName}</span>}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => {
              const isActive = pathname === link.href
              return (
                <Link key={link.href} href={link.href}
                  className="text-xs font-medium uppercase tracking-wider transition-all duration-300 hover:opacity-90 relative group py-1"
                  style={{ 
                    color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                    fontWeight: isActive ? 600 : 500
                  }}>
                  {link.label}
                  <span 
                    className="absolute left-0 right-0 -bottom-1 h-0.5 rounded-full transition-all duration-300"
                    style={{ 
                      background: 'var(--color-primary-cta)',
                      transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                      opacity: isActive ? 1 : 0
                    }} 
                  />
                  <span 
                    className="absolute left-0 right-0 -bottom-1 h-0.5 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-30"
                    style={{ background: 'var(--color-text)', transform: 'scaleX(0)' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scaleX(1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scaleX(0)'}
                  />
                </Link>
              )
            })}
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

      <div 
        className="md:hidden fixed left-0 right-0 transition-all duration-300 overflow-hidden"
        style={{ 
          top: '3.5rem',
          maxHeight: menuOpen ? '400px' : '0',
          opacity: menuOpen ? 1 : 0,
          background: 'color-mix(in srgb, var(--color-bg) 95%, transparent)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: menuOpen ? '1px solid color-mix(in srgb, var(--color-text) 10%, transparent)' : 'none',
          boxShadow: menuOpen ? 'var(--shadow-lg)' : 'none'
        }}>
        <div className="px-4 py-3 space-y-2">
          {navLinks.map((link, i) => {
            const isActive = pathname === link.href
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className="block py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200"
                style={{ 
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                  background: isActive ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  transform: menuOpen ? 'translateY(0)' : 'translateY(-10px)',
                  opacity: menuOpen ? 1 : 0,
                  transitionDelay: menuOpen ? `${i * 30}ms` : '0ms'
                }}
                onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>
    </header>
  )
}
