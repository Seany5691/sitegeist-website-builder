'use client'

import { useSiteData } from '@/lib/use-site-data'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function HeaderSolid() {
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
  const phone = config?.contact?.phone || ''

  const navLinks = [
    { href: '/', label: nav.home || 'Home' },
    { href: '/services', label: nav.services || 'Services' },
    { href: '/portfolio', label: nav.portfolio || 'Portfolio' },
    { href: '/about', label: nav.about || 'About' },
    { href: '/contact', label: nav.contact || 'Contact' },
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}
      style={{ background: scrolled ? 'color-mix(in srgb, var(--color-bg) 95%, transparent)' : 'var(--color-bg)', backdropFilter: scrolled ? 'blur(12px)' : 'none' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="text-xl font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
            <span className="inline-flex items-center gap-3">
              {showLogo && (
                <img src={logoUrl} alt={businessName} className="h-10 w-auto object-contain" />
              )}
              {showName && <span>{businessName}</span>}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => {
              const isActive = pathname === link.href
              return (
                <Link key={link.href} href={link.href}
                  className="text-sm font-medium transition-all duration-300 hover:opacity-90 relative group py-1"
                  style={{ 
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                    fontWeight: isActive ? 600 : 500
                  }}>
                  {link.label}
                  {/* Active indicator */}
                  <span 
                    className="absolute left-0 right-0 -bottom-1 h-0.5 rounded-full transition-all duration-300"
                    style={{ 
                      background: 'var(--color-primary-cta)',
                      transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                      opacity: isActive ? 1 : 0
                    }} 
                  />
                  {/* Hover indicator */}
                  <span 
                    className="absolute left-0 right-0 -bottom-1 h-0.5 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-30"
                    style={{ background: 'var(--color-text)', transform: 'scaleX(0)' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scaleX(1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scaleX(0)'}
                  />
                </Link>
              )
            })}
            {phone && (
              <a href={`tel:${phone}`} className="btn btn-sm btn-primary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Now
              </a>
            )}
          </nav>

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}
            style={{ color: 'var(--color-text)' }}>
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu — Frosted glass with slide animation */}
      <div 
        className="md:hidden fixed left-0 right-0 transition-all duration-300 overflow-hidden"
        style={{ 
          top: '4rem',
          maxHeight: menuOpen ? '400px' : '0',
          opacity: menuOpen ? 1 : 0,
          background: 'color-mix(in srgb, var(--color-bg) 95%, transparent)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: menuOpen ? '1px solid color-mix(in srgb, var(--color-text) 10%, transparent)' : 'none',
          boxShadow: menuOpen ? 'var(--shadow-lg)' : 'none'
        }}>
        <div className="px-4 py-4 space-y-2">
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
          {phone && (
            <a 
              href={`tel:${phone}`}
              className="block py-3 px-4 text-sm font-medium rounded-lg text-center mt-4"
              style={{
                background: 'var(--color-primary-cta)',
                color: 'var(--color-bg)',
                transform: menuOpen ? 'translateY(0)' : 'translateY(-10px)',
                opacity: menuOpen ? 1 : 0,
                transitionDelay: menuOpen ? `${navLinks.length * 30}ms` : '0ms'
              }}
              onClick={() => setMenuOpen(false)}>
              📞 Call Now
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
